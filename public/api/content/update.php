<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/SiteContentController.php';

require_admin();

// multipart/form-data: text fields land in $_POST, file (if any) in $_FILES
$data = $_POST;
$sectionKey = (string)($_POST['section_key'] ?? '');
$file = $_FILES['image'] ?? null;

$controller = new SiteContentController($pdo);
$response = $controller->update($sectionKey, $data, $file);

json_response($response);
