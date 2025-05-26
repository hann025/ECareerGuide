<?php
// jwt_helper.php - JWT Functions

// Corrected path: Go up one directory from 'api' to 'backend', then into 'vendor'
require __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Secret Key - Make this more secure in production
define('JWT_SECRET', 'Munet@05');

function generate_jwt($payload) {
    try {
        return JWT::encode($payload, JWT_SECRET, 'HS256');
    } catch (Exception $e) {
        error_log("JWT Generation Error: " . $e->getMessage());
        return null;
    }
}

function validate_jwt($token) {
    try {
        return JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
    } catch (Exception $e) {
        error_log("JWT Validation Error: " . $e->getMessage());
        return null;
    }
}
