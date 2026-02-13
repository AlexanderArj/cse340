// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/inventory-validation')


// Route to inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory by invID, vehicle details

router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail));

// Route to trigger an intentional error
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

// Route to deliver the add-classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Process the add-classification form
router.post(
  "/add-classification",
  utilities.checkAccountType,
  regValidate.classificationRules(),
  regValidate.checkIdData,
  utilities.handleErrors(invController.addClassification)
)

// Route to deliver add-inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Process add-inventory form
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  regValidate.inventoryRules(),
  regValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// 

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// localhost:5500/inv/edit/#

// Route to get the editing view

router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))

// Process the update item form

router.post(
  "/update/",
  utilities.checkAccountType,
  regValidate.inventoryRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView))

router.post(
  "/delete-confirmation/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;

