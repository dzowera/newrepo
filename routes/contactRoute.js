const express = require("express");
const router = new express.Router();
const contactController = require("../controllers/contactController");
const utilities = require("../utilities/");

router.get("/", utilities.handleErrors(contactController.buildContactForm));
router.post("/send", utilities.handleErrors(contactController.sendMessage));
router.get("/messages", utilities.handleErrors(contactController.viewMessages));

module.exports = router;