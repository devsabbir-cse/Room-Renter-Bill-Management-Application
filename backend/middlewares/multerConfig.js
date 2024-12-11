// multerConfig.js

const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});

// Export the upload middleware
module.exports = upload;
