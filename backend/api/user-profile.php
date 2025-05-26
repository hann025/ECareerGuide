<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Authorization");

// Validate JWT
$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(["message" => "Missing Authorization Header"]);
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

// Include JWT decode logic (e.g., Firebase JWT library)
require_once '../config/database.php';
require_once '../helpers/jwt_helper.php'; // Your JWT decode utility

try {
    $decoded = decodeJWT($token); // returns user_id
    $userId = $decoded->user_id;

    $db = new PDO("mysql:host=localhost;dbname=ecareer_guidance", "root", "Munet@05");
    $stmt = $db->prepare("SELECT name FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount()) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["name" => $row['name']]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid token"]);
}
?>
