<?php
// Enable full error reporting for logging, but disable display for API output.
error_reporting(E_ALL);
ini_set('display_errors', 0); // Crucial: Set to 0 to prevent warnings/errors from appearing in API response body

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json'); // Crucial: tell the client to expect JSON

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(); // Exit immediately for OPTIONS requests
}

// Include PHPMailer classes
// Adjust the path to 'autoload.php' based on where your 'vendor' directory is relative to this script.
// If 'send_reply.php' is in 'backend/api/', and 'vendor' is in 'backend/', then it's '../vendor/autoload.php'
require '../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Wrap the entire script logic in a try-catch block to ensure a JSON response even on unexpected errors
try {
    // Include database connection file
    // IMPORTANT: Ensure db_connect.php does NOT output anything (not even whitespace) outside of <?php tags
    require '../db_connect.php';

    // Decode the JSON input from the request body
    $data = json_decode(file_get_contents("php://input"), true);

    // Extract data, using null coalescing operator for safety
    $message_id = $data['message_id'] ?? null;
    $counselor_id = $data['counselor_id'] ?? null;
    $reply_text = $data['reply'] ?? null;

    // Validate required fields
    if (!$message_id || !$counselor_id || !$reply_text) {
        http_response_code(400); // Bad Request
        echo json_encode(["success" => false, "error" => "All fields (message_id, counselor_id, reply) are required"]);
        exit(); // Stop script execution after sending response
    }

    // Update the message in the database
    $stmt = $pdo->prepare("
        UPDATE messages
        SET reply = ?, status = 'replied', replied_at = NOW()
        WHERE id = ? AND counselor_id = ?
    ");
    $stmt->execute([$reply_text, $message_id, $counselor_id]);

    // Check if any row was affected by the update
    if ($stmt->rowCount() === 0) {
        http_response_code(404); // Not Found
        echo json_encode(["success" => false, "error" => "Message not found or counselor ID mismatch"]);
        exit(); // Stop script execution
    }

    // Fetch message details to send notification email
    $stmt = $pdo->prepare("
        SELECT u.email, u.full_name, c.name as counselor_name
        FROM messages m
        JOIN users u ON m.user_id = u.id
        JOIN counselors c ON m.counselor_id = c.id
        WHERE m.id = ?
    ");
    $stmt->execute([$message_id]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);

    // Prepare email details and send notification using PHPMailer
    if ($message) {
        $mail = new PHPMailer(true); // Passing `true` enables exceptions for error handling

        try {
            //Server settings for Gmail SMTP
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = 'smtp.gmail.com';                       // Gmail SMTP server
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = 'ecareerguide6@gmail.com';              // Your Gmail address (MUST be exact)
            // App Password without spaces.
            $mail->Password   = 'jbyzbdsncldhogsk';                     // The App Password you generated, without spaces
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption
            $mail->Port       = 587;                                    // TCP port to connect to; use 587 for TLS/STARTTLS

            //Recipients
            // The 'From' address should be your Gmail address you are authenticating with
            $mail->setFrom('ecareerguide6@gmail.com', 'Career Guidance Team');
            $mail->addAddress($message['email'], $message['full_name']); // Add recipient from database

            // Content
            $mail->isHTML(false); // Set email format to plain text
            $mail->Subject = "Reply from Your Career Counselor";
            $mail->Body    = "Hello " . $message['full_name'] . ",\n\nYou have received a reply from " . $message['counselor_name'] . ":\n\n" . $reply_text . "\n\nBest regards,\nYour Career Guidance Team";

            $mail->send();
            echo json_encode([
                "success" => true,
                "message" => "Reply sent successfully and email notification sent",
                "replied_at" => date("Y-m-d H:i:s") // Return the current timestamp for client-side update
            ]);
        } catch (Exception $e) {
            // Log the PHPMailer error for debugging
            error_log("PHPMailer Error: Failed to send email to " . $message['email'] . " for message ID " . $message_id . ". Error Info: " . $mail->ErrorInfo);
            echo json_encode([
                "success" => true, // Still report success for the reply itself to the frontend
                "message" => "Reply sent successfully but failed to send email notification (Mailer Error: " . $e->getMessage() . ")",
                "replied_at" => date("Y-m-d H:i:s")
            ]);
        }
    } else {
        // If message details couldn't be fetched (e.g., user/counselor deleted), still report reply success
        echo json_encode([
            "success" => true,
            "message" => "Reply sent successfully but no user found to send email notification",
            "replied_at" => date("Y-m-d H:i:s")
        ]);
    }
    exit(); // Ensure script terminates after successful JSON output

} catch (PDOException $e) {
    // Catch PDO (database) specific exceptions
    http_response_code(500); // Internal Server Error
    // Log the database error for debugging
    error_log("Database Error in send_reply.php: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
    exit(); // Stop script execution
} catch (Exception $e) {
    // Catch any other unexpected exceptions
    http_response_code(500); // Internal Server Error
    // Log the general error for debugging
    error_log("General Error in send_reply.php: " . $e->getMessage());
    echo json_encode(["success" => false, "error" => "An unexpected error occurred: " . $e->getMessage()]);
    exit(); // Stop script execution
}
