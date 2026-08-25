<?php

declare(strict_types=1);

require_once __DIR__ . '/ImageStorage.php';
require_once __DIR__ . '/../models/NewsModel.php';

class NewsService
{
    /**
     * Create a news post. For image posts, uploads the file to R2 first and
     * stores the resulting path. For video posts, just stores the embed code.
     * No file is expected for video posts.
     */
    public static function createPost(PDO $pdo, array $data, ?array $file): array
    {
        $imagePath = null;

        if ($data['media_type'] === 'image') {
            $uploadResult = self::uploadImage($file);
            if (!$uploadResult['success']) {
                return $uploadResult;
            }
            $imagePath = $uploadResult['path'];
        }

        $post = NewsModel::create($pdo, [
            'title' => $data['title'],
            'article' => $data['article'],
            'news_date' => $data['news_date'],
            'media_type' => $data['media_type'],
            'image_path' => $imagePath,
            'embed_code' => $data['media_type'] === 'video' ? $data['embed_code'] : null,
            'section' => $data['section'],
        ]);

        return ['success' => true, 'data' => $post, 'message' => 'News post created'];
    }

    /**
     * Update a news post. If it's an image post and a new file was uploaded,
     * the old R2 file is deleted and replaced. If media_type changed away
     * from 'image', any existing R2 file is cleaned up.
     */
    public static function updatePost(PDO $pdo, int $id, array $data, ?array $file): array
    {
        $existing = NewsModel::getById($pdo, $id);
        if (!$existing) {
            return ['success' => false, 'message' => 'News post not found'];
        }

        $imagePath = $existing['image_path'];

        if ($data['media_type'] === 'image') {
            // New file uploaded — replace the old one
            if ($file && !empty($file['tmp_name'])) {
                $uploadResult = self::uploadImage($file);
                if (!$uploadResult['success']) {
                    return $uploadResult;
                }

                if ($existing['image_path']) {
                    self::deleteImageFile($existing['image_path']);
                }

                $imagePath = $uploadResult['path'];
            }
            // else keep the existing image_path as-is
        } else {
            // Switched to (or stayed on) video — drop any old image file
            if ($existing['media_type'] === 'image' && $existing['image_path']) {
                self::deleteImageFile($existing['image_path']);
            }
            $imagePath = null;
        }

        NewsModel::update($pdo, $id, [
            'title' => $data['title'],
            'article' => $data['article'],
            'news_date' => $data['news_date'],
            'media_type' => $data['media_type'],
            'image_path' => $imagePath,
            'embed_code' => $data['media_type'] === 'video' ? $data['embed_code'] : null,
            'section' => $data['section'],
        ]);

        return ['success' => true, 'message' => 'News post updated'];
    }

    public static function deletePost(PDO $pdo, int $id): array
    {
        $existing = NewsModel::getById($pdo, $id);
        if (!$existing) {
            return ['success' => false, 'message' => 'News post not found'];
        }

        if ($existing['media_type'] === 'image' && $existing['image_path']) {
            self::deleteImageFile($existing['image_path']);
        }

        NewsModel::delete($pdo, $id);

        return ['success' => true, 'message' => 'News post deleted'];
    }

    private static function uploadImage(?array $file): array
    {
        if (!$file || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'message' => 'Image file is required'];
        }

        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        $mimeType = mime_content_type($file['tmp_name']);
        if (!in_array($mimeType, $allowed, true)) {
            return ['success' => false, 'message' => 'Invalid file type'];
        }

        $maxSize = 10 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'File too large'];
        }

        $fileName = uniqid() . '_' . basename($file['name']);
        $site = $_ENV['SITE_NAME'] ?? 'default';
        $uploadPath = "$site/images/news/" . $fileName;
        $relativePath = "images/news/" . $fileName;

        $success = uploadToR2($file['tmp_name'], $uploadPath);

        if (!$success) {
            return ['success' => false, 'message' => 'Upload failed'];
        }

        return ['success' => true, 'path' => $relativePath];
    }

    private static function deleteImageFile(string $relativePath): void
    {
        $site = $_ENV['SITE_NAME'] ?? 'default';
        $fullPath = $site . '/' . $relativePath;

        // Log-and-continue: a failed R2 delete shouldn't block the DB update/delete
        // from going through, but it should be visible so orphaned files can be cleaned up.
        if (!deleteFromR2($fullPath)) {
            error_log("News: failed to delete R2 file: " . $fullPath);
        }
    }
}
