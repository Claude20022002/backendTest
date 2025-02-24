const mysql = require("mysql");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Ajout de JWT pour gérer les tokens
const dotenv = require("dotenv"); // Chargement des variables d'environnement
const util = require("util"); // Permet d'utiliser des promesses avec MySQL

dotenv.config(); // Charger les variables d'environnement

const app = express();

// Configuration de la base de données MySQL
const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "database_test",
});

// Connexion à la base de données
database.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion à la base de données :", err);
    } else {
        console.log("✅ Connecté à la base de données MySQL");
    }
});

// Convertir database.query en promesse pour éviter les callbacks
database.query = util.promisify(database.query);

app.use(cors());
app.use(express.json()); // Permet d'interpréter les requêtes JSON

// 🔐 Fonction pour générer un token JWT
const generateToken = (user) => {
    return jwt.sign(
        { userId: user.id, email: user.email }, // Payload (contenu du token)
        process.env.JWT_SECRET, // Clé secrète stockée dans .env
        { expiresIn: "1h" } // Expiration en 1 heure
    );
};

// 🛡 Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token du header

    if (!token) {
        return res
            .status(401)
            .json({ message: "Accès refusé, token manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide" });
        }
        req.user = decoded; // Ajout des infos du token à la requête
        next();
    });
};

// 📌 Route POST pour l'inscription d'un utilisateur
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez remplir tous les champs" });
        }

        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regex.test(email)) {
            return res.status(400).json({ message: "Email non valide" });
        }

        const existingUser = await database.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await database.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        return res
            .status(201)
            .json({ message: "Utilisateur créé avec succès" });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});

// 🔑 Route POST pour la connexion d'un utilisateur
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Veuillez remplir tous les champs" });
        }

        const user = await database.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (user.length === 0) {
            return res
                .status(400)
                .json({ message: "Email ou mot de passe incorrect" });
        }

        const match = await bcrypt.compare(password, user[0].password);

        if (!match) {
            return res
                .status(400)
                .json({ message: "Email ou mot de passe incorrect" });
        }

        // Générer un token JWT
        const token = generateToken(user[0]);

        return res.status(200).json({ message: "Connexion réussie", token });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 🗑 Route sécurisée pour supprimer un utilisateur
app.post("/delete", verifyToken, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res
                .status(400)
                .json({ message: "Veuillez remplir tous les champs" });
        }

        const user = await database.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({ message: "Email non trouvé" });
        }

        await database.query("DELETE FROM users WHERE email = ?", [email]);

        return res.status(200).json({ message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 🔄 Route sécurisée pour modifier un utilisateur
app.post("/update", verifyToken, async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res
                .status(400)
                .json({ message: "Veuillez remplir tous les champs" });
        }

        const user = await database.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (user.length === 0) {
            return res.status(400).json({ message: "Email non trouvé" });
        }

        await database.query("UPDATE users SET name = ? WHERE email = ?", [
            name,
            email,
        ]);

        return res.status(200).json({ message: "Nom modifié" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 📋 Route sécurisée pour récupérer tous les utilisateurs
app.get("/users", verifyToken, async (req, res) => {
    try {
        const users = await database.query("SELECT * FROM users");
        return res.status(200).json(users);
    } catch (error) {
        console.error(
            "❌ Erreur lors de la récupération des utilisateurs :",
            error
        );
        return res.status(500).json({ message: "Erreur serveur" });
    }
});

app.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await database.query(
            "SELECT id, name, email FROM users WHERE id = ?",
            [req.user.userId]
        );
        if (user.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        return res.status(200).json(user[0]); // Retourne l'utilisateur
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur" });
    }
});

// 🚀 Démarrer le serveur sur le port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
