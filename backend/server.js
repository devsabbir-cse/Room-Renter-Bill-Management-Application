const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const roomRoutes = require('./routes/roomRoutes');
const monthRoutes = require('./routes/monthRoutes')


const app = express();
const port = 8081;
app.use(bodyParser.json());

// Enable CORS and JSON parsing
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Allow requests only from http://localhost:3000
}));

app.use(express.json());

// Use room routes
app.use('/api', roomRoutes);
app.use(monthRoutes);
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


const errorHandler = (err, req, res, next) => { 
  if(res.headerSent){
    return next(err);
  }
  res.status(500).json({ error : err})
}

app.use(errorHandler);