<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/UserModel.php';

class AuthController
{

    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function login(string $email, string $password): array
    {
        if (empty($email) || empty($password)) {
            return ["success" => false, "message" => "Email and password required"];
        }

        $user = UserModel::getByEmail($this->pdo, $email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ["success" => false, "message" => "Invalid credentials"];
        }

        if (!$user['is_approved']) {
            return ["success" => false, "message" => "Account pending approval"];
        }

        // Session logic belongs here (business logic)

        $_SESSION['user'] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['role']
        ];

        return [
            "success" => true,
            "message" => "Login successful",
            "data" => [
                "user" => [
                    "id" => $user['id'],
                    "email" => $user['email'],
                    "first_name" => $user['first_name'],
                    "last_name" => $user['last_name'],
                    "name" => $user['first_name'] . ' ' . $user['last_name'],
                    "role" => $user['role']
                ]
            ]
        ];
    }

    public function logout(): array
    {
        $_SESSION = [];
        session_destroy();
        return ["success" => true, "message" => "Logged out"];
    }

    public function currentUser(): array
    {
        if (!isset($_SESSION['user'])) {
            return ["success" => true, "data" => ["user" => null]];
        }

        $user = $_SESSION['user'];
        $user['name'] = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));

        return ["success" => true, "data" => ["user" => $user]];
    }

    public function register(array $data): array
    {
        $firstName = trim($data['first_name'] ?? '');
        $lastName  = trim($data['last_name'] ?? '');
        $email     = trim($data['email'] ?? '');
        $password  = $data['password'] ?? '';

        $errors = [];

        // Validations
        if ($firstName === '') {
            $errors[] = "First name required";
        }

        if ($lastName === '') {
            $errors[] = "Last name required";
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Valid email required";
        }

        if (strlen($password) < 6) {
            $errors[] = "Password must be at least 6 characters";
        }

        if (!empty($errors)) {
            return ["success" => false, "errors" => $errors];
        }

        // Check if email already exists
        $existing = UserModel::getByEmail($this->pdo, $email);

        if ($existing) {
            return ["success" => false, "message" => "Email already registered"];
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Create user — is_approved defaults to false/0 in the database.
        // Do NOT log the user in here. Approval is required before login,
        // and login() already enforces is_approved. Setting a session here
        // would let an unapproved user act as logged-in immediately.
        $userId = UserModel::create($this->pdo, $email, $firstName, $lastName, $passwordHash, "user");

        return [
            "success" => true,
            "message" => "Account created. An admin will approve your account before you can log in.",
            "data" => [
                "user" => [
                    "id" => $userId,
                    "email" => $email,
                    "first_name" => $firstName,
                    "last_name" => $lastName,
                    "name" => $firstName . ' ' . $lastName,
                    "role" => "user"
                ]
            ]
        ];
    }

    public function changePassword(array $data): array
    {
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        $errors = [];

        if ($currentPassword === '') {
            $errors[] = "Current password is required";
        }

        if ($newPassword === '') {
            $errors[] = "New password is required";
        }

        if (strlen($newPassword) < 6) {
            $errors[] = "Password must be at least 6 characters";
        }

        if ($currentPassword === $newPassword) {
            $errors[] = "New password must be different from current password";
        }

        if (!empty($errors)) {
            return ["success" => false, "errors" => $errors];
        }

        try {
            // Get current user from session
            // (require_login() at the endpoint level guarantees this is set,
            // but we check again here since the controller shouldn't assume
            // the caller enforced it.)
            if (!isset($_SESSION['user']['id'])) {
                return ["success" => false, "message" => "Not authenticated"];
            }

            $userId = $_SESSION['user']['id'];

            $user = UserModel::getById($this->pdo, $userId);

            if (!$user) {
                return ["success" => false, "message" => "User not found"];
            }

            if (!password_verify($currentPassword, $user['password_hash'])) {
                return ["success" => false, "message" => "Current password is incorrect"];
            }

            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);

            UserModel::updatePassword($this->pdo, $userId, $passwordHash);

            return ["success" => true, "message" => "Password changed successfully"];
        } catch (Exception $e) {
            error_log("Password change failed for user ID {$userId}: " . $e->getMessage());
            return ["success" => false, "message" => "Failed to change password. Please try again."];
        }
    }
}
