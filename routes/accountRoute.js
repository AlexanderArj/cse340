// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')


router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Add the new default route for accounts to the accountRoute file.

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountView));

// aca la ruta es "/" porque el archivo principal de rutas ya incluye la palabra account: 
// (app.use("/account", accountRoute) en el server) y al escribir la ruta asi, estamos respondiendo a la ruta /account/
//       return res.redirect("/account/"): en el controlador

// Como toda solicitud que empieze con nombreDePagina/acccount es manejada con el accountRoute (ver server.js), entonces cuando el usuario
// se loguea correctamente se redirecciona a nombreDePagina/account/  el router toma este ultimo slash y llama a buildAccountView
// que se encarga finalmente de mandar al usuario a la visual de cuenta, tomando la visual desde account/account.ejs: 
// es decir que las urls esta marcadas por las rutas aca definidas. Url de la visual de la cuenta una vez el usuario se ha logueado:
// sitioWeb/account/


// **************
// Route to get edit account view
// ************

router.get("/edit/:account_id", utilities.handleErrors(accountController.buildEditAccountView))

// Ruta para actualizar datos personales
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Ruta para actualizar contraseña
router.post(
  "/password",
  regValidate.passwordRules(),
  regValidate.checkUpdateData, // Podemos reutilizar este o crear uno específico
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;

