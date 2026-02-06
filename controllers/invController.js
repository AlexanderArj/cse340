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

invCont.getError = async function (req, res, next) {

  try {
    throw new Error("Intentional error for testing")
  } catch (error) {
    next(error)
  }
}


invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const messages = req.flash('notice') 
  
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    messages, 
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

module.exports = invCont
