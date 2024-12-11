const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Database configuration file

exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;

    // Find the user in the login table by id
    const [rows] = await db.execute(
      'SELECT id, password FROM login WHERE id = ?',
      [id]
    );

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid ID or password' });
    }

    const user = rows[0];

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid ID or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET, // Ensure this is set in your environment variables
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Token expiration, defaults to 1 hour
    );

    // Send the token in the response
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
};
