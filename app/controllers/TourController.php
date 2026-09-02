<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/TourModel.php';

class TourController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * List tour dates. Pass upcoming=1 for the public Tour section,
     * omit it for the admin Tour Dates screen (shows past and future).
     */
    public function list(array $params): array
    {
        try {
            $upcoming = !empty($params['upcoming']);
            $dates = $upcoming ? TourModel::getUpcoming($this->pdo) : TourModel::getAll($this->pdo);

            return ['success' => true, 'data' => $dates];
        } catch (Exception $e) {
            error_log("Tour list failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to load tour dates'];
        }
    }

    public function create(array $data): array
    {
        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            $tourDate = TourModel::create($this->pdo, $this->sanitize($data));
            return ['success' => true, 'data' => $tourDate, 'message' => 'Tour date added'];
        } catch (Exception $e) {
            error_log("Tour create failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to add tour date'];
        }
    }

    public function update(int $id, array $data): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid ID'];
        }

        $existing = TourModel::getById($this->pdo, $id);
        if (!$existing) {
            return ['success' => false, 'message' => 'Tour date not found'];
        }

        $errors = $this->validate($data);
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }

        try {
            TourModel::update($this->pdo, $id, $this->sanitize($data));
            return ['success' => true, 'message' => 'Tour date updated'];
        } catch (Exception $e) {
            error_log("Tour update failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update tour date'];
        }
    }

    public function delete(int $id): array
    {
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid ID'];
        }

        $existing = TourModel::getById($this->pdo, $id);
        if (!$existing) {
            return ['success' => false, 'message' => 'Tour date not found'];
        }

        try {
            TourModel::delete($this->pdo, $id);
            return ['success' => true, 'message' => 'Tour date deleted'];
        } catch (Exception $e) {
            error_log("Tour delete failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to delete tour date'];
        }
    }

    private function validate(array $data): array
    {
        $errors = [];

        $tourDate = $data['tour_date'] ?? '';
        if (trim((string)$tourDate) === '') {
            $errors['tour_date'] = 'Tour date is required';
        } elseif (strtotime($tourDate) === false) {
            $errors['tour_date'] = 'Invalid date format';
        }

        $venue = trim($data['venue'] ?? '');
        if ($venue === '') {
            $errors['venue'] = 'Venue is required';
        } elseif (strlen($venue) > 255) {
            $errors['venue'] = 'Venue too long';
        }

        $location = $data['location'] ?? '';
        if (strlen((string)$location) > 255) {
            $errors['location'] = 'Location too long';
        }
        return $errors;
    }

    private function sanitize(array $data): array
    {
        return [
            'tour_date' => date('Y-m-d H:i:s', strtotime($data['tour_date'])),
            'venue' => trim($data['venue']),
            'location' => isset($data['location']) && trim($data['location']) !== ''
                ? trim($data['location'])
                : null,
        ];
    }
}
