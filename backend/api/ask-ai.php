<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["message"])) {
    echo json_encode(["error" => "No message provided"]);
    exit;
}

$message = $data["message"];
$apiKey = "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";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://openrouter.ai/api/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json",
    "HTTP-Referer: http://localhost",  // REQUIRED: update this to your domain later
    "X-Title: AI-CAREER-PROJECT" // name of your app/project
]);

$body = [
    "model" => "mistralai/mistral-7b-instruct", // or "openchat/openchat-3.5"
    "messages" => [
        ["role" => "system", "content" => "You are a helpful career guidance assistant."],
        ["role" => "user", "content" => $message]
    ]
];

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($httpcode !== 200) {
    echo json_encode(["error" => "OpenRouter request failed with status code: $httpcode"]);
} else {
    $responseData = json_decode($response, true);
    echo json_encode(["reply" => $responseData["choices"][0]["message"]["content"]]);
}

curl_close($ch);
?>
