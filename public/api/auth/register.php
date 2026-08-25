<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/AuthController.php';

$rawInput = file_get_contents('php://input');

$data = json_decode($rawInput, true) ?? [];

$controller = new AuthController($pdo);
$response = $controller->register($data);

json_response($response);
