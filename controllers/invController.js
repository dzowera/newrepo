const invModel = require("../models/inventory-model.js")
const utilities = require("../utilities/")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId(req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
async function buildById(req, res, next) {
  try {
    const invId = parseInt(req.params.id)
    const vehicleData = await invModel.getVehicleById(invId)

    if (!vehicleData) {
      return res.status(404).send("Vehicle not Found")
    }

    const html = utilities.buildVehicleDetailHTML(vehicleData)
    const nav = await utilities.getNav()   // build the nav

    res.render("inventory/details", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,                                //  pass nav to the view
      content: html
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
async function buildManagementView(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("notice")
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    message: req.flash("notice")
  })
}

/* ***************************
 *  Process add classification form
 * ************************** */
async function addClassification(req, res, next) {
  const { classification_name } = req.body
  let nav = await utilities.getNav()

  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("notice", "Classification added successfully.")
      const newNav = await utilities.getNav() // rebuild nav with new classification
      res.render("inventory/management", {
        title: "Inventory Management",
        nav: newNav,
        message: req.flash("notice")
      })
    } else {
      req.flash("notice", "Sorry, adding classification failed.")
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        message: req.flash("notice"),
        classification_name
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred.")
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      classification_name
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    message: req.flash("notice")
  })
}

/* ***************************
 *  Process add inventory form
 * ************************** */
async function addInventory(req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_image,
    inv_thumbnail
  } = req.body

  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(classification_id)

  try {
    const result = await invModel.addInventory(
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail
    )

    if (result) {
      req.flash("notice", "Inventory item added successfully.")
      const newNav = await utilities.getNav()
      res.render("inventory/management", {
        title: "Inventory Management",
        nav: newNav,
        message: req.flash("notice")
      })
    } else {
      req.flash("notice", "Sorry, adding inventory failed.")
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        message: req.flash("notice"),
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        inv_image,
        inv_thumbnail
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred.")
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      message: req.flash("notice"),
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail
    })
  }
}

module.exports = { 
  buildByClassificationId, 
  buildById, 
  buildManagementView, 
  buildAddClassification, 
  addClassification,       
  buildAddInventory,
  addInventory              // <-- new export
}