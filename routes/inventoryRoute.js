// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/") // bring in utilities for error handling

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route for vehicle details view
router.get(
  "/detail/:id",
  utilities.handleErrors(invController.buildById)
)

/* ****************************************
* Inventory Management Routes
**************************************** */

// Route to build inventory management view
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
)

// Route to deliver add new classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// Route to deliver add new inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

// Route to process add classification form
router.post(
  "/add-classification",
  utilities.classificationRules(), // server-side validation rules
  utilities.checkClassificationData, // middleware to check validation results
  utilities.handleErrors(invController.addClassification)
)

// Route to process add inventory form
router.post(
  "/add-inventory",
  utilities.inventoryRules(),       // server-side validation rules
  utilities.checkInventoryData,     // middleware to check validation results
  utilities.handleErrors(invController.addInventory)
)

module.exports = router