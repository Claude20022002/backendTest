document.addEventListener("DOMContentLoaded", async () => {
    const username = document.getElementById("username");

    if (username) {
        const token = sessionStorage.getItem("token");
        console.log("Token récupéré :", token); // Vérifie si le token est bien stocké

        if (!token) {
            alert("Vous devez être connecté.");
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/me", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Statut de la réponse :", response.status); // Vérifie le statut HTTP

            if (!response.ok) {
                throw new Error(
                    "Échec de la récupération des informations utilisateur."
                );
            }

            const data = await response.json();
            console.log("Données reçues :", data); // Vérifie la réponse du serveur

            if (data.error) {
                alert(data.error);
                return;
            }

            username.textContent = data.name;
        } catch (error) {
            console.error("Erreur attrapée :", error);
            alert("Erreur lors de la récupération de l'utilisateur.");
        }
    }
});
