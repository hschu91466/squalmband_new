<?php

declare(strict_types=1);

require_once __DIR__ . '/ImageStorage.php';
require_once __DIR__ . '/../models/SiteContentModel.php';

class SiteContentService
{
    /**
     * Update a site content section. If a new file was uploaded, the old R2
     * file (if any) is deleted and replaced. If no file was uploaded, the
     * existing image_path/image_alt are kept as-is.
     */
    public static function updateSection(PDO $pdo, string $sectionKey, array $data, ?array $file): array
    {
        $existing = SiteContentModel::getBySection($pdo, $sectionKey);
        if (!$existing) {
            return ['success' => false, 'message' => 'Section not found'];
        }

        $imagePath = $existing['image_path'];
        $imageAlt = $data['image_alt'] ?? $existing['image_alt'];

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
        // else keep the existing image_path as-is (image is optional per update)

        SiteContentModel::update($pdo, $sectionKey, [
            'title' => $data['title'],
            'body' => $data['body'],
            'image_path' => $imagePath,
            'image_alt' => $imageAlt,
        ]);

        return ['success' => true, 'message' => ucfirst($sectionKey) . ' section updated'];
    }

    private static function uploadImage(array $file): array
    {
        if (empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
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
        $uploadPath = "$site/images/site-content/" . $fileName;
        $relativePath = "images/site-content/" . $fileName;

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

        // Log-and-continue: a failed R2 delete shouldn't block the DB update
        // from going through, but it should be visible so orphaned files can be cleaned up.
        if (!deleteFromR2($fullPath)) {
            error_log("SiteContent: failed to delete R2 file: " . $fullPath);
        }
    }
}
