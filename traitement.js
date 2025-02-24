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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                    return;
                }

                // 🔹 Stocker uniquement le token (pas l'email)
                sessionStorage.setItem("token", data.token);

                alert("Inscription réussie !");
                window.location.href = "dashboard.html";
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
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (data.error) {
                    alert("Email ou mot de passe incorrect.");
                    return;
                }

                // 🔹 Stocker le token correctement
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
        console.log("Token récupéré :", token);

        if (!token) {
            alert("Accès refusé. Veuillez vous connecter.");
            window.location.href = "login.html";
        } else {
            // 🔹 Récupération des infos de l'utilisateur
            fetch("http://localhost:5000/me", {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        alert("Erreur : " + data.error);
                        window.location.href = "login.html";
                    } else {
                        document.getElementById("username").textContent =
                            data.name;
                    }
                })
                .catch((error) => {
                    alert("Erreur lors de la récupération des informations.");
                    window.location.href = "login.html";
                });
        }
    }

    // 🔹 Déconnexion
    window.logout = () => {
        sessionStorage.removeItem("token");
        alert("Déconnexion réussie !");
        window.location.href = "login.html";
    };
});
