<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/NewsController.php';

require_admin();

// multipart/form-data: text fields land in $_POST, file (if any) in $_FILES
$data = $_POST;
$file = $_FILES['image'] ?? null;

$controller = new NewsController($pdo);
$response = $controller->create($data, $file);

json_response($response);
