const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Définition des routes
const routeInit = require("./routes/init");
app.use("/", routeInit);

const routeTest = require("./routes/test");
app.use("/test", routeTest);


const registerRoute = require("./routes/register");
app.use("/register", registerRoute);


module.exports = app;
