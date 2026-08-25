<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/NewsletterController.php';

require_admin();

$controller = new NewsletterController($pdo);
$response = $controller->history();

json_response($response);
