<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/TourController.php';

require_admin();

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$controller = new TourController($pdo);
$response = $controller->create($data);

json_response($response);
