const session = require("express-session");
const pool = require("./database/");
const cookieParser = require("cookie-parser");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const accountRoute = require("./routes/accountRoute");

// View Engine and Templates
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(cookieParser());
app.set("layout", "./layouts/layout");
app.use(utilities.checkJWTToken);

// Middleware
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
}));

app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use(static);
app.use("/account", accountRoute);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.get("/error", utilities.handleErrors(baseController.throwError));

// 404 handler
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

// Error handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message = err.status == 404
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?";
  res.render("errors/error", {
    title: err.status ? `${err.status} Error` : "Server Error",
    message,
    nav,
  });
});

// Server info
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});