<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/SiteContentModel.php';
require_once __DIR__ . '/../services/SiteContentService.php';

class SiteContentController
{
    private PDO $pdo;

    private const SECTION_KEYS = ['home', 'about'];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function list(): array
    {
        try {
            $sections = SiteContentModel::getAll($this->pdo);

            foreach ($sections as &$section) {
                if (!empty($section['image_path'])) {
                    $section['image_path'] = build_image_url($section['image_path']);
                }
            }
            unset($section);

            return ['success' => true, 'data' => $sections];
        } catch (Exception $e) {
            error_log("Site content list failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load site content'];
        }
    }

    public function update(string $sectionKey, array $data, ?array $file): array
    {
        if (!in_array($sectionKey, self::SECTION_KEYS, true)) {
            return ['success' => false, 'message' => 'Invalid section'];
        }

        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            return SiteContentService::updateSection($this->pdo, $sectionKey, $this->sanitize($data), $file);
        } catch (Exception $e) {
            error_log("Site content update failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update section'];
        }
    }

    private function validate(array $data): array
    {
        $errors = [];

        $title = trim($data['title'] ?? '');
        if (strlen($title) > 255) {
            $errors['title'] = 'Title too long (max 255 characters)';
        }

        $body = $data['body'] ?? '';
        if (strlen($body) > 2000) {
            $errors['body'] = 'Text too long (max 2000 characters)';
        }

        $imageAlt = trim($data['image_alt'] ?? '');
        if (strlen($imageAlt) > 255) {
            $errors['image_alt'] = 'Image description too long (max 255 characters)';
        }

        return $errors;
    }

    private function sanitize(array $data): array
    {
        return [
            'title' => isset($data['title']) ? trim($data['title']) : null,
            'body' => isset($data['body']) ? trim($data['body']) : null,
            'image_alt' => isset($data['image_alt']) ? trim($data['image_alt']) : null,
        ];
    }
}
