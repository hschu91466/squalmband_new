<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/UserController.php';

require_admin();

$controller = new UserController($pdo);
$response = $controller->listAdmin($_GET);

json_response($response);
