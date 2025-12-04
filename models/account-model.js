/* ****************************************
 *  Account Model
 *  Handles database interactions for accounts
 **************************************** */

const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account 
        (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *
    `;
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ]);
  } catch (error) {
    return error.message;
  }
}

async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.account WHERE account_email = $1",
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error:", error)
    return null
  }
}

async function getAccountById(account_id) {
  const sql = "SELECT * FROM account WHERE account_id = $1"
  const data = await pool.query(sql, [account_id])
  return data.rows[0]
}

async function updateAccountInfo(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE account
    SET account_firstname = $2, account_lastname = $3, account_email = $4
    WHERE account_id = $1
    RETURNING *
  `
  const data = await pool.query(sql, [account_id, firstname, lastname, email])
  return data.rows[0]
}

async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE account
    SET account_password = $2
    WHERE account_id = $1
    RETURNING *
  `
  const data = await pool.query(sql, [account_id, hashedPassword])
  return data.rows[0]
}

module.exports = { registerAccount, getAccountByEmail, getAccountById, updateAccountInfo, updatePassword };