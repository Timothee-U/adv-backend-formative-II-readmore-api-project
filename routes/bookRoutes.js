const express = require('express');
const router = express.Router();
const {
  createBook,
  getBooks,
  getBookById,
} = require('../controllers/bookController');

router.post('/', createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);

module.exports = router;
