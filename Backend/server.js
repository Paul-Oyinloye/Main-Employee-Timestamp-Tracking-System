import express from "express";
import cors from "cors";
import multer from "multer";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => cb(null, Date.now() + ".jpg")
});

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

//timestamp with photo upload
app.post("/timestamps", upload.single("photo"), (req, res) => {
  const { employee_id, action } = req.body;
  const photo_path = req.file ? req.file.path : null;
  const time = new Date().toISOString();