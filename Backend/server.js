//Source: Express documentation (https://expressjs.com/)

console.log("Server starting...");

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
import multer from "multer";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Fix static path (Frontend with correct case)
const frontPath = path.join(__dirname, "..", "frontend");
console.log("Serving static files from:", frontPath);
app.use(express.static(frontPath));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => cb(null, Date.now() + ".jpg")
});

const upload = multer({ storage });

// ROUTES
app.get("/employees", (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

app.post("/employees", (req, res) => {
  const { name, role } = req.body;
  db.run("INSERT INTO employees (name,role) VALUES (?,?)", [name, role], function () {
    res.json({ id: this.lastID, name, role });
  });
});

app.post("/timestamp/in", upload.single("selfie"), (req, res) => {
  const { employeeId } = req.body;
  db.run(
    "INSERT INTO timestamps (employee_id, action, time, photo_path) VALUES (?, 'IN', datetime('now'), ?)",
    [employeeId, req.file.path],
    () => res.json({ message: "Clock-in recorded" })
  );
});

app.post("/timestamp/out", upload.single("selfie"), (req, res) => {
  const { employeeId } = req.body;
  db.run(
    "INSERT INTO timestamps (employee_id, action, time, photo_path) VALUES (?, 'OUT', datetime('now'), ?)",
    [employeeId, req.file.path],
    () => res.json({ message: "Clock-out recorded" })
  );
});

// START SERVER
const PORT = 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(">>> app.listen callback FIRED <<<");
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
