// Enregistrer un utilisateur dans le localStorage
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;

            if (!name || !email || !password) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            // Stocker l'utilisateur dans localStorage (persiste après fermeture du navigateur)
            localStorage.setItem(
                "user",
                JSON.stringify({ name, email, password })
            );
            alert("Inscription réussie !");
            window.location.href = "login.html"; // Redirection vers la page de connexion
        });
    }

    // Connexion de l'utilisateur
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            const storedUser = JSON.parse(localStorage.getItem("user"));

            if (
                !storedUser ||
                storedUser.email !== email ||
                storedUser.password !== password
            ) {
                alert("Email ou mot de passe incorrect.");
                return;
            }

            // Stocker la connexion temporairement dans sessionStorage
            sessionStorage.setItem("loggedIn", "true");
            alert("Connexion réussie !");
            window.location.href = "dashboard.html"; // Redirection après connexion
        });
    }

    // Vérifier si l'utilisateur est connecté avant d'accéder au dashboard
    if (window.location.pathname.includes("dashboard.html")) {
        const isLoggedIn = sessionStorage.getItem("loggedIn");
        if (!isLoggedIn) {
            alert("Accès refusé. Veuillez vous connecter.");
            window.location.href = "login.html"; // Redirection vers la connexion
        }
    }
});

// Déconnexion
function logout() {
    sessionStorage.removeItem("loggedIn");
    alert("Déconnexion réussie !");
    window.location.href = "login.html"; // Redirection vers la connexion
}
