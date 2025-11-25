const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", { title: "Login", nav });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", { title: "Register", nav, errors: null });
}

/* ****************************************
*  Process registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult.rows && regResult.rows[0]) {
    req.flash("notice", `Congratulations, ${account_firstname}. You're registered! Please log in.`);
    res.redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, registration failed.");
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email
    });
  }
}

module.exports = { 
  buildLogin,
  buildRegister,
  registerAccount
};

