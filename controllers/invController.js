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
    const nav = await utilities.getNav()   // ✅ build the nav

    res.render("inventory/details", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,                                // ✅ pass nav to the view
      content: html
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { buildByClassificationId, buildById }