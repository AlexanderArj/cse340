const invModel = require("../models/inventory-model")
const Util = {}

const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */

Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */

Util.buildClassificationGrid = async function(data){
  let grid = ""; 
  if(data && data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += `<li>
        <div class="inv-image-container">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"/>
          </a>
        </div>
        <div class="namePrice">
          <hr>
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        </div>
      </li>`
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.buildDetailContainer = async function (data, reactionCounts = [], userReaction = null) {
  let detail = ""

  if (data.length > 0) {
    const vehicle = data[0]
    
    const counts = { 1: 0, 2: 0, 3: 0 }
    reactionCounts.forEach(row => {
      counts[row.reaction_type] = parseInt(row.count)
    })

    detail = `
      <section class="vehicle-detail">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>

        <div class="vehicle-detail-content">
          <div>
            <img 
              src="${vehicle.inv_image}" 
              alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"
            />
            
            <div class="feedback-icons" data-inv-id="${vehicle.inv_id}">
              
              <div class="feedback-container">
                <button class="reaction-btn ${userReaction == 1 ? 'active' : ''}" data-type="1" title="I love it">
                  <img src="/images/site/heart.svg" alt="Love icon"/>
                </button>
                <p id="count-1">${counts[1]}</p>
              </div>

              <div class="feedback-container">
                <button class="reaction-btn ${userReaction == 2 ? 'active' : ''}" data-type="2" title="I like it">
                  <img src="/images/site/like.svg" alt="Like icon"/>
                </button>
                <p id="count-2">${counts[2]}</p>
              </div>

              <div class="feedback-container">
                <button class="reaction-btn ${userReaction == 3 ? 'active' : ''}" data-type="3" title="I dislike it">
                  <img src="/images/site/dislike.svg" alt="Dislike icon"/>
                </button>
                <p id="count-3">${counts[3]}</p>
              </div>

            </div>
          </div>

          <div class="vehicle-info">
            <h3>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h3>
            <p id="price"><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
            <p id="mileage"><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
            <p id="color"><strong>Color:</strong> ${vehicle.inv_color}</p>
            <p id="description"><strong>Description:</strong><br>${vehicle.inv_description}</p>
          </div>
        </div>
      </section>
    `
  } else {
    detail = `<p class="notice">Sorry, vehicle details could not be found.</p>`
  }

  return detail
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
* Check account type
* **************************************** */

Util.checkAccountType = (req, res, next) => {

  if (res.locals.loggedin && res.locals.accountData) {
    const account_type = res.locals.accountData.account_type

    if (account_type === "Employee" || account_type === "Admin") {
      next()
    } else {

      req.flash("notice", "Sorry, You do not have credentials to access this area.")
      res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in with authorized account.")
    res.redirect("/account/login")
  }
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util