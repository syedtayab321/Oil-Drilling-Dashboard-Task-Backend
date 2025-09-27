const multer = require('multer');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Schema for uploaded data
const DataSchema = new mongoose.Schema({ data: Array }, { timestamps: true });
const DataModel = mongoose.model('Data', DataSchema);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const uploadMiddleware = multer({ storage });

const handleUpload = (req, res) => {
  uploadMiddleware.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      logger.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
      logger.error('Unknown upload error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    if (!req.file) {
      logger.warn('No file uploaded');
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      logger.debug(`Processing file: ${req.file.path}`);
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (data.length === 0) {
        throw new Error('Empty or invalid data in file');
      }

      const savedData = await DataModel.create({ data });
      logger.info(`Data saved to MongoDB with ID: ${savedData._id}`);

      // Delete temporary file
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          logger.warn(`Failed to delete temp file ${req.file.path}:`, unlinkErr);
        } else {
          logger.debug(`Temp file deleted: ${req.file.path}`);
        }
      });

      res.status(200).json({ data: savedData.data });
    } catch (error) {
      logger.error('Upload processing error:', error);
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to process upload: ' + error.message });
    }
  });
};

module.exports = { handleUpload };