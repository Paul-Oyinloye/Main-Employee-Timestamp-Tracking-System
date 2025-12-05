// Database connection using SQLite3
// Reference: https://www.sqlitetutorial.net/sqlite-nodejs/


import sqlite3 from "sqlite3";
sqlite3.verbose();

const db = new sqlite3.Database("./data.sqlite");

export default db;