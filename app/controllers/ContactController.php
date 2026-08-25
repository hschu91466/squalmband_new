<?php

declare(strict_types=1);

require_once __DIR__ . '/../services/ContactService.php';

class ContactController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function send(array $data): array
    {
        if (
            empty($data['first_name']) ||
            empty($data['last_name']) ||
            empty($data['email']) ||
            empty($data['message'])
        ) {
            return [
                "success" => false,
                "message" => "First name, last name, email, and message are required"
            ];
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return [
                "success" => false,
                "message" => "A valid email is required"
            ];
        }

        $service = new ContactService();
        return $service->sendMessage($this->pdo, $data);
    }

    public function index(): array
    {
        $service = new ContactService();
        return $service->getMessages($this->pdo);
    }

    public function markRead(array $data): array
    {
        $id = (int)($data['message_id'] ?? 0);

        if ($id <= 0) {
            return ["success" => false, "message" => "Invalid message ID"];
        }

        $service = new ContactService();
        return $service->markRead($this->pdo, $id);
    }

    public function markSpam(array $data): array
    {
        $id = (int)$data['message_id'];

        $service = new ContactService();
        return $service->markSpam($this->pdo, $id);
    }

    public function delete(array $data): array
    {
        $id = (int)($data['message_id'] ?? 0);

        if ($id <= 0) {
            return ["success" => false, "message" => "Invalid message ID"];
        }

        $service = new ContactService();
        return $service->delete($this->pdo, $id);
    }
}
