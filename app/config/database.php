<?php

declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $DBHOST = $_ENV['DBHOST'] ?? getenv('DBHOST') ?: '127.0.0.1';
    $DBPORT = $_ENV['DBPORT'] ?? getenv('DBPORT') ?: '3306';
    $DBNAME = $_ENV['DBNAME'] ?? getenv('DBNAME') ?: '';
    $DBUSER = $_ENV['DBUSER'] ?? getenv('DBUSER') ?: '';
    $DBPASS = $_ENV['DBPASS'] ?? getenv('DBPASS') ?: '';

    if ($DBNAME === '' || $DBUSER === '') {
        throw new RuntimeException('Database environment variables missing: DBNAME and/or DBUSER are empty.');
    }

    $socket = '/run/mysqld/mysqld.sock';
    $dsn = file_exists($socket)
        ? "mysql:unix_socket={$socket};dbname={$DBNAME};charset=utf8mb4"
        : "mysql:host={$DBHOST};port={$DBPORT};dbname={$DBNAME};charset=utf8mb4";

    $pdo = new PDO($dsn, $DBUSER, $DBPASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}
