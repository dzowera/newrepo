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
  let className = "No Vehicles Found"
  if (data.length > 0) {
    className = data[0].classification_name
  }
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
    const nav = await utilities.getNav()

    res.render("inventory/details", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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
      const newNav = await utilities.getNav()
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
  let {
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

  // Ensure defaults for image paths
  inv_image = inv_image && inv_image.trim() !== "" ? inv_image : "/images/no-image.png"
  inv_thumbnail = inv_thumbnail && inv_thumbnail.trim() !== "" ? inv_thumbnail : "/images/no-image-tn.png"

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

/* ***************************
 *  Return inventory JSON data
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  res.json(data)
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
async function editInventoryView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

module.exports = {
  buildByClassificationId,
  buildById,
  buildManagementView,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  getInventoryJSON,
  editInventoryView
}