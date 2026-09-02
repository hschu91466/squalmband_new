<?php

declare(strict_types=1);

class ContactModel
{
    public static function sendMessage(PDO $pdo, array $data): bool
    {
        $sql = "INSERT INTO contact_messages (first_name, last_name, email, subject, message, newsletter_signup)
                VALUES (:first_name, :last_name, :email, :subject, :message, :newsletter_signup)";

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':first_name'        => $data['first_name'],
            ':last_name'         => $data['last_name'],
            ':email'             => $data['email'],
            ':subject'           => $data['subject'] ?? null,
            ':message'           => $data['message'],
            ':newsletter_signup' => !empty($data['newsletter_signup']) ? 1 : 0,
        ]);
    }

    public static function getAllMessages(PDO $pdo): array
    {
        $sql = "
            SELECT message_id, first_name, last_name, email, subject, message, newsletter_signup, created_at, is_read, is_spam
            FROM contact_messages
            ORDER BY created_at DESC";

        $stmt = $pdo->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById(PDO $pdo, int $id): ?array
    {
        $sql = "SELECT * FROM contact_messages WHERE message_id = :message_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':message_id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public static function markAsRead(PDO $pdo, int $id): bool
    {
        $stmt = $pdo->prepare("
            UPDATE contact_messages
            SET is_read = 1
            WHERE message_id = :id");

        return $stmt->execute([':id' => $id]);
    }

    public static function markAsSpam(PDO $pdo, int $id): bool
    {

        $stmt = $pdo->prepare("
        UPDATE contact_messages
        SET is_spam = 1
        WHERE message_id = :id");

        return $stmt->execute([':id' => $id]);
    }

    public static function deleteMessage(PDO $pdo, int $id): bool
    {
        $sql = "DELETE FROM contact_messages WHERE message_id = :id";
        $stmt = $pdo->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }
}
