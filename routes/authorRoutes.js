const express = require('express');
const router = express.Router();
const {
  createAuthor,
  getAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getBooksByAuthor,
  getAuthorStats,
} = require('../controllers/authorController');

router.post('/', createAuthor);
router.get('/', getAuthors);
router.get('/:id', getAuthorById);
router.put('/:id', updateAuthor);
router.delete('/:id', deleteAuthor);
router.get('/:id/books', getBooksByAuthor);
router.get('/:id/stats', getAuthorStats);

module.exports = router;
