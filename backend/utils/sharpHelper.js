const sharp = require('sharp');

// Function to process the image using sharp and convert it to JPEG
const processImage = async (buffer) => {
  try {
    return await sharp(buffer).jpeg().toBuffer();
  } catch (error) {
    throw new Error('Error processing NID image');
  }
};

module.exports = { processImage };
