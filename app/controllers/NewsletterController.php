<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/NewsletterService.php';

class NewsletterController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function send(array $data): array
    {
        if (empty($data['subject']) || empty($data['body'])) {
            return [
                'success' => false,
                'message' => 'Subject and body are required'
            ];
        }

        $subject = trim($data['subject']);
        $body = trim($data['body']);

        if (strlen($subject) < 3 || strlen($subject) > 255) {
            return [
                'success' => false,
                'message' => 'Subject must be between 3 and 255 characters'
            ];
        }

        if (strlen($body) < 10) {
            return [
                'success' => false,
                'message' => 'Body must be at least 10 characters'
            ];
        }

        $service = new NewsletterService();
        return $service->sendNewsletter($this->pdo, $subject, $body);
    }

    public function history(): array
    {
        $service = new NewsletterService();
        return $service->getHistory($this->pdo);
    }

    public function subscribers(): array
    {
        $service = new NewsletterService();
        return $service->getSubscribers();
    }

    public function removeSubscriber(array $data): array
    {
        $email = trim($data['email'] ?? '');

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Valid email is required'];
        }

        $service = new NewsletterService();
        return $service->removeSubscriber($email);
    }
}
