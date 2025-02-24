document.addEventListener("DOMContentLoaded", () => {
    // 🔹 Inscription
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;

            if (!name || !email || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                    return;
                }

                // Stocker l'utilisateur de manière sécurisée avec un JWT
                localStorage.setItem(
                    "user",
                    JSON.stringify({ email, token: data.token })
                );

                alert("Inscription réussie !");
                window.location.href = "login.html";
            } catch (error) {
                alert("Erreur lors de l'inscription. Veuillez réessayer.");
            }
        });
    }

    // 🔹 Connexion
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const newLocal = "http://localhost:5000/login";
                const response = await fetch(newLocal, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (data.error) {
                    alert("Email ou mot de passe incorrect.");
                    return;
                }

                // Stocker le token dans sessionStorage
                sessionStorage.setItem("token", data.token);
                alert("Connexion réussie !");
                window.location.href = "dashboard.html";
            } catch (error) {
                alert("Erreur lors de la connexion. Veuillez réessayer.");
            }
        });
    }

    // 🔹 Vérification de connexion avant l'accès au Dashboard
    if (window.location.pathname.includes("dashboard.html")) {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Accès refusé. Veuillez vous connecter.");
            window.location.href = "login.html";
        }
    }

    // 🔹 Déconnexion
    window.logout = () => {
        sessionStorage.removeItem("token");
        alert("Déconnexion réussie !");
        window.location.href = "login.html";
    };
});
