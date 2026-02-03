require("dotenv").config();

const path = require("path");
const express = require("express");
/* const cors = require("cors"); */
const { pool, init } = require("./db");

const app = express();
const port = process.env?.PORT || 3000;
const rootDir = path.resolve(__dirname, "..");

/* app.use(cors()); */
app.use(express.json());
app.use(express.static(rootDir));

app.get("/api/todos", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, text, completed FROM todos ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load todos" });
  }
});

app.post("/api/todos", async (req, res) => {
  const { text } = req.body;
  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Todo text is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO todos (text) VALUES ($1) RETURNING id, text, completed",
      [text.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.patch("/api/todos/:id", async (req, res) => {
  const { text, completed } = req.body;
  const updates = [];
  const values = [];

  if (typeof text === "string") {
    updates.push(`text = $${updates.length + 1}`);
    values.push(text.trim());
  }

  if (typeof completed === "boolean") {
    updates.push(`completed = $${updates.length + 1}`);
    values.push(completed);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(req.params.id);
  const idIndex = updates.length + 1;

  try {
    const result = await pool.query(
      `UPDATE todos SET ${updates.join(
        ", "
      )} WHERE id = $${idIndex} RETURNING id, text, completed`,
      values
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.delete("/api/todos", async (req, res) => {
  try {
    await pool.query("DELETE FROM todos");
    res.json({ cleared: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear todos" });
  }
});

const startServer = async () => {
  await init();
  app.listen(port, () => {
    console.log(`Connected to DB, server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
