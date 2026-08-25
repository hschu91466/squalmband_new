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
        }

        return $errors;
    }

    private function sanitize(array $data): array
    {
        return [
            'title' => trim($data['title']),
            'description' => isset($data['description']) ? trim($data['description']) : null,
            'platform' => $data['platform'],
            'placement' => $data['placement'],
            'embed_code' => trim($data['embed_code']),
            'is_cover' => !empty($data['is_cover']) ? 1 : 0,
            'sort_order' => (int)($data['sort_order'] ?? 0),
        ];
    }
}
