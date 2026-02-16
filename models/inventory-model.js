const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
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
    console.error("getclassificationsbyid error " + error)
  }
}

// Get item by inv_Id
async function getInventoryByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByInvId error " + error)
  }
}

/* *****************************
* Add New Classification
* *************************** */

async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Add New Inventory Item
* *************************** */

async function insertInventory( inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
  {
    try {
      const sql = `INSERT INTO public.inventory 
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`
      return await pool.query(sql, [
        inv_make, inv_model, inv_year, inv_description, 
        inv_image, inv_thumbnail, inv_price, inv_miles, 
        inv_color, classification_id
      ])
    } catch (error) {
      return error.message
    }
  }


/* ***************************
 *  Update Inventory Data
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
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(inv_id) {

  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

//  Get reaction counts for a vehicle

async function getReactionCounts(inv_id) {
  try {
    const sql = `SELECT reaction_type, COUNT(*) as count FROM public.inventory_reactions 
                 WHERE inv_id = $1 
                 GROUP BY reaction_type`

    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReactionCounts error " + error)
  }
}

// Getting specific user reaction

async function getUserReaction(inv_id, account_id) {
  try {
    const sql = `SELECT reaction_type FROM public.inventory_reactions 
                 WHERE inv_id = $1 AND account_id = $2`

    const result = await pool.query(sql, [inv_id, account_id])

    return result.rows.length > 0 ? result.rows[0].reaction_type : null

  } catch (error) {
    console.error("getUserReaction error " + error)
  }
}


async function upsertReaction(inv_id, account_id, reaction_type) {
  try {
    const sql = `INSERT INTO public.inventory_reactions (inv_id, account_id, reaction_type)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (inv_id, account_id) 
                 DO UPDATE SET reaction_type = EXCLUDED.reaction_type
                 RETURNING *`

    return await pool.query(sql, [inv_id, account_id, reaction_type])
    
  } catch (error) {
    console.error("upsertReaction error " + error)
  }
}


module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryByInvId, 
  insertClassification, 
  insertInventory, 
  updateInventory,
  deleteInventory,
  getReactionCounts,
  getUserReaction,
  upsertReaction
};

