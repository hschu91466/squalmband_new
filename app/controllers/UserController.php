<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/UserModel.php';

class UserController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function listAdmin(array $params): array
    {

        $status = $params['status'] ?? 'pending';


        try {
            $users = UserModel::listByStatus($this->pdo, $status);
            return [
                'ok' => true,
                'users' => $users
            ];
        } catch (Exception $e) {
            return [
                'ok' => false,
                'error' => "Failed to load users"
            ];
        }
    }

    public function approve(array $data): array
    {
        $userId = (int)($data['user_id'] ?? 0);

        if ($userId <= 0) {
            return [
                'ok' => false,
                'error' => 'Invalid user ID'
            ];
        }

        try {
            $adminId = $_SESSION['user']['id'] ?? null;
            $success = UserModel::approve($this->pdo, $userId, $adminId);

            if ($success) {
                return [
                    'ok' => true,
                    'message' => 'User approved successfully'
                ];
            }
            return [
                'ok' => false,
                'error' => 'User not found'
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'Failed to approve user'
            ];
        }
    }

    public function delete(array $data): array
    {
        $userId = (int)($data['user_id'] ?? 0);

        if ($userId <= 0) {
            return [
                'success' => false,
                'message' => 'Invalid user ID'
            ];
        }
        try {
            UserModel::delete($this->pdo, $userId);

            return [
                'success' => true,
                'message' => 'User deleted successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
