// const { db } = require("../db/db");
// const { validateAndBuildUpdates } = require("../validators/todos");
import { db } from "../db/db.js";
import { validateAndBuildUpdates } from "../validators/todos.js";

const getTodos = async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT id, text, completed FROM todos ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load todos" });
  }
};

const createTodo = async (req, res) => {
  const { text } = req.body;
  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Todo text is required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO todos (text) VALUES ($1) RETURNING id, text, completed",
      [text.trim()],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
};

const updateTodo = async (req, res) => {
  const { text, completed } = req.body;

  const { updates, values, error } = validateAndBuildUpdates({
    text,
    completed,
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  if (error) {
    return res.status(400).json({ error });
  }

  values.push(req.params.id);
  const idIndex = updates.length + 1;

  try {
    const result = await db.query(
      `UPDATE todos SET ${updates.join(
        ", ",
      )} WHERE id = $${idIndex} RETURNING id, text, completed`,
      values,
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM todos WHERE id = $1 RETURNING id",
      [req.params.id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
};

const clearTodos = async (_req, res) => {
  try {
    await db.query("DELETE FROM todos");
    res.json({ cleared: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear todos" });
  }
};

// module.exports = {
//   getTodos,
//   createTodo,
//   updateTodo,
//   deleteTodo,
//   clearTodos,
// };
export { clearTodos, createTodo, deleteTodo, getTodos, updateTodo };
