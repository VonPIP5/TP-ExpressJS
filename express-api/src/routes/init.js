const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Bienvenue sur l'API de Mael DESSUS et Julien LEFEBVRE" });
});

module.exports = router;
