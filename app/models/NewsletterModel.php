<?php

declare(strict_types=1);

class NewsletterModel
{
    public static function insert(PDO $pdo, string $subject, string $body, int $brevoCampaignId): array
    {
        $sql = "INSERT INTO newsletters (subject, body, brevo_campaign_id, sent_at) VALUES (:subject, :body, :brevo_campaign_id, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':subject' => $subject,
            ':body' => $body,
            ':brevo_campaign_id' => $brevoCampaignId,
        ]);

        return [
            'id' => (int)$pdo->lastInsertId(),
            'subject' => $subject,
            'brevo_campaign_id' => $brevoCampaignId,
            'sent_at' => date('Y-m-d H:i:s'),
        ];
    }

    public static function getAll(PDO $pdo): array
    {
        $sql = "SELECT * FROM newsletters ORDER BY sent_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }
}
