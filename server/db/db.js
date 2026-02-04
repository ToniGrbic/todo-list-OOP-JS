const { Pool } = require("pg");
const fs = require("fs/promises");
const path = require("path");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
  try {
    const sqlFilePath = path.join(__dirname, "initDb.sql");
    const sqlContent = await fs.readFile(sqlFilePath, "utf-8");
    await db.query(sqlContent);
  } catch (error) {
    console.error("Database initialization failed:", error);
    // ERROR LOG FILE 
    /* const logFilePath = path.join(__dirname, "error.log");
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Database initDb failed: ${error.message}\n${error.stack}\n\n`;
    await fs.appendFile(logFilePath, logMessage); */
    throw error;
  }
};

module.exports = { db, initDb };
