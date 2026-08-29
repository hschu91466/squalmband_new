<?php
require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/CommentsController.php';

$data = json_decode(file_get_contents('php://input'), true);

$controller = new CommentsController($pdo);
$response = $controller->create($data ?? []);

json_response($response);
