<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/NewsletterModel.php';

class NewsletterService
{
    public function sendNewsletter(PDO $pdo, string $subject, string $body): array
    {
        try {
            // Create and send campaign via Brevo
            $brevoCampaignId = $this->createAndSendCampaign($subject, $body);

            if (!$brevoCampaignId) {
                return [
                    'success' => false,
                    'message' => 'Failed to create Brevo campaign'
                ];
            }

            // Log to database
            $result = NewsletterModel::insert($pdo, $subject, $body, $brevoCampaignId);

            return [
                'success' => true,
                'message' => 'Newsletter sent to subscribers',
                'data' => $result
            ];
        } catch (Throwable $e) {
            error_log('Newsletter send failed: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to send newsletter'
            ];
        }
    }

    public function getHistory(PDO $pdo): array
    {
        $newsletters = NewsletterModel::getAll($pdo);

        return [
            'success' => true,
            'data' => $newsletters
        ];
    }

    public function getSubscribers(): array
    {
        $apiKey = $_ENV['BREVO_API_KEY'] ?? getenv('BREVO_API_KEY');
        $listId = (int)($_ENV['BREVO_NEWSLETTER_LIST_ID'] ?? getenv('BREVO_NEWSLETTER_LIST_ID'));

        $response = $this->makeBrevoRequest(
            'GET',
            "/v3/contacts/lists/{$listId}/contacts",
            [],
            $apiKey,
            true
        );

        if ($response === null) {
            return ['success' => false, 'message' => 'Failed to load subscribers'];
        }

        return ['success' => true, 'data' => $response['contacts'] ?? []];
    }

    public function removeSubscriber(string $email): array
    {
        $apiKey = $_ENV['BREVO_API_KEY'] ?? getenv('BREVO_API_KEY');
        $listId = (int)($_ENV['BREVO_NEWSLETTER_LIST_ID'] ?? getenv('BREVO_NEWSLETTER_LIST_ID'));

        $response = $this->makeBrevoRequest(
            'POST',
            "/v3/contacts/lists/{$listId}/contacts/remove",
            ['emails' => [$email]],
            $apiKey,
            true
        );

        if ($response === null) {
            return ['success' => false, 'message' => 'Failed to remove subscriber'];
        }

        return ['success' => true, 'message' => 'Subscriber removed'];
    }

    private function createAndSendCampaign(string $subject, string $body): ?int
    {
        $apiKey = $_ENV['BREVO_API_KEY'] ?? getenv('BREVO_API_KEY');
        $listId = (int)($_ENV['BREVO_NEWSLETTER_LIST_ID'] ?? getenv('BREVO_NEWSLETTER_LIST_ID'));
        $senderEmail = $_ENV['MAIL_FROM_ADDRESS'] ?? getenv('MAIL_FROM_ADDRESS');
        $senderName = $_ENV['MAIL_FROM_NAME'] ?? getenv('MAIL_FROM_NAME');

        // Append a visible unsubscribe link. Brevo already attaches the
        // List-Unsubscribe header automatically (RFC 8058 one-click), but that
        // only surfaces as a native button in some mail clients (Gmail/Yahoo).
        // This adds a fallback visible link in the body for clients that don't
        // support header-level unsubscribe.
        $htmlContent = $body . '<p style="font-size:12px;color:#888;margin-top:24px;">'
            . '<a href="{{ unsubscribe }}">Unsubscribe from this newsletter</a>'
            . '</p>';

        $campaignData = [
            'name' => $subject . ' - ' . date('Y-m-d H:i:s'),
            'subject' => $subject,
            'sender' => [
                'name' => $senderName,
                'email' => $senderEmail,
            ],
            'type' => 'classic',
            'htmlContent' => $htmlContent,
            'recipients' => [
                'listIds' => [$listId],
            ],
            'status' => 'draft',
        ];

        $campaignId = $this->makeBrevoRequest(
            'POST',
            '/v3/emailCampaigns',
            $campaignData,
            $apiKey
        );

        if (!$campaignId) {
            return null;
        }

        // Send campaign
        $sendResult = $this->makeBrevoRequest(
            'POST',
            "/v3/emailCampaigns/{$campaignId}/sendNow",
            [],
            $apiKey
        );

        if (!$sendResult) {
            error_log("Failed to send campaign {$campaignId}");
            return null;
        }

        return $campaignId;
    }

    private function makeBrevoRequest(string $method, string $endpoint, array $data, string $apiKey, bool $returnFull = false)
    {
        $url = 'https://api.brevo.com' . $endpoint;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => [
                'api-key: ' . $apiKey,
                'Content-Type: application/json',
            ],
        ]);

        if (!empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode < 200 || $httpCode >= 300) {
            error_log("Brevo API error ({$httpCode}): {$response}");
            return null;
        }

        $responseData = json_decode($response, true);

        if ($returnFull) {
            return $responseData ?? [];
        }

        return $responseData['id'] ?? true;
    }
}
