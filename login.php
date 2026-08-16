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

$stmt = $pdo->prepare(
    "SELECT id, username, password_hash
     FROM users
     WHERE username = ?"
);

$stmt->execute([$username]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {

    // Пользователя нет — создаём автоматически

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
        "new_user" => true,
        "username" => $username
    ]);

    exit;
}

if (!password_verify(
    $password,
    $user["password_hash"]
)) {
    echo json_encode([
        "success" => false,
        "message" => "Неверный пароль"
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "new_user" => false,
    "username" => $user["username"]
]);
