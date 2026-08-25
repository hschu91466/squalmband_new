<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/NewsController.php';

require_admin();

$data = $_POST;
$id = (int)($_POST['id'] ?? 0);
$file = $_FILES['image'] ?? null;

$controller = new NewsController($pdo);
$response = $controller->update($id, $data, $file);

json_response($response);
