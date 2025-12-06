const contactModel = require("../models/contactModel");
const utilities = require("../utilities/");

async function buildContactForm(req, res, next) {
  let nav = await utilities.getNav();
  res.render("contact/form", {
    title: "Contact Us",
    nav,
    errors: null,
    message: req.flash("notice")
  });
}

async function sendMessage(req, res, next) {
  try {
    const { subject, body } = req.body;
    const account_id = res.locals.accountData.account_id;

    await contactModel.insertMessage(account_id, subject, body);
    req.flash("notice", "Message sent successfully!");

    // 👉 Redirect to messages page instead of back to form
    res.redirect("/contact/messages");
  } catch (error) {
    next(error);
  }
}

async function viewMessages(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const result = await contactModel.getMessagesByAccount(account_id);
    let nav = await utilities.getNav();

    res.render("contact/messages", {
      title: "My Messages",
      nav,
      messages: result.rows,
      errors: null,
      message: req.flash("notice")
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { buildContactForm, sendMessage, viewMessages };