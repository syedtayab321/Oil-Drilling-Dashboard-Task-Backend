require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const uploadRouter = require('./routes/upload');
const chatRouter = require('./routes/chat');


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

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info('Uploads directory created');
}

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/drillai';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => logger.info(`MongoDB connected to ${mongoUri}`))
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });



app.use('/upload', uploadRouter);
app.use('/chat', chatRouter);

app.use((err, req, res, next) => {
  logger.error('Global error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});