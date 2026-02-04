require("dotenv").config();

const path = require("path");
const express = require("express");

const app = express();
const port = process.env?.PORT || 3000;
const rootDir = path.resolve(__dirname, "..");

// In-memory storage
let todos = [];
let nextId = 1;

app.use(express.json());
app.use(express.static(rootDir));

// GET all todos
app.get("/api/todos", (req, res) => {
  try {
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Failed to load todos" });
  }
});

// POST create new todo
app.post("/api/todos", (req, res) => {
  const { text } = req.body;
  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Todo text is required" });
  }

  try {
    const newTodo = {
      id: nextId++,
      text: text.trim(),
      completed: false,
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PATCH update todo
app.patch("/api/todos/:id", (req, res) => {
  const { text, completed } = req.body;
  const todoId = parseInt(req.params.id, 10);

  if (isNaN(todoId)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  let hasUpdates = false;

  if (typeof text === "string") {
    todos[todoIndex].text = text.trim();
    hasUpdates = true;
  }

  if (typeof completed === "boolean") {
    todos[todoIndex].completed = completed;
    hasUpdates = true;
  }

  if (!hasUpdates) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    res.json(todos[todoIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE specific todo
app.delete("/api/todos/:id", (req, res) => {
  const todoId = parseInt(req.params.id, 10);

  if (isNaN(todoId)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  try {
    todos.splice(todoIndex, 1);
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// DELETE all todos
app.delete("/api/todos", (req, res) => {
  try {
    todos = [];
    res.json({ cleared: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear todos" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port} with in-memory storage`);
});
