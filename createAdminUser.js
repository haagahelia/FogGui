const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');
const path = require('path');

// Path to the database
const dbPath = path.resolve(__dirname, 'user.db');

// Open the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to create the users table if it doesn't exist
const createUsersTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Users table is ready.');
    }
  });
};

// Create admin user with hashed password
const createAdminUser = async () => {
  const username = 'admin'; // Admin username
  const password = 'admin'; // Admin password (plaintext)

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const role = 'admin'; // Set the role as 'admin'

  const query = `
    INSERT INTO users (username, password, role)
    VALUES (?, ?, ?)
  `;

  db.run(query, [username, hashedPassword, role], function(err) {
    if (err) {
      console.error('Error inserting admin user:', err.message);
    } else {
      console.log('Admin user created successfully with ID:', this.lastID);
    }

    // Close the database after the operation
    db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
};

// Run the functions to ensure the table exists and create the admin user
createAdminUser();
