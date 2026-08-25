<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/NewsModel.php';
require_once __DIR__ . '/../services/NewsService.php';

class NewsController
{
    private PDO $pdo;

    private const MEDIA_TYPES = ['image', 'video'];
    private const SECTIONS = ['left', 'right'];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function list(): array
    {
        try {
            $posts = NewsModel::getAll($this->pdo);

            foreach ($posts as &$post) {
                if ($post['media_type'] === 'image' && !empty($post['image_path'])) {
                    $post['image_path'] = build_image_url($post['image_path']);
                }
            }
            unset($post);

            return ['success' => true, 'data' => $posts];
        } catch (Exception $e) {
            error_log("News list failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load news posts'];
        }
    }

    public function create(array $data, ?array $file): array
    {
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            return NewsService::createPost($this->pdo, $this->sanitize($data), $file);
        } catch (Exception $e) {
            error_log("News create failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to create news post'];
        }
    }

    public function update(int $id, array $data, ?array $file): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid ID'];
        }

        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            return NewsService::updatePost($this->pdo, $id, $this->sanitize($data), $file);
        } catch (Exception $e) {
            error_log("News update failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update news post'];
        }
    }

    public function delete(int $id): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid ID'];
        }

        try {
            return NewsService::deletePost($this->pdo, $id);
        } catch (Exception $e) {
            error_log("News delete failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete news post'];
        }
    }

    private function validate(array $data): array
    {
        $errors = [];

        $title = trim($data['title'] ?? '');
        if ($title === '') {
            $errors['title'] = 'Title is required';
        } elseif (strlen($title) > 128) {
            $errors['title'] = 'Title too long (max 128 characters)';
        }

        $article = $data['article'] ?? '';
        if (strlen($article) > 1000) {
            $errors['article'] = 'Article too long (max 1000 characters)';
        }

        $newsDate = $data['news_date'] ?? '';
        if (trim((string)$newsDate) === '') {
            $errors['news_date'] = 'Date is required';
        } elseif (strtotime($newsDate) === false) {
            $errors['news_date'] = 'Invalid date format';
        }

        $mediaType = $data['media_type'] ?? '';
        if (!in_array($mediaType, self::MEDIA_TYPES, true)) {
            $errors['media_type'] = 'Media type must be image or video';
        } elseif ($mediaType === 'video') {
            $embedCode = trim($data['embed_code'] ?? '');
            if ($embedCode === '') {
                $errors['embed_code'] = 'Embed code is required for video posts';
            }
        }

        $section = $data['section'] ?? '';
        if (!in_array($section, self::SECTIONS, true)) {
            $errors['section'] = 'Section must be left or right';
        }

        return $errors;
    }

    private function sanitize(array $data): array
    {
        return [
            'title' => trim($data['title']),
            'article' => isset($data['article']) ? trim($data['article']) : null,
            'news_date' => date('Y-m-d', strtotime($data['news_date'])),
            'media_type' => $data['media_type'],
            'embed_code' => isset($data['embed_code']) ? trim($data['embed_code']) : null,
            'section' => $data['section'],
        ];
    }
}
