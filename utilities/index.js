const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Navigation builder
 ************************** */
async function getNav() {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" 
      title="See our inventory of ${row.classification_name} vehicles">
      ${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}

/* ************************
 * Classification grid builder
 ************************** */
async function buildClassificationGrid(data) {
  if (data.length > 0) {
    let grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += `<li>
        <a href="../../inv/detail/${vehicle.inv_id}" 
          title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" 
          alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" 
              title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`
    })
    grid += "</ul>"
    return grid
  }
  return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
}

/* ************************
 * Error handler wrapper
 ************************** */
const handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ************************
 * Vehicle detail builder
 ************************** */
function buildVehicleDetailHTML(vehicle) {
  const price = vehicle.inv_price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
  const mileage = vehicle.inv_miles.toLocaleString("en-US")

  return `
    <section class="vehicle-detail">
      <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="vehicle-container">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-info">
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> ${price}</p>
          <p><strong>Mileage:</strong> ${mileage} miles</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        </div>
      </div>
    </section>
  `
}

/* ************************
 * Classification select list
 ************************** */
async function buildClassificationList(classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" 
      ${classification_id == row.classification_id ? "selected" : ""}>
      ${row.classification_name}</option>`
  })
  classificationList += "</select>"
  return classificationList
}

/* ************************
 * Validation rules
 ************************** */
function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .isAlphanumeric()
      .withMessage("Classification name must contain only letters and numbers.")
      .notEmpty()
      .withMessage("Classification name is required."),
  ]
}

function inventoryRules() {
  return [
    body("inv_make").trim().isLength({ min: 1 }).withMessage("Make is required."),
    body("inv_model").trim().isLength({ min: 1 }).withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Year must be valid."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be positive."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Mileage must be positive."),
    body("inv_color").trim().isAlpha().withMessage("Color must contain only letters."),
    body("inv_description").trim().isLength({ min: 1 }).withMessage("Description is required."),
    body("classification_id").isInt().withMessage("Classification is required."),
    body("inv_image").trim().isLength({ min: 1 }).withMessage("Image path is required."),
    body("inv_thumbnail").trim().isLength({ min: 1 }).withMessage("Thumbnail path is required."),
  ]
}

function newInventoryRules() {
  return [...inventoryRules(), body("inv_id").isInt().withMessage("Inventory ID is required.")]
}

function accountUpdateRules() {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("First name is required."),
    body("account_lastname").trim().isLength({ min: 1 }).withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required.")
      .custom(async (email, { req }) => {
        const account_id = req.body.account_id
        const existing = await accountModel.getAccountByEmail(email)
        if (existing && existing.account_id != account_id) {
          throw new Error("Email already exists. Choose another.")
        }
      }),
  ]
}

function passwordRules() {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 8 characters and include upper, lower, number, and symbol."),
  ]
}

/* ************************
 * Validation error handlers
 ************************** */
async function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors: errors.array(),
      classification_name: req.body.classification_name,
    })
    return
  }
  next()
}

async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    const classificationList = await buildClassificationList(req.body.classification_id)
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      message: req.flash("notice"),
      errors: errors.array(),
      ...req.body,
    })
    return
  }
  next()
}

async function checkUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    const classificationSelect = await buildClassificationList(req.body.classification_id)
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`
    return res.render("./inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      ...req.body,
    })
  }
  next()
}

async function checkAccountUpdateData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    const accountData = await accountModel.getAccountById(req.body.account_id)
    return res.render("./account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData,
    })
  }
  next()
}

async function checkPasswordData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    const accountData = await accountModel.getAccountById(req.body.account_id)
    return res.render("./account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData,
    })
  }
  next()
}

/* ************************
 * JWT and account type middleware
 ************************** */
/* ****************************************
 * Middleware to check token validity
 **************************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 * Middleware to check account type for admin inventory routes
 **************************************** */
function checkAccountType(req, res, next) {
  if (res.locals.loggedin && res.locals.accountData) {
    const accountType = res.locals.accountData.account_type
    if (accountType === "Employee" || accountType === "Admin") {
      return next()
    }
  }
  req.flash(
    "notice",
    "You must be logged in with Employee or Admin privileges to access that page."
  )
  return res.redirect("/account/login")
}

/* ****************************************
 * Exports
 **************************************** */
module.exports = {
  getNav,
  buildClassificationGrid,
  handleErrors,
  buildVehicleDetailHTML,
  buildClassificationList,
  classificationRules,
  checkClassificationData,
  inventoryRules,
  newInventoryRules,
  checkInventoryData,
  checkUpdateData,
  checkJWTToken,
  checkAccountType,
  accountUpdateRules,
  checkAccountUpdateData,
  passwordRules,
  checkPasswordData
}