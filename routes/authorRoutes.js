const express = require('express');
const router = express.Router();
const { createAuthor } = require('../controllers/authorController');

router.post('/', createAuthor);

module.exports = router;
