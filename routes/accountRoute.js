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
router.get("/", utilities.handleErrors(accountController.buildAccountManagement))

// Deliver update account view
router.get(
  "/update/:account_id",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// Process account info update
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.accountUpdateRules(),
  utilities.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Process password change
router.post(
  "/update-password",
  utilities.checkJWTToken,
  utilities.passwordRules(),
  utilities.checkPasswordData,   // ⚠️ must be defined in utilities/index.js
  utilities.handleErrors(accountController.updatePassword)
)

// Logout route
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))

module.exports = router