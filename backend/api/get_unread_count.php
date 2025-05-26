<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require '../db_connect.php';

$counselor_id = $_GET['counselor_id'] ?? null;

if (!$counselor_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Counselor ID is required"]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as unread_count
        FROM messages
        WHERE counselor_id = ? AND status = 'unread'
    ");
    $stmt->execute([$counselor_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "unread_count" => (int)$result['unread_count']]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to get unread count"]);
}
?>
