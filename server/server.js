require("dotenv").config();
const {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  clearTodos,
} = require("./controllers/todoController");

const { initDb } = require("./db/db");
const path = require("path");
const express = require("express");

const app = express();
const port = process.env?.PORT || 3000;
const rootDir = path.resolve(__dirname, "..");

app.use(express.json());
app.use(express.static(rootDir));

app.get("/api/todos", getTodos);
app.post("/api/todos", createTodo);
app.patch("/api/todos/:id", updateTodo);
app.delete("/api/todos/:id", deleteTodo);
app.delete("/api/todos", clearTodos);

const startServer = async () => {
  await initDb();
  app.listen(port, () => {
    console.log(`Connected to DB, server listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
