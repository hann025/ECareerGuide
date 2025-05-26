<?php
// api/schedule_meeting.php - Schedules a meeting with a counselor

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../db_connect.php'; // Database connection

// Validate the request
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;
$counselor_id = $data['counselor_id'] ?? null;
$schedule_date = $data['schedule_date'] ?? null;

if (!$user_id || !$counselor_id || !$schedule_date) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "All fields are required"]);
    exit();
}

try {
    // Insert the meeting schedule into the database
    $stmt = $pdo->prepare("INSERT INTO meetings (user_id, counselor_id, schedule_date) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $counselor_id, $schedule_date]);

    echo json_encode(["success" => true, "message" => "Meeting scheduled successfully"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to schedule meeting"]);
}
