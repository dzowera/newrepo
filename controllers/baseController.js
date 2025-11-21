const utilities = require("../utilities/")
const baseController = {}

/* ****************************************
 * Build Home view
 **************************************** */
baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", { title: "Home", nav })
}

/* ****************************************
 * Intentional Error Controller (Task 3)
 * **************************************** */
baseController.throwError = async function(req, res, next) {
  // This will trigger the error handler middleware
  throw new Error("Intentional 500 error triggered for Task 3 testing")
}

module.exports = baseController