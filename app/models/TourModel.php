<?php

declare(strict_types=1);

class TourModel
{
    /**
     * All tour dates, past and future, most recent first — used by the admin Tour Dates screen.
     */
    public static function getAll(PDO $pdo): array
    {
        $sql = "SELECT * FROM tour_dates ORDER BY tour_date DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Only dates from now onward, soonest first — used by the public Tour section.
     */
    public static function getUpcoming(PDO $pdo): array
    {
        $sql = "SELECT * FROM tour_dates WHERE tour_date >= NOW() ORDER BY tour_date ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById(PDO $pdo, int $id): ?array
    {
        $sql = "SELECT * FROM tour_dates WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public static function create(PDO $pdo, array $data): array
    {
        $sql = "INSERT INTO tour_dates (tour_date, venue, location)
                VALUES (:tour_date, :venue, :location)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':tour_date' => $data['tour_date'],
            ':venue' => $data['venue'],
            ':location' => $data['location'] ?? null,
        ]);

        return self::getById($pdo, (int)$pdo->lastInsertId());
    }

    public static function update(PDO $pdo, int $id, array $data): bool
    {
        $sql = "UPDATE tour_dates SET
                    tour_date = :tour_date,
                    venue = :venue,
                    location = :location
                WHERE id = :id";

        $stmt = $pdo->prepare($sql);

        return $stmt->execute([
            ':id' => $id,
            ':tour_date' => $data['tour_date'],
            ':venue' => $data['venue'],
            ':location' => $data['location'] ?? null,
        ]);
    }

    public static function delete(PDO $pdo, int $id): bool
    {
        $sql = "DELETE FROM tour_dates WHERE id = :id";
        $stmt = $pdo->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }
}
