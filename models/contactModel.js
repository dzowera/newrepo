const pool = require("../database/");

async function insertMessage(account_id, subject, body) {
  try {
    const sql = `INSERT INTO contact_messages (account_id, subject, body)
                 VALUES ($1, $2, $3) RETURNING *`;
    return await pool.query(sql, [account_id, subject, body]);
  } catch (error) {
    throw error;
  }
}

async function getMessagesByAccount(account_id) {
  try {
    const sql = `SELECT * FROM contact_messages WHERE account_id = $1 ORDER BY created_at DESC`;
    return await pool.query(sql, [account_id]);
  } catch (error) {
    throw error;
  }
}

module.exports = { insertMessage, getMessagesByAccount };