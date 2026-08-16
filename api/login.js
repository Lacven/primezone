const mysql = require("mysql2/promise");
const crypto = require("crypto");

function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed"
        });
    }

    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Введите логин и пароль"
            });
        }

        if (username.length < 3 || username.length > 32) {
            return res.status(400).json({
                success: false,
                message: "Логин должен быть от 3 до 32 символов"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Пароль должен быть минимум 6 символов"
            });
        }

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                rejectUnauthorized: false
            }
        });

        const [users] = await connection.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
            [username]
        );

        // Пользователя нет — создаём автоматически
        if (users.length === 0) {
            const passwordHash = hashPassword(password);

            const [result] = await connection.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                [username, passwordHash]
            );

            await connection.end();

            return res.status(200).json({
                success: true,
                new_user: true,
                user_id: result.insertId,
                username: username
            });
        }

        const user = users[0];
        const passwordHash = hashPassword(password);

        if (passwordHash !== user.password_hash) {
            await connection.end();

            return res.status(401).json({
                success: false,
                message: "Неверный пароль"
            });
        }

        await connection.end();

        return res.status(200).json({
            success: true,
            new_user: false,
            user_id: user.id,
            username: user.username
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Ошибка сервера"
        });
    }
};