<?php

declare(strict_types=1);

class ReplyModel
{
    public static function create(PDO $pdo, int $messageId, string $body): array
    {
        $sql = "INSERT INTO replies (message_id, body) VALUES (:message_id, :body)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':message_id' => $messageId,
            ':body' => $body,
        ]);

        return [
            'id' => (int)$pdo->lastInsertId(),
            'message_id' => $messageId,
            'body' => $body,
        ];
    }

    public static function getByMessageId(PDO $pdo, int $messageId): array
    {
        $sql = "SELECT * FROM replies WHERE message_id = :message_id ORDER BY sent_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':message_id' => $messageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
