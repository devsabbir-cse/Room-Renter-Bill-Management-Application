const db = require('../config/db');
const dbms = require('../config/dbms');
const bcrypt = require('bcrypt');


const jwt = require('jsonwebtoken');


exports.auth = async (req, res) => {
  try {
    const { id, password } = req.body;

    // Attempt to find the user in the database
    let result;
    try {
      result = await dbms.execute('SELECT id, password FROM login WHERE id = ?', [id]);
    } catch (dbError) {
      return res.status(500).json({ message: 'Database error', error: dbError.message });
    }

    // Verify structure and destructure properly
    const [rows] = result || [];
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'UnAuthorized' });
    }

    const user = rows[0];
//     const bcrypt = require('bcrypt');
// const plainPassword = 'adjfb345nnbvb&%^&*%*5bjhbff7567';
// const hashedPassword = await bcrypt.hash(plainPassword, 10);
// console.log(hashedPassword,"hashedPasswordhashedPasswordhashedPassword");




    // console.log("Password from request:", password);
    // console.log("Password from database:", user.password);
    // Check password
    const isPasswordValid = await  bcrypt.compare(password, user.password);
    console.log("isPasswordValid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(isPasswordValid,"isPasswordValid");
    

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '10d' }
    );

    res.status(200).json({ message: 'Authorized',  token : token });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message || 'Unknown error' 
    });
  }
};

exports.authUser = async (req, res) => {
  try {
    const { roomNo, mobileNo } = req.body;

    // Convert mobileNo to an integer
    const mobileNoInt = parseInt(mobileNo, 10);

    if (isNaN(mobileNoInt)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    // Attempt to find the user in the database
    let result;
    try {
      result = await dbms.execute('SELECT ROOM_NO, MOBILE_NO FROM room_list WHERE ROOM_NO = ? ', [roomNo]);
    } catch (dbError) {
      return res.status(500).json({ message: 'Database error', error: dbError.message });
    }

    // Verify structure and destructure properly
    const [rows] = result || [];
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = rows[0];
    console.log(user,"user");
    console.log(result,"result");
    

    if (user.MOBILE_NO !== mobileNoInt) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userRoomNo: user.ROOM_NO },
      process.env.JWT_SECRET_authUser,
      { expiresIn: process.env.JWT_EXPIRES_IN || '60d' }
    );

    res.status(200).json({ message: 'Authorized', token: token });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message || 'Unknown error' 
    });
  }
};






exports.create_new_month = (req, res) => {
  const tableName = req.body.tableName;

  // Validate table name (e.g., jan24, feb24)
  // if (!/^[a-z]{3}\d{2}$/i.test(tableName)) {
  //   return res.status(400).json({ error: 'Invalid table name format. Use format like jan24, feb24, etc.' });
  // }
  

  // SQL query to create table
  const createTableQuery = `CREATE TABLE ?? ( 
        MONTH_NAME VARCHAR(25)  NOT NULL,
        METER_NO VARCHAR(25) NOT NULL,
        ROOM_NO VARCHAR(25) NOT NULL PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        MOBILE_NO VARCHAR(20) NOT NULL,
        E_MAIL VARCHAR(255) NOT NULL,
        ADDRESS VARCHAR(255) NOT NULL,
        ROOM_RENT INT NOT NULL,
        WATER_BILL INT NOT NULL,
        ELECTRICITY_BILL INT NOT NULL DEFAULT 0,
        SUBTOTAL INT NOT NULL,
        PREVIOUS_DUE INT NOT NULL,
        TOTAL INT NOT NULL,
        PAY INT NOT NULL DEFAULT 0,
        DUE INT NOT NULL
    )`;

  db.query(createTableQuery, [tableName], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to create table', details: err.message });
    }
    res.json({ message: `Table '${tableName}' created successfully!` });
  });
};




// Controller to insert data into the newly created table
exports.insert_into_table = (req, res) => {
  const tableName = req.body.tableName;
  const data = req.body.data;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'No data provided for insertion' });
  }

  // Prepare SQL query for bulk insert
  const insertQuery = `INSERT INTO ?? ( 
      MONTH_NAME, METER_NO, ROOM_NO, NAME, MOBILE_NO, E_MAIL, ADDRESS, 
      ROOM_RENT, WATER_BILL, ELECTRICITY_BILL, SUBTOTAL, PREVIOUS_DUE, TOTAL, PAY, DUE
    ) VALUES ?`;

  // Format the data into a multi-dimensional array for bulk insertion
  const values = data.map((row) => [
    row.MONTH_NAME,
    row.METER_NO,
    row.ROOM_NO,
    row.NAME,
    row.MOBILE_NO,
    row.E_MAIL,
    row.ADDRESS,
    row.ROOM_RENT,
    row.WATER_BILL,
    row.ELECTRICITY_BILL,
    row.SUBTOTAL,
    row.PREVIOUS_DUE,
    row.TOTAL,
    row.PAY,
    row.DUE
  ]);

  db.query(insertQuery, [tableName, values], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to insert data', details: err.message });
    }
    res.json({ message: `Data successfully inserted into table '${tableName}'` });
  });
};

