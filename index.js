require("dotenv").config();
const express = require("express");
const session = require("express-session");
const router = require("./app/routers");
const cors = require("cors");
const app = express();
const { errorHandler } = require("./app/services/errorHandler");

// Decode body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Session utilisateur
app.use(
  session({
    saveUninitialized: true,
    resave: true,
    secret: process.env.SESSION_SECRET || "insert a secret",
  })
);

// Service /api routes
app.use("/api", cors({ origin: "*" }), router);

router.use((err, _, response, next) => {
  errorHandler(err, response, next);
});

app.use(function (req, res, next) {
  res.status(404).send("API Route not found");
});

// Start app
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server up, listening at port : ${port}`);
});
