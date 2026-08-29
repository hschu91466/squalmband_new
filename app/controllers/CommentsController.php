<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/CommentModel.php';

class CommentsController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function list(array $params): array
    {
        // --- Input handling ---
        $contentType = $params['content_type'] ?? 'image';
        $contentId   = (int)($params['content_id'] ?? 0);

        $page  = max(1, (int)($params['page'] ?? 1));
        $limit = max(1, min(50, (int)($params['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;

        // --- Validation ---
        if ($contentId <= 0) {
            return [
                'ok' => false,
                'error' => 'Invalid content_id'
            ];
        }

        try {
            // --- Model calls ---
            $rows = CommentModel::listByContent(
                $this->pdo,
                $contentType,
                $contentId,
                $offset,
                $limit,
                true // approved only
            );

            $total = CommentModel::countByContent(
                $this->pdo,
                $contentType,
                $contentId,
                true
            );

            $pages = max(1, (int) ceil($total / $limit));

            // IMPORTANT: return RAW data only (no HTML)
            return [
                'ok' => true,
                'data' => $rows,
                'page' => $page,
                'pages' => $pages,
                'total' => $total
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'Server error'
            ];
        }
    }

    public function create(array $data): array
    {

        ensure_session();

        // --- Input handling ---
        $contentType = $data['content_type'] ?? 'image';
        $contentId   = (int)($data['content_id'] ?? 0);
        $name        = trim($data['name'] ?? '');
        $email       = trim($data['email'] ?? '');
        $comment     = trim($data['body'] ?? '');

        // --- Validation ---
        $errors = [];

        if ($contentId <= 0) {
            $errors[] = 'Invalid content.';
        }

        if ($name === '') {
            $errors[] = 'Name is required.';
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Valid email required.';
        }

        if ($comment === '') {
            $errors[] = 'Comment is required.';
        }

        if (!empty($errors)) {
            return [
                'ok' => false,
                'errors' => $errors
            ];
        }

        // --- Simple rate limit (session-based) ---
        if (isset($_SESSION['last_comment_ts']) && (time() - $_SESSION['last_comment_ts']) < 60) {
            return [
                'ok' => false,
                'error' => 'You are commenting too fast. Please wait a moment.'
            ];
        }

        try {
            // --- Insert via model ---
            $isLoggedIn = isset($_SESSION['user']);

            $isApproved = $isLoggedIn ? 1 : 0;

            $newId = CommentModel::create($this->pdo, [
                'content_type' => $contentType,
                'content_id'  => $contentId,
                'parent_id'   => null,
                'name'        => $name,
                'email'       => $email,
                'website'     => null,
                'body'        => $comment,
                'is_approved' => $isApproved,
                'is_spam'     => 0,
                'ip_address'  => $_SERVER['REMOTE_ADDR'] ?? '',
                'user_agent'  => $_SERVER['HTTP_USER_AGENT'] ?? '',
            ]);

            // update rate limit timestamp
            $_SESSION['last_comment_ts'] = time();

            $message = $isApproved ? 'Comment posted successfully.' : 'Thanks! Your comment is pending approval.';

            return [
                'ok' => true,
                'id' => $newId,
                'message' => $message,
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'Server error'
            ];
        }
    }

    public function approve(int $id): array
    {
        // --- Basic validation ---
        if ($id <= 0) {
            return [
                'ok' => false,
                'error' => 'Missing or Invalid id'
            ];
        }



        try {
            $ok = CommentModel::approve($this->pdo, $id);

            if (!$ok) {
                return [
                    'ok' => false,
                    'error' => 'Not found'
                ];
            }

            return [
                'ok' => true,
                'id' => $id
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'Server error'
            ];
        }
    }

    public function delete(int $id): array
    {

        if ($id <= 0) {
            return [
                'ok' => false,
                'error' => 'Invalid id'
            ];
        }

        try {
            $ok = CommentModel::delete($this->pdo, $id);
            return [
                'ok' => $ok,
                'id' => $id
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'server error'
            ];
        }
    }

    public function spam(int $id): array
    {
        if ($id <= 0) {
            return [
                'ok' => false,
                'error' => 'Invalid id'
            ];
        }

        try {
            $ok = CommentModel::markSpam($this->pdo, $id);

            return [
                'ok' => $ok,
                'id' => $id
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'Server error'
            ];
        }
    }

    public function listAdmin(array $params): array
    {
        $status = $params['status'] ?? 'pending';

        try {
            $rows = CommentModel::listByStatus($this->pdo, $status);

            return [
                'ok' => true,
                'comments' => $rows
            ];
        } catch (Throwable $e) {
            return [
                'ok' => false,
                'error' => 'Server error'
            ];
        }
    }

    public function getCommentCount(): array
    {
        try {

            $stmt = $this->pdo->query("
        SELECT 
            SUM(CASE WHEN is_approved = 0 THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) AS approved,
            COUNT(*) AS total
        FROM comments
        WHERE is_spam = 0
    ");

            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            return
                [
                    "ok" => true,
                    "counts" => [
                        'pending' => (int)$result['pending'],
                        'approved' => (int)$result['approved'],
                        'total' => (int)$result['total']
                    ]
                ];
        } catch (Throwable $e) {
            return [
                'error' => 'Failed to load counts'
            ];
        }
    }
}
