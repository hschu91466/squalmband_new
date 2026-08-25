<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/AuthController.php';

$controller = new AuthController($pdo);
$response = $controller->logout();

json_response($response);
