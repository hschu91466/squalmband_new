<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/NewsletterController.php';

require_admin();

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$controller = new NewsletterController($pdo);
$response = $controller->removeSubscriber($data);

json_response($response);
