import path from "path";
import sqlite3 from "sqlite3";

const dbPath = path.join(process.cwd(), "user.db"); // Database file path

export const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite database.");
        initializeDatabase(); // Insert test data
    }
});

// Create table and insert test data
const initializeDatabase = () => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`,
        (err) => {
            if (err) {
                console.error("Table creation error:", err.message);
            } else {
                console.log("Users table ready.");
                insertTestData();
            }
        }
    );
};

// Insert test user (fog, fog)
const insertTestData = () => {
    db.get("SELECT * FROM users WHERE username = ?", ["fog"], (err, row) => {
        if (!row) {
            db.run("INSERT INTO users (username, password) VALUES (?, ?)", ["fog", "fog"], (insertErr) => {
                if (insertErr) {
                    console.error("Test data insert error:", insertErr.message);
                } else {
                    console.log("Test user 'fog' added.");
                }
            });
        } else {
            console.log("Test user 'fog' already exists.");
        }
    });
};