// Controller to get all tables (months)
exports.getAllMonth = async (req, res) => {
  try {
    const query = "SHOW TABLES  like 'month%'"; // Query to get all tables in the database
    const [tables] = await db.promise().query(query);

    // Extract table names
    const allTables = tables.map(table => Object.values(table)[0]); // Extract all table names

    // Return the list of all tables
    return res.status(200).json(allTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({ message: 'Failed to fetch tables', error: error.message });
  }
};
exports.UserGetAllMonth = async (req, res) => {
  try {
    const query = "SHOW TABLES  like 'month%'"; // Query to get all tables in the database
    const [tables] = await db.promise().query(query);

    // Extract table names
    const allTables = tables.map(table => Object.values(table)[0]); // Extract all table names

    // Return the list of all tables
    return res.status(200).json(allTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return res.status(500).json({ message: 'Failed to fetch tables', error: error.message });
  }
};


// Controller to select all records from a specific table
exports.getCurrentMonthDetails = (req, res) => {
  const tableName = req.params.tableName;

  // Validate table name format (e.g., jan24, feb24)
  // if (!/^[a-z]{3}\d{2}$/i.test(tableName)) {
  //   return res.status(400).json({ error: 'Invalid table name format. Use format like jan24, feb24, etc.' });
  // }

  // SQL query to select all records from the specified table
  const selectQuery = `SELECT * FROM ??`;

  db.query(selectQuery, [tableName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve records', details: err.message });
    }
    
    // Return the retrieved records
    res.json({
      message: `Records fetched from table '${tableName}'`,
      data: results
    });
  });
};
exports.homePageGetCurrentMonthDetails = (req, res) => {
  const requireEditingMonth = req.params.requireEditingMonth;

  // Validate table name format (e.g., jan24, feb24)
  // if (!/^[a-z]{3}\d{2}$/i.test(tableName)) {
  //   return res.status(400).json({ error: 'Invalid table name format. Use format like jan24, feb24, etc.' });
  // }

  // SQL query to select all records from the specified table
  const selectQuery = `SELECT * FROM ??`;

  db.query(selectQuery, [requireEditingMonth], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve records', details: err.message });
    }
    
    // Return the retrieved records
    res.json({
      message: `Records fetched from table '${requireEditingMonth}'`,
      data: results
    });
  });
};




exports.updateRecord = (req, res) => {
  const { tableName, ROOM_NO, ELECTRICITY_BILL, PAY } = req.body;

  // if (!/^[a-z]{3}\d{2}$/i.test(tableName)) {
  //   return res.status(400).json({ error: 'Invalid table name format. Use format like jan24, feb24, etc.' });
  // }

  if (!ROOM_NO) {
    return res.status(400).json({ error: 'Room number is required' });
  }

  // Fetch the current record for the given ROOM_NO
  const getCurrentRecordQuery = `SELECT * FROM ?? WHERE ROOM_NO = ?`;

  db.query(getCurrentRecordQuery, [tableName, ROOM_NO], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch current record' });
    }

    const record = results[0];

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Update ELECTRICITY_BILL and PAY, if provided, otherwise use existing values
    const updatedElectricityBill = ELECTRICITY_BILL !== undefined ? ELECTRICITY_BILL : record.ELECTRICITY_BILL;
    const updatedPay = PAY !== undefined ? PAY : record.PAY;

    // Recalculate SUBTOTAL, TOTAL, and DUE based on the new values
    const updatedSubtotal = record.ROOM_RENT + record.WATER_BILL + updatedElectricityBill;
    const updatedTotal = updatedSubtotal + record.PREVIOUS_DUE;
    const updatedDue = updatedTotal - updatedPay;

    // Prepare the update query
    const updateQuery = `
      UPDATE ?? 
      SET ELECTRICITY_BILL = ?, PAY = ?, SUBTOTAL = ?, TOTAL = ?, DUE = ? 
      WHERE ROOM_NO = ?
    `;

    // Execute the update query with the new values
    db.query(
      updateQuery,
      [tableName, updatedElectricityBill, updatedPay, updatedSubtotal, updatedTotal, updatedDue, ROOM_NO],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to update record', details: err.message });
        }

        // Send success response after updating the record
        res.status(200).json({ message: 'Record updated successfully', updatedRecord: { ...record, updatedElectricityBill, updatedPay, updatedSubtotal, updatedTotal, updatedDue } });
      }
    );
  });
};



