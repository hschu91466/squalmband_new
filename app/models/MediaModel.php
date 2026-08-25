<?php

declare(strict_types=1);

class MediaModel
{
    /**
     * Get all media entries, optionally filtered by platform and/or placement.
     * Used by both Music admin (platform=spotify) and Videos admin (platform=youtube).
     */
    public static function getAll(PDO $pdo, ?string $platform = null, ?string $placement = null): array
    {
        $sql = "SELECT * FROM media WHERE 1=1";
        $params = [];

        if ($platform !== null) {
            $sql .= " AND platform = :platform";
            $params[':platform'] = $platform;
        }

        if ($placement !== null) {
            $sql .= " AND placement = :placement";
            $params[':placement'] = $placement;
        }

        $sql .= " ORDER BY sort_order ASC, created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get media entries for a specific placement (e.g. 'featured', 'stream', 'list'),
     * used by the public site sections (Home featured video, Stream page, Videos page).
     */
    public static function getByPlacement(PDO $pdo, string $placement, ?string $platform = null): array
    {
        return self::getAll($pdo, $platform, $placement);
    }

    public static function getById(PDO $pdo, int $id): ?array
    {
        $sql = "SELECT * FROM media WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public static function create(PDO $pdo, array $data): array
    {
        $sql = "INSERT INTO media (title, description, platform, placement, embed_code, is_cover, sort_order)
                VALUES (:title, :description, :platform, :placement, :embed_code, :is_cover, :sort_order)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'] ?? null,
            ':platform' => $data['platform'],
            ':placement' => $data['placement'],
            ':embed_code' => $data['embed_code'],
            ':is_cover' => $data['is_cover'] ?? false,
            ':sort_order' => $data['sort_order'] ?? 0,
        ]);

        return self::getById($pdo, (int)$pdo->lastInsertId());
    }

    public static function update(PDO $pdo, int $id, array $data): bool
    {
        $sql = "UPDATE media SET
                    title = :title,
                    description = :description,
                    platform = :platform,
                    placement = :placement,
                    embed_code = :embed_code,
                    is_cover = :is_cover,
                    sort_order = :sort_order
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':description' => $data['description'] ?? null,
            ':platform' => $data['platform'],
            ':placement' => $data['placement'],
            ':embed_code' => $data['embed_code'],
            ':is_cover' => $data['is_cover'] ?? false,
            ':sort_order' => $data['sort_order'] ?? 0,
        ]);
    }

    public static function delete(PDO $pdo, int $id): bool
    {
        $sql = "DELETE FROM media WHERE id = :id";
        $stmt = $pdo->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }
}
