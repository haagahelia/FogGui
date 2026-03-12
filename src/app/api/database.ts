import path from "path";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

const dbPath = path.join(process.cwd(), "user.db"); // Database file path

// Open the SQLite database
export const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Connected to SQLite database.");
      initializeDatabase(); // Initialize database (create table and insert test data)
    }
  },
);

// Create table and insert test data
const initializeDatabase = () => {
  // Create the users table if it doesn't exist
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )`,
    function (err) {
      if (err) {
        console.error("Table creation error:", err.message);
      } else {
        console.log("Users table ready.");
        insertTestData(); // Call insertTestData only after table is created
      }
    },
  );
};

// Insert test user (admin with encrypted password)
const insertTestData = () => {
  db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, row) => {
    if (err) {
      console.error("Error checking user existence:", err.message);
      return;
    }

    if (!row) {
      const passwordHash = bcrypt.hashSync("admin", 10); // Hash the password
      db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        ["admin", passwordHash, "admin"],
        (insertErr) => {
          if (insertErr) {
            console.error("Test data insert error:", insertErr.message);
          } else {
            console.log("Test user 'admin' added with encrypted password.");
          }
        },
      );
    } else {
      console.log("Test user 'admin' already exists.");
    }
  });
};

// Creates new table for new scheduled multicast tasks features without touching existing ones.
// Safe to run on every startup
export const runMigrations = () => {
  db.run(
    `CREATE TABLE IF NOT EXISTS scheduled_multicast_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fogTaskID INTEGER NOT NULL,
      groupID INTEGER NOT NULL,
      imageID INTEGER NOT NULL,
      kernelDevice TEXT NOT NULL,
      scheduledTime INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    (err) => {
      if (err) {
        console.error("Migration error: ", err.message);
      } else {
        console.log("scheduled_multicast_tasks table ready.");
      }
    },
  );
};
