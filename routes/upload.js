const express = require('express');
const { handleUpload } = require('./../controllers/uploadController');

const router = express.Router();

router.post('/', handleUpload);

module.exports = router;