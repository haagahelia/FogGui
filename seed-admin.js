import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "user.db");

const db = new sqlite3.Database(dbPath);

const passwordHash = bcrypt.hashSync("Addmina24", 10);

db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`,
  (err) => {
    if (err) return console.error(err.message);

    db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, row) => {
      if (err) return console.error(err.message);

      if (!row) {
        db.run(
          "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
          ["admin", passwordHash, "admin"],
          (err) => {
            if (err) return console.error(err.message);
            console.log("Admin user created!");
            db.close();
          }
        );
      } else {
        console.log("Admin user already exists.");
        db.close();
      }
    });
  }
);
