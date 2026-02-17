const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {

  try {
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

  } catch(error) {
    next(error)
  }
}

// // Build inventory by invID

// invCont.buildDetail = async function (req, res, next) {
//   try {
//     const invId = req.params.invId

//     const data = await invModel.getInventoryByInvId(invId)

//     const detailContainer = await utilities.buildDetailContainer(data)

//     let nav = await utilities.getNav()

//     const className = data[0].classification_name

//     res.render("./inventory/detail", {
//       title: `${data[0].inv_make} ${data[0].inv_model}`,
//       nav,
//       detailContainer,
//     })
    
//   } catch (error) {
//     next(error)
//   }
// }

invCont.buildDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const data = await invModel.getInventoryByInvId(invId)

    if (!data || data.length === 0) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const vehicle = data[0]
    
    const reactionCounts = await invModel.getReactionCounts(invId)
    
    let userReaction = null
    if (res.locals.loggedin) {
      userReaction = await invModel.getUserReaction(invId, res.locals.accountData.account_id)
    }

    const detailContainer = await utilities.buildDetailContainer(
      data, 
      reactionCounts, 
      userReaction,
      res.locals.loggedin
    )

    let nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      detailContainer,
    })
    
  } catch (error) {
    next(error)
  }
}


invCont.getError = async function (req, res, next) {

  try {
    throw new Error("Intentional error for testing")
  } catch (error) {
    next(error)
  }
}

// responsible for delivering the inventory management view.

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const messages = req.flash('notice')

  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    messages,
    classificationSelect,
    // errors: null?
  })
}


invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    messages: null,
  })
}

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  const result = await invModel.insertClassification(classification_name)

  if (result) {

    req.flash("notice", `The ${classification_name} classification was successfully added.`)

    res.redirect("/inv/") 
  } else {

    req.flash("notice", "Sorry, the insertion failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      errors: null,
    })
  }
}


invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  let classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
  })
}

invCont.addInventory = async function (req, res) {
  const { 
    inv_make, inv_model, inv_year, inv_description, 
    inv_image, inv_thumbnail, inv_price, inv_miles, 
    inv_color, classification_id 
  } = req.body

  const result = await invModel.insertInventory(
    inv_make, inv_model, inv_year, inv_description, 
    inv_image, inv_thumbnail, inv_price, inv_miles, 
    inv_color, classification_id
  )

  if (result) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Error adding the vehicle. Please try again.")
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */

invCont.editInventoryView = async function (req, res, next) {

  const inv_id = parseInt(req.params.inv_id)

  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryByInvId(inv_id)
  
  const vehicleData = Array.isArray(itemData) ? itemData[0] : itemData;

  const classificationSelect = await utilities.buildClassificationList(vehicleData.classification_id)

  const itemName = `${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render("./inventory/edit-inventory", {

    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: vehicleData.inv_id,
    inv_make: vehicleData.inv_make,
    inv_model: vehicleData.inv_model,
    inv_year: vehicleData.inv_year,
    inv_description: vehicleData.inv_description,
    inv_image: vehicleData.inv_image,
    inv_thumbnail: vehicleData.inv_thumbnail,
    inv_price: vehicleData.inv_price,
    inv_miles: vehicleData.inv_miles,
    inv_color: vehicleData.inv_color,
    classification_id: vehicleData.classification_id
  })

}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
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
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}


/* ***************************
 *  Build delete inventory view
 * ************************** */

invCont.deleteInventoryView = async function (req, res, next) {

  const inv_id = parseInt(req.params.inv_id)

  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryByInvId(inv_id)
  
  const vehicleData = Array.isArray(itemData) ? itemData[0] : itemData;

  const itemName = `${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render("./inventory/delete-confirm", {

    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: vehicleData.inv_id,
    inv_make: vehicleData.inv_make,
    inv_model: vehicleData.inv_model,
    inv_price: vehicleData.inv_price,
    inv_year: vehicleData.inv_year
  })

}


/* ***************************
 *  Delete Inventory Data
 * ************************** */

invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year
  } = req.body

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", `The deletion was successfully made.`)
    res.redirect("/inv/")
  } 
  
  else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-confirm.ejs", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year
    })
  }
}

invCont.handleReaction = async function (req, res) {
  const { inv_id, reaction_type } = req.body
  const account_id = res.locals.accountData.account_id 

  try {
    // keep or update reaction - SQL ON CONFLICT important!!

    await invModel.upsertReaction(inv_id, account_id, reaction_type)

    // Get updated counts
    const updatedCounts = await invModel.getReactionCounts(inv_id)

    res.json({ success: true, counts: updatedCounts })

  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong" })
  }
}



module.exports = invCont