exports.getRequireEditingValue = async (req, res) => {
  try {
    // Query to get the require_editing_month value from the require_editing table
    const query = "SELECT require_editing_month FROM require_editing"; 
    const [results] = await db.promise().query(query);

    // Check if any results were returned
    if (results.length > 0) {
      // Return the require_editing_month value (corrected key)
      return res.status(200).json({ require_editing_month: results[0].require_editing_month });
    } else {
      return res.status(404).json({ message: 'No data found' });
    }
  } catch (error) {
    console.error('Error fetching require_editing_month value:', error);
    return res.status(500).json({ message: 'Failed to fetch require_editing_month value', error: error.message });
  }
};



// Controller to update the require_editing_month column
exports.updateRequireEditingMonth = (req, res) => {
  const { require_editing_month } = req.body;

  // Validate the require_editing_month value
  // if (!require_editing_month || !/^[a-z]{3}\d{2}$/i.test(require_editing_month)) {
  //   return res.status(400).json({ error: 'Invalid table name format. Use format like jan24, feb24, etc.' });
  // }

  // SQL query to update the require_editing_month column in the require_editing table
  const updateQuery = `
    UPDATE require_editing 
    SET require_editing_month = ?
    WHERE id = 1
  `;

  // Execute the update query
  db.query(updateQuery, [require_editing_month], (err, result) => {
    if (err) {
      console.error('Error updating require_editing_month:', err);
      return res.status(500).json({ error: 'Failed to update require_editing_month', details: err.message });
    }

    // Check if the row was actually updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No rows found to update' });
    }

    // Respond with success message
    res.status(200).json({ message: 'require_editing_month updated successfully!' });
  });
};




const nodemailer = require('nodemailer');

// Nodemailer setup (use environment variables for security in production)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services (like SendGrid, Outlook, etc.)
  auth: {
    user: 'webandappdev.sabbir@gmail.com', // Your email
    pass: 'nago mlvi djrm lwbj', // Your email password or app-specific password

  },
});

