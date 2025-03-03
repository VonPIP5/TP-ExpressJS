require('dotenv').config(); 

const express = require("express");
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');
require('./config/passport-config'); // Assure-toi que ce chemin est correct


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Session middleware (doit être avant passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
  }));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Définition des routes
const routeInit = require("./routes/init");
app.use("/", routeInit);

const routeTest = require("./routes/test");
app.use("/test", routeTest);

const registerRoute = require("./routes/register");
app.use("/register", registerRoute);

const addFileRoute = require("./routes/add-file");
app.use("/add-file", addFileRoute);

const profilRoute = require("./routes/profil");
app.use("/profil", profilRoute);

const loginRoute = require("./routes/login");
app.use("/login", loginRoute);

const deleteRoute = require("./routes/delete");
app.use("/user/rm", deleteRoute);

const listRoute = require("./routes/list");
app.use("/user/list", listRoute);

const upRoute = require("./routes/up");
app.use("/user/up", upRoute);

const downRoute = require("./routes/down");
app.use("/user/down", downRoute)

const banRoute = require("./routes/ban");
app.use("/user/ban", banRoute)

module.exports = app;
