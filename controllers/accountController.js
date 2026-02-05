const utilities = require("../utilities/")

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

module.exports = { buildLogin, buildRegister }
