const db = require('../config/db');
const { processImage } = require('../utils/sharpHelper');

// Room creation function with image upload
exports.createRoom = async (req, res) => {
  const { 
    ROOM_NO, 
    METER_NO, 
    NAME, 
    MOBILE_NO, 
    E_MAIL, 
    ADDRESS, 
    ROOM_RENT, 
    WATER_BILL ,
    DUE
  } = req.body;

  // Validate required fields
  if (!ROOM_NO || !METER_NO || !NAME || !MOBILE_NO || !E_MAIL || !ADDRESS || !ROOM_RENT || !WATER_BILL || !DUE || !req.file) {
    return res.status(400).json({ message: 'All fields are required. Please provide complete information.' });
  }

  try {
    // Process image if uploaded
    let nidFrontBuffer = await processImage(req.file.buffer);

    // Check if the room number already exists
    const checkRoomQuery = 'SELECT COUNT(*) AS count FROM room_list WHERE ROOM_NO = ?';
    const [checkResult] = await db.promise().query(checkRoomQuery, [ROOM_NO]);

    if (checkResult[0].count > 0) {
      return res.status(400).json({ message: 'Room number already exists' });
    }


    // Create a new table with the room number as the table name
    // const createTableRoomNoQuery = `CREATE TABLE room_${ROOM_NO} (
    //     MONTH_NAME VARCHAR(25)  PRIMARY KEY NOT NULL,
    //     METER_NO VARCHAR(25) NOT NULL,
    //     ROOM_NO VARCHAR(25) NOT NULL,
    //     NAME VARCHAR(255) NOT NULL,
    //     MOBILE_NO VARCHAR(20 ) NOT NULL,
    //     E_MAIL VARCHAR(255) NOT NULL,
    //     ADDRESS VARCHAR(255) NOT NULL,
    //     ROOM_RENT INT NOT NULL,
    //     WATER_BILL INT NOT NULL,
    //     ELECTRICITY_BILL INT NOT NULL,
    //     SUBTOTAL INT NOT NULL,
    //     PREVIOUS_DUE INT NOT NULL,
    //     TOTAL INT NOT NULL,
    //     PAY INT NOT NULL,
    //     DUE INT NOT NULL
    //     )`;
    
    // await db.promise().query(createTableRoomNoQuery);


    // Prepare SQL query to insert room details into the database
    const insertRoomQuery = `INSERT INTO room_list (ROOM_NO, METER_NO, NAME, MOBILE_NO, E_MAIL, ADDRESS, ROOM_RENT, WATER_BILL,DUE, NID_FRONT) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    const values = [ROOM_NO, METER_NO, NAME, MOBILE_NO, E_MAIL, ADDRESS, ROOM_RENT, WATER_BILL, DUE, nidFrontBuffer];

    // Insert new room if no duplicate is found
    await db.promise().query(insertRoomQuery, values);






    return res.status(200).json({ message: 'Room created successfully' });

  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

// roomsController.js
exports.getAllRooms = async (req, res) => {
    try {
      const query = 'SELECT * FROM room_list';
      const [rooms] = await db.promise().query(query);
  
      // Convert image buffer to base64 string if IMAGE exists
      const updatedRooms = rooms.map(room => ({
        ...room,
        NID_FRONT: room.NID_FRONT ? room.NID_FRONT.toString('base64') : null, // Convert the buffer to base64
      }));
  
      return res.status(200).json(updatedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
    }
};


const multer = require('multer');

// Setup multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.updateRoom = [
  upload.single('NID_FRONT'), // Middleware to handle file upload
  async (req, res) => {
    const roomNo = req.params.roomNo;
    const { METER_NO, NAME, MOBILE_NO, E_MAIL, ADDRESS, ROOM_RENT, WATER_BILL, DUE } = req.body;
    
    try {
      let nidFrontBuffer = req.file ? await processImage(req.file.buffer) : null;

      const updateRoomQuery = `
        UPDATE room_list SET METER_NO = ?, NAME = ?, MOBILE_NO = ?, E_MAIL = ?, 
        ADDRESS = ?, ROOM_RENT = ?, WATER_BILL = ?, DUE = ?, NID_FRONT = COALESCE(?, NID_FRONT) 
        WHERE ROOM_NO = ?`;
      const values = [METER_NO, NAME, MOBILE_NO, E_MAIL, ADDRESS, ROOM_RENT, WATER_BILL, DUE, nidFrontBuffer, roomNo];

      await db.promise().query(updateRoomQuery, values);
      return res.status(200).json({ message: 'Room updated successfully' });
    } catch (error) {
      console.error('Error updating room:', error);
      return res.status(500).json({ message: 'Failed to update room', error: error.message });
    }
  }
];




  // roomsController.js
exports.deleteRoom = async (req, res) => {
    const roomNo = req.params.roomNo;
  
    try {
      // Delete the room from the room_list table
      const deleteRoomQuery = `DELETE FROM room_list WHERE ROOM_NO = ?`;
      await db.promise().query(deleteRoomQuery, [roomNo]);
  
      // Optionally: Drop the table created for this room, if required.
      const dropRoomTableQuery = `DROP TABLE IF EXISTS room_${roomNo}`;
      await db.promise().query(dropRoomTableQuery);
  
      return res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Error deleting room:', error);
      return res.status(500).json({ message: 'Failed to delete room', error: error.message });
    }
  };
  

// Update dues in the rooms table
exports.updateDue = (req, res) => {
  const { ROOM_NO, DUE } = req.body;

  // SQL query to update the DUE for the specified ROOM_NO
  const sql = `UPDATE room_list SET DUE = ? WHERE ROOM_NO = ?`;

  db.query(sql, [DUE, ROOM_NO], (err, result) => {
    if (err) {
      console.error('Error updating dues:', err);
      return res.status(500).json({ error: 'Failed to update dues' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Dues updated successfully' });
  });
};



exports.updateRoomDue = async (req, res) => {
  const { ROOM_NO, DUE } = req.body;

  try {
    // Update room due with SQL query
    const result = await db.query(
      'UPDATE rooms SET DUE = ? WHERE ROOM_NO = ?',
      [DUE, ROOM_NO]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room DUE updated successfully' });
  } catch (error) {
    console.error('Error updating room DUE:', error);
    res.status(500).json({ message: 'Failed to update room DUE' });
  }
};


exports.getRoomData = async (req, res) => {
  const { tableName, roomNo, mobileNo } = req.query;

  // Validate that tableName, roomNo, and mobileNo are provided
  if (!tableName || !roomNo || !mobileNo) {
    return res.status(400).json({ error: 'Table name, room number, and mobile number are required' });
  }

  try {
    // Check if the table exists (optional, depending on your database)
    const [tables] = await db.promise().query('SHOW TABLES LIKE ?', [tableName]);
    if (tables.length === 0) {
      return res.status(404).json({ error: `Table '${tableName}' does not exist` });
    }

    // Query the specific table with roomNo and mobileNo
    const query = `SELECT * FROM ?? WHERE ROOM_NO = ? AND MOBILE_NO = ?`;
    const [results] = await db.promise().query(query, [tableName, roomNo, mobileNo]);

    // Check if any data was returned
    if (results.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified room number and mobile number' });
    }

    // Return the data
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data from the table', details: error.message });
  }
};
exports.userGetRoomData = async (req, res) => {
  const { tableName, roomNo, mobileNo } = req.query;

  // Validate that tableName, roomNo, and mobileNo are provided
  if (!tableName || !roomNo || !mobileNo) {
    return res.status(400).json({ error: 'Table name, room number, and mobile number are required' });
  }

  try {
    // Check if the table exists (optional, depending on your database)
    const [tables] = await db.promise().query('SHOW TABLES LIKE ?', [tableName]);
    if (tables.length === 0) {
      return res.status(404).json({ error: `Table '${tableName}' does not exist` });
    }

    // Query the specific table with roomNo and mobileNo
    const query = `SELECT * FROM ?? WHERE ROOM_NO = ? AND MOBILE_NO = ?`;
    const [results] = await db.promise().query(query, [tableName, roomNo, mobileNo]);

    // Check if any data was returned
    if (results.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified room number and mobile number' });
    }

    // Return the data
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data from the table', details: error.message });
  }
};

// for password

exports.getRoomNoAndMobileNo = async (req, res) => {
  const { roomNo, mobileNo } = req.query;

  // Validate that roomNo and mobileNo are provided
  if (!roomNo || !mobileNo) {
    return res.status(400).json({ error: 'Room number and mobile number are required' });
  }

  console.log(`Room No: ${roomNo}, Mobile No: ${mobileNo}`); // Log input parameters

  try {
    // Query the room_list table with roomNo and mobileNo
    const query = `SELECT * FROM room_list WHERE ROOM_NO = ? AND MOBILE_NO = ?`;
    console.log(`Executing Query: ${query} with Params:`, [roomNo, mobileNo]); // Log query and parameters
    const [results] = await db.promise().query(query, [roomNo, mobileNo]);

    // Check if any data was returned
    if (results.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified room number and mobile number' });
    }

    // Return the data
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data from the table', details: error.message });
  }
};







