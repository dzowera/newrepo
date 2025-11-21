const invModel = require("../models/inventory-model")

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

module.exports = {
  getNav,
  buildClassificationGrid,
  handleErrors,
  buildVehicleDetailHTML,
}