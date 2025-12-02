const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")


// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process registration form
router.post("/register", utilities.handleErrors(accountController.registerAccount))

// Default account management view
router.get(
  "/",
  utilities.handleErrors(accountController.buildAccountManagement)
)

module.exports = router