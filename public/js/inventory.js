'use strict'

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")

classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value
  console.log(`classification_id is: ${classification_id}`)

  let classIdURL = "/inv/getInventory/" + classification_id

  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json()
      }
      throw Error("Network response was not OK")
    })
    .then(function (data) {
      console.log(data)
      buildInventoryList(data)
    })
    .catch(function (error) {
      console.log("There was a problem: ", error.message)
    })
})

// Function to build the inventory table dynamically
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay")

  // Clear any existing content
  inventoryDisplay.innerHTML = ""

  if (data.length === 0) {
    inventoryDisplay.innerHTML = "<p>No vehicles found for this classification.</p>"
    return
  }

  // Build table header
  let tableHTML = "<thead><tr><th>Make</th><th>Model</th><th>Year</th><th>Price</th><th>Modify</th><th>Delete</th></tr></thead><tbody>"

  // Build rows
  data.forEach(vehicle => {
    tableHTML += `<tr>
      <td>${vehicle.inv_make}</td>
      <td>${vehicle.inv_model}</td>
      <td>${vehicle.inv_year}</td>
      <td>$${vehicle.inv_price.toLocaleString()}</td>
      <td><a href="/inv/edit/${vehicle.inv_id}">Modify</a></td>
      <td><a href="/inv/delete/${vehicle.inv_id}">Delete</a></td>
    </tr>`
  })

  tableHTML += "</tbody>"

  // Inject into the table
  inventoryDisplay.innerHTML = tableHTML
}