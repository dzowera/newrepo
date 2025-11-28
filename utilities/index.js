const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav(req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 ************************************ */
async function buildClassificationGrid(data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        " details\">" +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid +=
      '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
const handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Build vehicle detail HTML
 **************************************** */
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

/* ****************************************
 * Build classification select list
 **************************************** */
async function buildClassificationList(classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Validation Rules for Classification
 **************************************** */
function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .isAlphanumeric()
      .withMessage("Classification name must contain only letters and numbers.")
      .notEmpty()
      .withMessage("Classification name is required.")
  ]
}

/* ****************************************
 * Check Classification Data and Return Errors
 **************************************** */
async function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors: errors.array(),
      classification_name: req.body.classification_name
    })
    return
  }
  next()
}

/* ****************************************
 * Validation Rules for Inventory
 **************************************** */
function inventoryRules() {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid number."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive integer."),
    body("inv_color")
      .trim()
      .isAlpha()
      .withMessage("Color must contain only letters."),
    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required."),
    body("classification_id")
      .isInt()
      .withMessage("Classification is required."),
    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Thumbnail path is required.")
  ]
}

/* ****************************************
 * Check Inventory Data and Return Errors
 **************************************** */
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
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail
    })
    return
  }
  next()
}

module.exports = {
  getNav,
  buildClassificationGrid,
  handleErrors,
  buildVehicleDetailHTML,
  buildClassificationList,
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData
}