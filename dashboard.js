document.addEventListener("DOMContentLoaded", async () => {
    const username = document.getElementById("username");

    if (username) {
        const token = sessionStorage.getItem("token"); // Récupération du token
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

            if (!response.ok) {
                throw new Error(
                    "Échec de la récupération des informations utilisateur."
                );
            }

            const data = await response.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            username.textContent = data.name;
        } catch (error) {
            alert("Erreur lors de la récupération de l'utilisateur.");
            console.error(error);
        }
    }
});
