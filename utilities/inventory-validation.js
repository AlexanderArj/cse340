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

module.exports = validate