<?php

declare(strict_types=1);

class NewsModel
{
    public static function getAll(PDO $pdo): array
    {
        $sql = "SELECT * FROM news ORDER BY news_date DESC, id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById(PDO $pdo, int $id): ?array
    {
        $sql = "SELECT * FROM news WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public static function create(PDO $pdo, array $data): array
    {
        $sql = "INSERT INTO news (title, article, news_date, media_type, image_path, embed_code, section)
                VALUES (:title, :article, :news_date, :media_type, :image_path, :embed_code, :section)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'],
            ':article' => $data['article'] ?? null,
            ':news_date' => $data['news_date'],
            ':media_type' => $data['media_type'],
            ':image_path' => $data['image_path'] ?? null,
            ':embed_code' => $data['embed_code'] ?? null,
            ':section' => $data['section'],
        ]);

        return self::getById($pdo, (int)$pdo->lastInsertId());
    }

    public static function update(PDO $pdo, int $id, array $data): bool
    {
        $sql = "UPDATE news SET
                    title = :title,
                    article = :article,
                    news_date = :news_date,
                    media_type = :media_type,
                    image_path = :image_path,
                    embed_code = :embed_code,
                    section = :section
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':article' => $data['article'] ?? null,
            ':news_date' => $data['news_date'],
            ':media_type' => $data['media_type'],
            ':image_path' => $data['image_path'] ?? null,
            ':embed_code' => $data['embed_code'] ?? null,
            ':section' => $data['section'],
        ]);
    }

    public static function delete(PDO $pdo, int $id): bool
    {
        $sql = "DELETE FROM news WHERE id = :id";
        $stmt = $pdo->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }
}
