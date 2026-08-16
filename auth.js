import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "ВСТАВЬ_СВОЙ_API_KEY",

    authDomain: "ВСТАВЬ_СВОЙ_AUTH_DOMAIN",

    projectId: "ВСТАВЬ_СВОЙ_PROJECT_ID",

    storageBucket: "ВСТАВЬ_СВОЙ_STORAGE_BUCKET",

    messagingSenderId: "ВСТАВЬ_СВОЙ_MESSAGING_SENDER_ID",

    appId: "ВСТАВЬ_СВОЙ_APP_ID"
};


// =====================================================
// FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();


// =====================================================
// ELEMENTS
// =====================================================

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const googleButton =
    document.getElementById("googleButton");

const status =
    document.getElementById("status");


// =====================================================
// STATUS
// =====================================================

function setStatus(text) {

    status.textContent = text;
}


// =====================================================
// FIREBASE USER → UNITY
// =====================================================

function returnToGame(user) {

    if (!user) {
        setStatus("Не удалось получить аккаунт.");
        return;
    }

    const uid = user.uid;

    const email = user.email || "";

    const displayName =
        user.displayName || "";


    /*
        ВАЖНО:

        Здесь мы НЕ передаём пароль.

        Firebase уже проверил пользователя.

        Unity получит UID и сможет дальше
        использовать его для идентификации.
    */

    const url =
        "primezone://auth" +
        "?uid=" + encodeURIComponent(uid) +
        "&email=" + encodeURIComponent(email) +
        "&name=" + encodeURIComponent(displayName);


    setStatus("Авторизация успешна. Возвращаемся в игру...");


    setTimeout(() => {

        window.location.href = url;

    }, 500);
}


// =====================================================
// GOOGLE
// =====================================================

googleButton.addEventListener("click", async () => {

    try {

        setStatus("Открываем Google...");

        googleButton.disabled = true;

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user =
            result.user;

        returnToGame(user);

    }
    catch (error) {

        console.error(error);

        googleButton.disabled = false;

        setStatus(
            "Ошибка Google: " +
            error.message
        );
    }

});


// =====================================================
// EMAIL / PASSWORD
// =====================================================

loginButton.addEventListener("click", async () => {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        setStatus(
            "Введите email и пароль."
        );

        return;
    }


    try {

        setStatus("Выполняется вход...");

        loginButton.disabled = true;


        let userCredential;


        try {

            // Сначала пытаемся войти
            userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

        }
        catch (error) {

            /*
                Если аккаунта ещё нет,
                создаём его автоматически.
            */

            if (
                error.code ===
                "auth/user-not-found"
            ) {

                userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

            }
            else {

                throw error;

            }
        }


        returnToGame(
            userCredential.user
        );

    }
    catch (error) {

        console.error(error);

        loginButton.disabled = false;

        let message =
            "Ошибка авторизации.";


        if (
            error.code ===
            "auth/wrong-password"
        ) {

            message =
                "Неверный пароль.";

        }
        else if (
            error.code ===
            "auth/invalid-credential"
        ) {

            message =
                "Неверный email или пароль.";

        }
        else if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "Этот email уже используется.";

        }
        else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Пароль слишком простой.";

        }


        setStatus(message);

    }

});
