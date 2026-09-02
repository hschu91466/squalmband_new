<?php

declare(strict_types=1);

class SiteContentModel
{
    public static function getAll(PDO $pdo): array
    {
        $sql = "SELECT * FROM site_content ORDER BY section_key ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getBySection(PDO $pdo, string $sectionKey): ?array
    {
        $sql = "SELECT * FROM site_content WHERE section_key = :section_key";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':section_key' => $sectionKey]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public static function update(PDO $pdo, string $sectionKey, array $data): bool
    {
        $sql = "UPDATE site_content SET
                    title = :title,
                    body = :body,
                    image_path = :image_path,
                    image_alt = :image_alt
                WHERE section_key = :section_key";

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':section_key' => $sectionKey,
            ':title' => $data['title'] ?? null,
            ':body' => $data['body'] ?? null,
            ':image_path' => $data['image_path'] ?? null,
            ':image_alt' => $data['image_alt'] ?? null,
        ]);
    }
}
