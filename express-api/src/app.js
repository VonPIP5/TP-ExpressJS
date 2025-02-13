const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Définition des routes
const routeInit = require("./routes/init");
app.use("/api/init", routeInit);

// Route de base pour tester si l'API fonctionne
app.get("/", (req, res) => {
    res.json({ message: "Bienvenue sur l'API !" });
});

// Exporter app APRES avoir défini les routes
module.exports = app;
