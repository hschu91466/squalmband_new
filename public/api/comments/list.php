<?php
require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/CommentsController.php';

$controller = new CommentsController($pdo);
$response = $controller->list($_GET);

json_response($response);
