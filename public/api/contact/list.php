<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/ContactController.php';

require_admin();

$controller = new ContactController($pdo);
$response = $controller->index();

json_response($response);
