const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { validationResult } = require("express-validator")   // ✅ added
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", { 
    title: "Login", 
    nav, 
    loggedin: res.locals.loggedin,
    accountData: res.locals.accountData,
    message: req.flash("notice"), 
    errors: null 
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", { 
    title: "Register", 
    nav, 
    message: req.flash("notice"), 
    errors: null 
  })
}

/* ****************************************
*  Process registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // ✅ Hash password before saving
  const hashedPassword = await bcrypt.hash(account_password, 10)

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult.rows && regResult.rows[0]) {
    req.flash("notice", `Congratulations, ${account_firstname}. You're registered! Please log in.`)
    res.redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, registration failed.")
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      message: req.flash("notice"),
      errors: null,
      account_email,
    })
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 } // 1 hour
      )

      // Cookie setup
      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000
      }
      if (process.env.NODE_ENV !== "development") {
        cookieOptions.secure = true
      }
      res.cookie("jwt", accessToken, cookieOptions)

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        message: req.flash("notice"),
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData // set by JWT middleware

  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
    message: req.flash("notice"),
    errors: null
  })
}

/* ****************************************
 *  Deliver update account view
 * ************************************ */
async function buildUpdateAccount(req, res) {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    message: req.flash("notice"),
    accountData
  })
}

/* ****************************************
 *  Process account info update
 * ************************************ */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: req.flash("notice"),
      accountData: { account_id, account_firstname, account_lastname, account_email }
    })
  }

  const result = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)

  if (result) {
    req.flash("notice", "Account information updated successfully.")
  } else {
    req.flash("notice", "Update failed.")
  }

  const updatedData = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: updatedData,
    message: req.flash("notice"),
    errors: null
  })
}

/* ****************************************
 *  Process password update
 * ************************************ */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: req.flash("notice"),
      accountData
    })
  }

  const hashedPassword = await bcrypt.hash(account_password, 10)
  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    req.flash("notice", "Password updated successfully.")
  } else {
    req.flash("notice", "Password update failed.")
  }

  const updatedData = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData: updatedData,
    message: req.flash("notice"),
    errors: null
  })
}

/* ***************************
 *  Logout Process
 * ************************** */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have successfully logged out.")
  res.redirect("/")
}

module.exports = { 
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  logoutAccount
}