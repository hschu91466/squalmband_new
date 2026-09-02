<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/ContactModel.php';
require_once __DIR__ . '/../models/ContactReplyModel.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Brevo\Brevo;
use Brevo\Contacts\Requests\CreateContactRequest;

class ContactService
{
    public function sendMessage(PDO $pdo, array $data): array
    {
        $success = ContactModel::sendMessage($pdo, $data);

        if (!$success) {
            return [
                "success" => false,
                "message" => "Failed to save message"
            ];
        }

        $this->notifyAdmin($data);

        if (!empty($data['newsletter_signup'])) {
            $this->syncToBrevo($data);
        }

        return [
            "success" => true,
            "message" => "Message sent"
        ];
    }

    public function getMessages(PDO $pdo): array
    {
        $messages = ContactModel::getAllMessages($pdo);

        return [
            "success" => true,
            "data" => $messages
        ];
    }

    public function markRead(PDO $pdo, int $id): array
    {
        $success = ContactModel::markAsRead($pdo, $id);

        return [
            "success" => $success,
            "message" => $success ? "Marked as read" : "Failed"
        ];
    }

    public function markSpam(PDO $pdo, int $id): array
    {
        $success = ContactModel::markAsSpam($pdo, $id);

        return [
            "success" => $success,
            "message" => $success ? "Marked as spam ✅" : "Failed ❌"
        ];
    }

    public function replyToMessage(PDO $pdo, int $messageId, string $replyBody, ?int $sentBy): array
    {
        $message = ContactModel::getById($pdo, $messageId);
        if (!$message) {
            return ['success' => false, 'message' => 'Message not found'];
        }

        $sent = $this->sendReply($message, $replyBody);
        if (!$sent) {
            return ['success' => false, 'message' => 'Failed to send reply'];
        }

        $reply = ContactReplyModel::create($pdo, $messageId, $replyBody, $sentBy);
        ContactModel::markAsRead($pdo, $messageId);

        return ['success' => true, 'data' => $reply, 'message' => 'Reply sent'];
    }

    private function sendReply(array $message, string $replyBody): bool
    {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->SMTPDebug = 2;
            $mail->Debugoutput = function ($str, $level) {
                error_log("PHPMailer debug: $str");
            };
            $mail->Host       = $_ENV['BREVO_SMTP_HOST'] ?? getenv('BREVO_SMTP_HOST');
            $mail->SMTPAuth   = true;
            $mail->AuthType   = 'LOGIN';
            $mail->Username   = $_ENV['BREVO_SMTP_USER'] ?? getenv('BREVO_SMTP_USER');
            $mail->Password   = $_ENV['BREVO_SMTP_PASSWORD'] ?? getenv('BREVO_SMTP_PASSWORD');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) ($_ENV['BREVO_SMTP_PORT'] ?? getenv('BREVO_SMTP_PORT'));

            $mail->setFrom(
                $_ENV['MAIL_FROM_ADDRESS'] ?? getenv('MAIL_FROM_ADDRESS'),
                $_ENV['MAIL_FROM_NAME'] ?? getenv('MAIL_FROM_NAME')
            );
            $mail->addAddress($message['email'], $message['first_name'] . ' ' . $message['last_name']);

            $mail->Subject = "Re: " . ($message['subject'] ?? '(no subject)');
            $mail->Body    = $replyBody;

            $mail->send();
            return true;
        } catch (PHPMailerException $e) {
            error_log('Contact reply email failed: ' . $mail->ErrorInfo);
            return false;
        }
    }

    public function delete(PDO $pdo, int $id): array
    {
        $success = ContactModel::deleteMessage($pdo, $id);

        return [
            "success" => $success,
            "message" => $success ? "Deleted" : "Failed"
        ];
    }

    private function notifyAdmin(array $data): void
    {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $_ENV['BREVO_SMTP_HOST'] ?? getenv('BREVO_SMTP_HOST');
            $mail->SMTPAuth   = true;
            $mail->AuthType = 'LOGIN';
            $mail->Username   = $_ENV['BREVO_SMTP_USER'] ?? getenv('BREVO_SMTP_USER');
            $mail->Password   = $_ENV['BREVO_SMTP_PASSWORD'] ?? getenv('BREVO_SMTP_PASSWORD');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) ($_ENV['BREVO_SMTP_PORT'] ?? getenv('BREVO_SMTP_PORT'));

            $mail->setFrom(
                $_ENV['MAIL_FROM_ADDRESS'] ?? getenv('MAIL_FROM_ADDRESS'),
                $_ENV['MAIL_FROM_NAME'] ?? getenv('MAIL_FROM_NAME')
            );
            $mail->addAddress($_ENV['CONTACT_NOTIFY_EMAIL'] ?? getenv('CONTACT_NOTIFY_EMAIL'));
            $mail->addReplyTo($data['email'], $data['first_name'] . ' ' . $data['last_name']);

            $mail->Subject = "New contact form submission: " . ($data['subject'] ?? '(no subject)');
            $mail->Body    = "Name: {$data['first_name']} {$data['last_name']}\n"
                . "Email: {$data['email']}\n"
                . "Newsletter signup: " . (!empty($data['newsletter_signup']) ? 'Yes' : 'No') . "\n\n"
                . "Message:\n{$data['message']}";

            $mail->send();
        } catch (PHPMailerException $e) {
            error_log('Contact notification email failed: ' . $mail->ErrorInfo);
        }
    }

    private function syncToBrevo(array $data): void
    {
        try {
            $brevo = new Brevo($_ENV['BREVO_API_KEY'] ?? getenv('BREVO_API_KEY'));

            $brevo->contacts->createContact(new CreateContactRequest([
                'email'         => $data['email'],
                'attributes'    => [
                    'FIRSTNAME' => $data['first_name'],
                    'LASTNAME'  => $data['last_name'],
                ],
                'listIds'       => [(int) ($_ENV['BREVO_NEWSLETTER_LIST_ID'] ?? getenv('BREVO_NEWSLETTER_LIST_ID'))],
                'updateEnabled' => true,
            ]));
        } catch (Throwable $e) {
            error_log('Brevo newsletter sync failed: ' . $e->getMessage());
        }
    }
}
