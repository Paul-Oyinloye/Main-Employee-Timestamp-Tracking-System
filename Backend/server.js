// server.js
// Clean, instrumented server for debugging

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import express from "express";
import cors from "cors";
import multer from "multer";
import db from "./db.js";    // assumes db.js is correct

// ----- Resolve __dirname for ES modules -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Server starting...");

// ----- Create app & basic middleware -----
const app = express();
app.use(cors());
app.use(express.json());

// ----- Serve frontend -----
const frontPath = path.join(__dirname, "..", "frontend");
console.log("Serving static files from:", frontPath);
app.use(express.static(frontPath));

// ----- Ensure uploads folder exists -----
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  console.log("uploads/ did not exist, creating:", uploadDir);
  fs.mkdirSync(uploadDir);
} else {
  console.log("uploads/ already exists:", uploadDir);
}

// ----- Multer storage -----
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, Date.now() + ".jpg")
});

const upload = multer({ storage });

// ----- ROUTES -----

// Simple health check
app.get("/ping", (req, res) => {
  console.log("GET /ping");
  res.json({ ok: true });
});

// Employees list
app.get("/employees", (req, res) => {
  console.log("GET /employees hit");
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) {
      console.error("DB error in /employees:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

// Add employee
app.post("/employees", (req, res) => {
  console.log("POST /employees body:", req.body);
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: "Name and role required" });
  }

  db.run(
    "INSERT INTO employees (name, role) VALUES (?,?)",
    [name, role],
    function (err) {
      if (err) {
        console.error("DB error in POST /employees:", err);
        return res.status(500).json({ error: "DB error" });
      }

      res.json({ id: this.lastID, name, role });
    }
  );
});

// Clock in
app.post("/timestamp/in", upload.single("selfie"), (req, res) => {
  console.log("POST /timestamp/in, body:", req.body);
  const { employeeId } = req.body;

  db.run(
    "INSERT INTO timestamps (employee_id, action, time, photo_path) VALUES (?, 'IN', datetime('now'), ?)",
    [employeeId, req.file?.path || null],
    function (err) {
      if (err) {
        console.error("DB error in /timestamp/in:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json({ message: "Clock-in recorded" });
    }
  );
});

// Clock out
app.post("/timestamp/out", upload.single("selfie"), (req, res) => {
  console.log("POST /timestamp/out, body:", req.body);
  const { employeeId } = req.body;

  db.run(
    "INSERT INTO timestamps (employee_id, action, time, photo_path) VALUES (?, 'OUT', datetime('now'), ?)",
    [employeeId, req.file?.path || null],
    function (err) {
      if (err) {
        console.error("DB error in /timestamp/out:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json({ message: "Clock-out recorded" });
    }
  );
});


    //NEW ROUTE — SHIFT HISTORY
   
app.get("/timestamps/:id", (req, res) => {
  const id = req.params.id;
  console.log("GET /timestamps/", id);

  db.all(
    "SELECT * FROM timestamps WHERE employee_id = ? ORDER BY time DESC",
    [id],
    (err, rows) => {
      if (err) {
        console.error("DB error in GET /timestamps/:id:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json(rows);
    }
  );
});

// ----- START SERVER -----
const PORT = 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(">>> app.listen callback FIRED <<<");
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
