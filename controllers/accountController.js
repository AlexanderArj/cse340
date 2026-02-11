const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

require("dotenv").config()

// Login view

async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

// Register view

async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

// Process-registration

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
      hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount( account_firstname, account_lastname, account_email, hashedPassword)

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
      // envia a la ruta por defecto de nombreDePagina/account/, esto lo toma al accountRoute para
      // llamar al constructor de la visual de la cuenta
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


// Login view

async function buildAccountView(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/account", {
      // El contralaodr de ruta llama a esta funcion
      // y esta función se encarga de contruir la visual usando account/account
      // este ultimo es el archivo account.ejs dentro de la carpeta account
      
      title: "My Account",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

// async function buildAccountView(req, res, next) {
//   try {
//     const nav = await utilities.getNav()
//     // extraer info de res.locals al tener middleware de validación
//     res.render("account/account", {
//       title: "My Account",
//       nav,
//       errors: null,
//       // accountData: res.locals.accountData // con el uso de middleware
//     })
//   } catch (error) {
//     next(error)
//   }
// }

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountView }
