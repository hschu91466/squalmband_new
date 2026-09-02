<?php

declare(strict_types=1);

class ContactReplyModel
{
    public static function create(PDO $pdo, int $messageId, string $replyBody, ?int $sentBy): array
    {
        $sql = "INSERT INTO contact_replies (message_id, reply_body, sent_by) 
                VALUES (:message_id, :reply_body, :sent_by)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':message_id' => $messageId,
            ':reply_body' => $replyBody,
            ':sent_by' => $sentBy,
        ]);

        return [
            'id' => (int)$pdo->lastInsertId(),
            'message_id' => $messageId,
            'reply_body' => $replyBody,
        ];
    }

    public static function getByMessageId(PDO $pdo, int $messageId): array
    {
        $sql = "SELECT * FROM contact_replies WHERE message_id = :message_id ORDER BY created_at ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':message_id' => $messageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
