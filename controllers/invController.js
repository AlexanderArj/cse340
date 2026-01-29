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

module.exports = invCont
