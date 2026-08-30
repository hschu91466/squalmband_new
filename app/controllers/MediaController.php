<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/MediaModel.php';

class MediaController
{
    private PDO $pdo;

    private const PLATFORMS = ['youtube', 'spotify'];
    private const PLACEMENTS = ['featured', 'stream', 'list'];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * List media entries, optionally filtered by platform and/or placement.
     * Music admin calls this with platform=spotify, Videos admin with platform=youtube.
     */


    public function list(array $params): array
    {
        $platform = $params['platform'] ?? null;
        $placement = $params['placement'] ?? null;

        if ($platform !== null && !in_array($platform, self::PLATFORMS, true)) {
            return ['success' => false, 'message' => 'Invalid platform'];
        }

        if ($placement !== null && !in_array($placement, self::PLACEMENTS, true)) {
            return ['success' => false, 'message' => 'Invalid placement'];
        }

        try {
            $media = MediaModel::getAll($this->pdo, $platform, $placement);
            return ['success' => true, 'data' => $media];
        } catch (Exception $e) {
            error_log("Media list failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load media'];
        }
    }

    public function create(array $data): array
    {
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            $media = MediaModel::create($this->pdo, $this->sanitize($data));
            return ['success' => true, 'data' => $media, 'message' => 'Media created'];
        } catch (Exception $e) {
            error_log("Media create failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create media'];
        }
    }

    public function update(int $id, array $data): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid ID'];
        }

        $existing = MediaModel::getById($this->pdo, $id);
        if (!$existing) {
            return ['success' => false, 'message' => 'Media not found'];
        }

        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            MediaModel::update($this->pdo, $id, $this->sanitize($data));
            return ['success' => true, 'message' => 'Media updated'];
        } catch (Exception $e) {
            error_log("Media update failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update media'];
        }
    }

    public function delete(int $id): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid ID'];
        }

        $existing = MediaModel::getById($this->pdo, $id);
        if (!$existing) {
            return ['success' => false, 'message' => 'Media not found'];
        }

        try {
            MediaModel::delete($this->pdo, $id);
            return ['success' => true, 'message' => 'Media deleted'];
        } catch (Exception $e) {
            error_log("Media delete failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete media'];
        }
    }

    private function validate(array $data): array
    {
        $errors = [];

        $title = trim($data['title'] ?? '');
        if ($title === '') {
            $errors['title'] = 'Title is required';
        } elseif (strlen($title) > 255) {
            $errors['title'] = 'Title too long';
        }

        $platform = $data['platform'] ?? '';
        if (!in_array($platform, self::PLATFORMS, true)) {
            $errors['platform'] = 'Platform must be youtube or spotify';
        }

        $placement = $data['placement'] ?? '';
        if (!in_array($placement, self::PLACEMENTS, true)) {
            $errors['placement'] = 'Placement must be featured, stream, or list';
        }

        $embedCode = trim($data['embed_code'] ?? '');
        if ($embedCode === '') {
            $errors['embed_code'] = 'Embed code is required';
        } elseif (strlen($embedCode) > 500) {
            $errors['embed_code'] = 'Embed code too long';
        } elseif ($platform === 'youtube' && !isset($errors['embed_code'])) {
            // Only YouTube IDs get extracted/validated this way; Spotify embed codes
            // are handled separately below.
            if ($this->extractYouTubeId($embedCode) === null) {
                $errors['embed_code'] = 'Could not read a valid YouTube video ID from that link. Paste the full video URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID) or just the video ID, not a playlist link.';
            }
        } elseif ($platform === 'spotify' && !isset($errors['embed_code'])) {
            if ($this->extractSpotifyUri($embedCode) === null) {
                $errors['embed_code'] = 'Could not read a valid Spotify link. Paste the full Spotify link (e.g. https://open.spotify.com/artist/ID) or just type/album/ID, not a shortened link.';
            }
        }

        return $errors;
    }

    /**
     * Extract a bare 11-character YouTube video ID from admin input, which may be
     * a full watch URL, a youtu.be short link, a URL with playlist/extra params,
     * or already just the ID. Returns null if no valid ID can be found.
     */
    private function extractYouTubeId(string $input): ?string
    {
        $input = trim($input);

        // Already a bare 11-character ID
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', $input)) {
            return $input;
        }

        // Standard watch URL: pull the v= param, ignoring any other params after it
        // (playlist, timestamp, or even a second URL accidentally pasted in)
        if (preg_match('/[?&]v=([a-zA-Z0-9_-]{11})/', $input, $m)) {
            return $m[1];
        }

        // Short link: youtu.be/VIDEO_ID
        if (preg_match('#youtu\.be/([a-zA-Z0-9_-]{11})#', $input, $m)) {
            return $m[1];
        }

        // youtube.com/embed/VIDEO_ID (in case someone pastes an embed URL directly)
        if (preg_match('#youtube\.com/embed/([a-zA-Z0-9_-]{11})#', $input, $m)) {
            return $m[1];
        }

        return null;
    }

    /**
     * Extract a "type/id" Spotify URI (e.g. "artist/2cMMWuinHbQs0Bf1RTVNgH") from
     * admin input, which may be a full open.spotify.com link (with or without a
     * ?si= tracking param), an embed link, a spotify: URI, or already bare.
     * Handles artist, track, album, and playlist types. Returns null if unparseable.
     */
    private function extractSpotifyUri(string $input): ?string
    {
        $input = trim($input);
        $types = 'artist|track|album|playlist';

        // Already bare: type/id
        if (preg_match('/^(' . $types . ')\/([a-zA-Z0-9]+)$/', $input, $m)) {
            return $m[1] . '/' . $m[2];
        }

        // spotify:artist:ID style URI
        if (preg_match('/^spotify:(' . $types . '):([a-zA-Z0-9]+)$/', $input, $m)) {
            return $m[1] . '/' . $m[2];
        }

        // open.spotify.com/artist/ID or /embed/artist/ID, ignoring ?si= or other query params,
        // and ignoring anything pasted after it (e.g. a duplicated URL)
        if (preg_match('#open\.spotify\.com/(?:embed/)?(' . $types . ')/([a-zA-Z0-9]+)#', $input, $m)) {
            return $m[1] . '/' . $m[2];
        }

        return null;
    }

    private function sanitize(array $data): array
    {
        $embedCode = trim($data['embed_code']);
        if ($data['platform'] === 'youtube') {
            // validate() already confirmed this extracts cleanly; use the clean ID
            $embedCode = $this->extractYouTubeId($embedCode) ?? $embedCode;
        } elseif ($data['platform'] === 'spotify') {
            $embedCode = $this->extractSpotifyUri($embedCode) ?? $embedCode;
        }

        return [
            'title' => trim($data['title']),
            'description' => isset($data['description']) ? trim($data['description']) : null,
            'platform' => $data['platform'],
            'placement' => $data['placement'],
            'embed_code' => $embedCode,
            'is_cover' => !empty($data['is_cover']) ? 1 : 0,
            'sort_order' => (int)($data['sort_order'] ?? 0),
        ];
    }
}
