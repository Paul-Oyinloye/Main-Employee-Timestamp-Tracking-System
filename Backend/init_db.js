import db from "./db.js";

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS timestamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      action TEXT CHECK(action IN ('IN','OUT')),
      time TEXT,
      photo_path TEXT,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    )
  `);

  console.log("Database initialized successfully.");
});