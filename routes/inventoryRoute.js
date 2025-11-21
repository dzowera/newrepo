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

module.exports = router