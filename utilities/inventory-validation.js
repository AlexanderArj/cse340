const { body, validationResult } = require("express-validator")
const validate = {}
const utilities = require(".")

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .isAlphanumeric()
      .withMessage("Please provide a valid classification name without spaces or special characters.")
  ]
}

validate.checkIdData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .isNumeric()
      .notEmpty()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    body("inv_description")
      .notEmpty()
      .withMessage("Description can not be empty."),

    body("inv_year")
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number."),

    body("inv_price")
      .isNumeric()
      .withMessage("Price must be a number."),

    body("inv_miles")
      .isNumeric()
      .withMessage("Miles must be a number."),
      
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required.")
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      ...req.body 
    })
    return
  }
  next()
}


// Errors will be directed back to the edit view
validate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    
    const { 
      inv_id, 
      inv_make, 
      inv_model, 
      classification_id 
    } = req.body

    let classificationSelect = await utilities.buildClassificationList(classification_id)
    
    const itemName = `${inv_make} ${inv_model}`

    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      ...req.body, 
      inv_id 
    })
    return
  }
  next()
}


/* ******************************
 * Damage 9
 * ***************************** */

validate.damageReportRules = () => {
  return [

    body("inv_id")
      .isNumeric()
      .withMessage("Please select a valid vehicle from the list."),

    body("damage_type")
      .notEmpty()
      .withMessage("Please select the type of damage."),

    body("damage_severity")
      .isIn(['low', 'medium', 'high'])
      .withMessage("Please select a valid severity level."),

    body("damage_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Please provide a detailed description (at least 10 characters)."),
  ]
}

/* ******************************
 * Checking damage report info
 * ***************************** */

validate.checkDamageData = async (req, res, next) => {
  const { classification_id, inv_id, damage_type, damage_severity, damage_description } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    let classificationSelect = await utilities.buildClassificationList(classification_id)
    
    res.render("inventory/report", {
      errors,
      title: "Vehicle Damage Report",
      nav,
      classificationSelect,
      inv_id,
      damage_type,
      damage_severity,
      damage_description,
    })
    return
  }
  next()
}

module.exports = validate