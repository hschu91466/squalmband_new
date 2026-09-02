<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../app/config/bootstrap.php';
require_once __DIR__ . '/../../../app/models/ContactReplyModel.php';

require_admin();
$messageId = (int)($_GET['message_id'] ?? 0);

if ($messageId <= 0) {
    json_response(['success' => false, 'message' => 'Invalid message ID']);
}

$replies = ContactReplyModel::getByMessageId($pdo, $messageId);
json_response(['success' => true, 'data' => $replies]);
