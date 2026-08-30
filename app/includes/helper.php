<?php

declare(strict_types=1);

/**
 * ---------------------------------------------------
 * IMAGE URL HELPERS
 * ---------------------------------------------------
 */

function get_image_base_url(): string
{
    $cdn = $_ENV['CDN_BASE'] ?? '';
    $site = $_ENV['SITE_NAME'] ?? '';

    return rtrim($cdn, '/') . '/' . rtrim($site, '/') . '/';
}

function build_image_url(string $file_path): string
{
    $file_path = ltrim($file_path, '/');

    // encode each segment properly (handles spaces safely)
    $segments = explode('/', $file_path);
    $segments = array_map('rawurlencode', $segments);

    $safePath = implode('/', $segments);

    return rtrim(get_image_base_url(), '/') . '/' . $safePath;
}

/**
 * ---------------------------------------------------
 * JSON RESPONSE HELPERS
 * ---------------------------------------------------
 */

function json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function json_ok($data = []): void
{
    echo json_encode([
        'ok' => true,
        'data' => $data
    ]);
    exit;
}

function json_error(string $message, int $statusCode = 400, array $extra = []): void
{
    json_response(['ok' => false, 'error' => $message] + $extra, $statusCode);
}

/**
 * ---------------------------------------------------
 * AUTH / SESSION HELPERS
 * ---------------------------------------------------
 */

function ensure_session()
{
    if (session_status() !== PHP_SESSION_ACTIVE) {


        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['SERVER_PORT'] ?? 80) == 443;


        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        session_start();
    }
}

function require_admin(): void
{
    ensure_session();

    if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] ?? '') !== 'admin') {
        json_error('Unauthorized', 403);
    }
}

function require_login(): void
{
    ensure_session();

    if (!isset($_SESSION['user'])) {
        json_response(['success' => false, 'message' => 'Login required'], 401);
        exit;
    }
}



/**
 * ---------------------------------------------------
 * SMALL UTILITY
 * ---------------------------------------------------
 */


function h(?string $s): string
{
    return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}
