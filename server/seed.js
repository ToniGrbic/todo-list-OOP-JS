require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedTodos = [
  { text: "Buy groceries", completed: false },
  { text: "Walk the dog", completed: true },
  { text: "Finish todo app", completed: false },
];

const seed = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );

  await pool.query("DELETE FROM todos");

  const values = [];
  const placeholders = seedTodos.map((todo, index) => {
    const baseIndex = index * 2;
    values.push(todo.text, todo.completed);
    return `($${baseIndex + 1}, $${baseIndex + 2})`;
  });

  await pool.query(
    `INSERT INTO todos (text, completed) VALUES ${placeholders.join(", ")}`,
    values
  );
};

seed()
  .then(() => {
    console.log("Seeded todos");
    return pool.end();
  })
  .catch((error) => {
    console.error("Failed to seed todos", error);
    return pool.end().finally(() => process.exit(1));
  });
