import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database connection
const db = await open({
  filename: './user.db',
  driver: sqlite3.Database,
});

// Function to create a user
const createUser = async (username, plainPassword) => {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword,
    ]);
    console.log(`✅ User '${username}' added successfully!`);
  } catch (error) {
    console.error('❌ Error adding user:', error.message);
  }
};

// Run the script to create a user
createUser('fogtesti', 'fogtesti');