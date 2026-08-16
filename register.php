<?php

header("Content-Type: application/json");

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = $data["password"] ?? "";

if ($username === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Введите логин и пароль"
    ]);

    exit;
}

if (strlen($username) < 3 || strlen($username) > 32) {
    echo json_encode([
        "success" => false,
        "message" => "Логин должен быть от 3 до 32 символов"
    ]);

    exit;
}

if (strlen($password) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Пароль должен быть минимум 6 символов"
    ]);

    exit;
}

$stmt = $pdo->prepare(
    "SELECT id FROM users WHERE username = ?"
);

$stmt->execute([$username]);

if ($stmt->fetch()) {
    echo json_encode([
        "success" => false,
        "message" => "Пользователь уже существует"
    ]);

    exit;
}

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);

$stmt = $pdo->prepare(
    "INSERT INTO users (username, password_hash)
     VALUES (?, ?)"
);

$stmt->execute([
    $username,
    $passwordHash
]);

echo json_encode([
    "success" => true,
    "message" => "Аккаунт создан"
]);
