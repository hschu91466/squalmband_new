<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/ContactController.php';

$data = json_decode(file_get_contents("php://input"), true);

$controller = new ContactController($pdo);
$response = $controller->markSpam($data);

json_response($response);
