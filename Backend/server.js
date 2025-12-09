
//Source: Express documentation (https://expressjs.com/)

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
import multer from "multer";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../Frontend"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => cb(null, Date.now() + ".jpg")
});


//https://github.com/expressjs/multer#diskstorage
const upload = multer({ storage });


//employee list

app.get("/employees", (req, res) => {
  db.all("SELECT * FROM employees", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

//add employee
app.post("/employees", (req, res) => {
  const { name, role } = req.body;
  db.run("INSERT INTO employees (name,role) VALUES (?,?)", [name, role], function () {
    res.json({ id: this.lastID, name, role });
  });
});

//timestamp in
app.post("/timestamp/in", upload.single("selfie"), (req, res) => {
  const { employeeId } = req.body;

  db.run(
    "INSERT INTO timestamps (employee_id, action, time, photo_path) VALUES (?, 'IN', datetime('now'), ?)",
    [employeeId, req.file.path],
    () => res.json({ message: "Clock-in recorded" })
  );
});

// timestamp out 

app.post("/timestamp/out", upload.single("selfie"), (req, res) => {
  const { employeeId } = req.body;

  db.run(
    "INSERT INTO timestamps (employee_id, action, time, photo_path) VALUES (?, 'OUT', datetime('now'), ?)",
    [employeeId, req.file.path],
    () => res.json({ message: "Clock-out recorded" })
  );
});

// History of timestamps for an employee
app.get("/timestamps/:id", (req, res) => {
  db.all("SELECT * FROM timestamps WHERE employee_id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

//to start server
app.listen(3001, () => console.log("Server running on http://localhost:3001"));