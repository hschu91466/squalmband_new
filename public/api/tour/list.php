<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/TourController.php';

$controller = new TourController($pdo);
$response = $controller->list($_GET);

json_response($response);
