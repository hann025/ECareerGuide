<?php
// Enable full error reporting for logging, but disable display for API output.
error_reporting(E_ALL);
ini_set('display_errors', 0); // Crucial: Set to 0 to prevent warnings/errors from appearing in API response body

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require '../db_connect.php'; // Include your database connection

    // Parameters for specific user-counselor conversation
    $counselor_id_param = $_GET['counselor_id'] ?? null;
    $user_id_param = $_GET['user_id'] ?? null;

    // Parameters for counselor inbox (CounselorInbox.jsx)
    $is_counselor_inbox_request = isset($_GET['is_counselor_inbox']) && $_GET['is_counselor_inbox'] === 'true';
    $counselor_logged_in_id = $_GET['counselor_logged_in_id'] ?? null; // ID of the counselor currently logged in

    $messages = [];
    $sql = "";
    $params = [];

    // Scenario 1: Fetch messages for a specific user-counselor chat (used by MessageCounselor.jsx)
    // This requires both counselor_id and user_id to be present.
    if ($counselor_id_param && $user_id_param) {
        $sql = "
            SELECT
                m.id,
                m.user_id,
                m.counselor_id,
                m.message,
                m.reply,
                m.replied_at,
                m.status,
                m.timestamp,
                u.full_name AS user_full_name,
                -- Removed u.profile_picture as it's not in your users table schema
                c.name AS counselor_name
            FROM messages m
            JOIN users u ON m.user_id = u.id
            JOIN counselors c ON m.counselor_id = c.id
            WHERE m.counselor_id = ? AND m.user_id = ?
            ORDER BY m.timestamp ASC
        ";
        $params = [$counselor_id_param, $user_id_param];
    }
    // Scenario 2: Fetch messages for a counselor's inbox (used by CounselorInbox.jsx)
    // This requires the is_counselor_inbox flag and the logged-in counselor's ID.
    else if ($is_counselor_inbox_request && $counselor_logged_in_id) {
        $sql = "
            SELECT
                m.id,
                m.user_id,
                m.counselor_id,
                m.message,
                m.reply,
                m.replied_at,
                m.status,
                m.timestamp,
                u.full_name AS student_name, -- Alias for CounselorInbox
                -- Removed u.profile_picture as it's not in your users table schema
                c.name AS counselor_name
            FROM messages m
            JOIN users u ON m.user_id = u.id
            JOIN counselors c ON m.counselor_id = c.id
            WHERE m.counselor_id = ?
            ORDER BY m.timestamp DESC
        ";
        $params = [$counselor_logged_in_id];
    }
    // Scenario 3: Invalid request - no specific filtering parameters
    else {
        http_response_code(400); // Bad Request
        echo json_encode(["success" => false, "error" => "Invalid request: Missing required parameters for message filtering."]);
        exit();
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Mark messages as read if viewing a specific user-counselor conversation
    // Only mark as read if it's a direct chat (Scenario 1) and the counselor is viewing it.
    // In CounselorInbox, messages are not automatically marked as read until the counselor opens the specific chat.
    if ($counselor_id_param && $user_id_param && !empty($messages)) {
        // Filter for messages sent by the user to this counselor that are unread
        $unread_message_ids_to_mark_read = array_column(array_filter($messages, function($msg) use ($user_id_param) {
            return $msg['status'] === 'unread' && $msg['user_id'] == $user_id_param; // Only mark user's messages as read
        }), 'id');

        if (!empty($unread_message_ids_to_mark_read)) {
            $placeholders = implode(',', array_fill(0, count($unread_message_ids_to_mark_read), '?'));
            $updateStmt = $pdo->prepare("
                UPDATE messages
                SET status = 'read'
                WHERE id IN ($placeholders)
            ");
            $updateStmt->execute($unread_message_ids_to_mark_read);
            // Optionally, you might want to re-fetch messages or update their status in the $messages array
            // before sending the response, so the client immediately sees 'read' status.
            // For simplicity, we'll let the next interval fetch update the client.
        }
    }

    echo json_encode(["success" => true, "messages" => $messages]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log("Database error in get_messages.php: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "Database error", "debug" => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500); // Changed to 500 for general server errors
    error_log("General Error in get_messages.php: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "An unexpected error occurred", "debug" => $e->getMessage()]);
}
?>
