const { body, validationResult } = require("express-validator")
const utilities = require("./") // so we can use getNav if needed

/* ***************************
 * Login Validation Rules
 * ************************** */
const loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail().withMessage("Please provide a valid email address.")
      .normalizeEmail(),
    body("account_password")
      .trim()
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
  ]
}

/* ***************************
 * Check Login Data and Return Errors
 * ************************** */
const checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email // sticky input
    })
  }
  next()
}

module.exports = { loginRules, checkLoginData }