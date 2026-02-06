const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
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

// Build inventory by invID

invCont.buildDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId

    const data = await invModel.getInventoryByInvId(invId)
    const detailContainer = await utilities.buildDetailContainer(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name

    res.render("./inventory/detail", {
      title: `${data[0].inv_make} ${data[0].inv_model}`,
      nav,
      detailContainer,
    })
    
  } catch (error) {
    next(error)
  }
}


// Intentional error
invCont.getError = async function (req, res, next) {

  try {
    throw new Error("Intentional error for testing")
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  // Captura el mensaje flash aquí
  const messages = req.flash('notice') 
  
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    messages, // Pasamos el texto del mensaje, no la función
  })
}

/* ***************************
 * Deliver Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    messages: null,
  })
}

/* ***************************
 * Process Add Classification
 * ************************** */

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  const result = await invModel.insertClassification(classification_name)

  if (result) {
    // 1. Mensaje de éxito
    req.flash("notice", `The ${classification_name} classification was successfully added.`)
    // 2. REDIRECT a la ruta de gestión (esto limpia la URL)
    res.redirect("/inv/") 
  } else {
    // Si falla, volvemos a mostrar el formulario
    req.flash("notice", "Sorry, the insertion failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav: await utilities.getNav(),
      errors: null,
    })
  }
}

module.exports = invCont