// Controller function to send an email
exports.dueSendMail = (req, res) => {
  const { name, email, total,pay,due,monthName,meterNo,roomNo,previousDue,electricityBill,waterBill,roomBill,subTotal} = req.body;

  // Set up the email options
  const mailOptions = {
    from: 'webandappdev.sabbir@gmail.com', // Sender email address
    to: email, // Recipient email
    subject: `Utility Bill Due for ${monthName.slice(0, 6)}`, // Subject of the email
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); background-color: #f9f9f9;">
            <h2 style="color: #333; text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                UTILITY BILL
            </h2>
            <h3 style="color: #555; text-align: center; margin-top: 5px;">${monthName.slice(6, ).toUpperCase()}</h3>            
            <p style="font-size: 16px; color: #555;">
              প্রিয় <strong>${name.toUpperCase()}</strong>, <br><br>
              আশা করি আপনি ভালো আছেন। আমরা আপনাকে স্মরণ করিয়ে দিতে চাই যে এটি আপনার <strong>${monthName.slice(6, ).toUpperCase()}</strong> মাসের ইউটিলিটি বিল। অনুগ্রহ করে যত তাড়াতাড়ি সম্ভব আপনার বকেয়া পরিশোধ করুন। নিচে বিস্তারিত দেখুন:
            </p>

            <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                
                <!-- Room and Meter Details -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Room Number</strong></td>
                        <td style="font-size: 16px; color: #666; padding: 10px 5px; text-align: right;"><strong>${roomNo}</strong></td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Meter Number</strong></td>
                        <td style="font-size: 16px; color: #666; padding: 10px 5px; text-align: right;"><strong>${meterNo}</strong></td>
                    </tr>
                </table>

                <!-- Bill Breakdown (Amounts) -->
                <h3 style="color: #FF6347; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Bill Amounts</h3>

                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Room Bill</strong></td>
                        <td style="font-size: 16px; color: #FFA500; padding: 10px 5px; text-align: right;"><strong>${roomBill}</strong></td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Water Bill</strong></td>
                        <td style="font-size: 16px; color: #FFA500; padding: 10px 5px; text-align: right;"><strong>${waterBill}</strong></td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Electricity Bill</strong></td>
                        <td style="font-size: 16px; color: #FFA500; padding: 10px 5px; text-align: right;"><strong>${electricityBill}</strong></td>
                    </tr>
                </table>

                <!-- Calculation Breakdown -->
                <h3 style="color: #FF6347; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Calculation Summary</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Subtotal</strong></td>
                        <td style="font-size: 16px; color: #FFA500; padding: 10px 5px; text-align: right;"><strong>${subTotal}</strong></td>
                    </tr>
                    <tr>
                        <td style="font-size: 16px; color: #333; padding: 10px 5px;"><strong>Previous Due</strong></td>
                        <td style="font-size: 16px; color: #FF0000; padding: 10px 5px; text-align: right;"><strong>${previousDue}</strong></td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td style="font-size: 18px;  color: #333; padding: 10px 5px;"><strong>Total Amount</strong></td>
                        <td style="font-size: 20px; color: #28a700; font-weight: bold; padding: 10px 5px; text-align: right;"><strong>${total}</strong></td>
                    </tr>
                  </table>
                
            </div>

            <p style="font-size: 16px; color: #555; text-align: center; margin-top: 30px;">
                আপনার দ্রুত মনোযোগের জন্য ধন্যবাদ!
            </p>

        </div>
    `, // Email body in HTML
};


  

  // Send the email using Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully!' });
  });
};
// exports.paySendMail = (req, res) => {
//   const { name, email, due } = req.body;

//   // Set up the email options
//   const mailOptions = {
//     from: 'webandappdev.sabbir@gmail.com', // Sender email address
//     to: email, // Recipient email
//     subject: 'Thanks for Payment previos month', // Subject of the email
//     html: `
//         <div style="font-family: Arial, sans-serif;">
//             <h2 style="color: #333;">Electricity Bill Due</h2>
//             <p><strong>Name:</strong> ${name}</p>
//             <p style="font-size: 18px; color: red;">Your due: <strong>${due}</strong></p>
//         </div>
//     `, // Email body in HTML
// };


  

//   // Send the email using Nodemailer
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//       return res.status(500).json({ error: 'Failed to send email' });
//     }

//     console.log('Email sent: ' + info.response);
//     res.status(200).json({ message: 'Email sent successfully!' });
//   });
// };

// module.exports = { sendMail };


exports.paySendMail = (req, res) => {
  const { name, email, due, pay, roomNo, monthName,total } = req.body;

  

  // Set up the email options
  const mailOptions = {
    from: 'webandappdev.sabbir@gmail.com', // Sender email address
    to: email, // Recipient email
    subject: `Thanks for Your Payment for ${monthName.slice(6, ).toUpperCase()}`, // Subject of the email
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 10px 10px 0 0; text-align: center;">Thank You for Your Payment</h2>
            
            <div style="padding: 20px;">
                <p style="font-size: 18px; margin-bottom: 10px;">Dear <strong>${name.toUpperCase()}</strong>,</p>
                <p style="font-size: 16px; color: #555;">আমরা আপনার পেমেন্টের জন্য আপনাকে ধন্যবাদ জানাতে চাই। নিচে <span style = "font-weight: bold;">${monthName.slice(6, ).toUpperCase()}-</span> এর জন্য বিস্তারিত দেওয়া হলো :</p>

                
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; font-weight: bold; font-size: 16px;">Room No:</td>
                        <td style="padding: 8px; text-align: right; font-size: 16px;">${roomNo}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;font-size: 16px;">Total Amount:</td>
                        <td style="padding: 8px; text-align: right; color: #FFA500;font-size: 16px;">${total}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold;font-size: 18px;">Amount Paid:</td>
                        <td style="padding: 8px; text-align: right; color: green;font-size: 18px;">${pay}</td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 8px; font-weight: bold;font-size: 20px;">Total Due:</td>
                        <td style="padding: 8px; text-align: right; color: red; font-size: 20px;">${due}</td>
                    </tr>
                </table>
                
                <p style="margin-top: 20px; font-size: 14px; color: #888;">যদি আপনার কোনো প্রশ্ন থাকে বা অতিরিক্ত সহায়তার প্রয়োজন হয়, আমাদের সাথে নির্দ্বিধায় যোগাযোগ করুন।</p>
            </div>
            
            <div style="background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="font-size: 14px; color: #555;">শুভেচ্ছান্তে</p>
                <p style="font-size: 16px; color: #333;"><strong>মিতালি হোম পরিবার</strong></p>
                
            </div>
        </div>
    `,
  };

  // Send the email using Nodemailer
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully!' });
  });
};

