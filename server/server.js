// require("dotenv").config();
// const path = require("path");
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

// Error logging setup
/* const fs = require("fs");
const logFilePath = path.join(__dirname, "logs", "error.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

const originalConsoleError = console.error;
console.error = (...args) => {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${args.join(" ")}\n`;
  logStream.write(message);
  originalConsoleError.apply(console, args);
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.stack || error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
}); */

// const {
//   getTodos,
//   createTodo,
//   updateTodo,
//   deleteTodo,
//   clearTodos,
// } = require("./controllers/todoController");
// const { initDb } = require("./db/db");
// const express = require("express");
import express from "express";
import {
  clearTodos,
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "./controllers/todoController.js";
import { initDb } from "./db/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
