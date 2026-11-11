const express = require('express');
const router = express.Router();
const {
  createAuthor,
  getAuthors,
  getAuthorById,
} = require('../controllers/authorController');

router.post('/', createAuthor);
router.get('/', getAuthors);
router.get('/:id', getAuthorById);

module.exports = router;
