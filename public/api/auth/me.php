<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/AuthController.php';

ensure_session();

$controller = new AuthController($pdo);
$response = $controller->currentUser();

json_response($response);
