<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/SiteContentController.php';

$controller = new SiteContentController($pdo);
$response = $controller->list();

json_response($response);
