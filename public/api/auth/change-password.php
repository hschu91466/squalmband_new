<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/controllers/AuthController.php';

// User must be logged in
require_login();

// Get input from request body
$data = json_decode(file_get_contents('php://input'), true);

// Instantiate controller and call changePassword method
$controller = new AuthController($pdo);
$response = $controller->changePassword($data ?? []);

// Send JSON response
json_response($response);
