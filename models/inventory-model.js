const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get vehicle by ID
 * ************************** */
async function getVehicleById(invId) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [invId]
    )
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("addClassification error:", error)
    return null
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(
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
) {
  try {
    const sql = `INSERT INTO public.inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_image, inv_thumbnail) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`

    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image || "/images/no-image.png",
      inv_thumbnail || "/images/no-image-tn.png"
    ])

    return data.rows[0]
  } catch (error) {
    console.error("addInventory error:", error)
    return null
  }
}

/* ***************************
 *  Update existing inventory item
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $2,
          inv_model = $3,
          inv_description = $4,
          inv_image = $5,
          inv_thumbnail = $6,
          inv_price = $7,
          inv_year = $8,
          inv_miles = $9,
          inv_color = $10,
          classification_id = $11
      WHERE inv_id = $1
      RETURNING *;
    `
    const data = await pool.query(sql, [
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image || "/images/no-image.png",
      inv_thumbnail || "/images/no-image-tn.png",
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("updateInventory error:", error)
    return null
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  updateInventory
}