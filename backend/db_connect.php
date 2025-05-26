<?php
// db_connect.php - Database connection file

$host = 'localhost';
$dbname = 'ecareer_guidance';
$username = 'root';
$password = 'Munet@05';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
