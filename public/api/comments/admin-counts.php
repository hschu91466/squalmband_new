<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/CommentsController.php';

require_admin();

$params = $_GET;

$controller = new CommentsController($pdo);
$response = $controller->getCommentCount();

echo json_encode($response);
