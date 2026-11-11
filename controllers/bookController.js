const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');

exports.createBook = async (req, res) => {
  try {
    const { author } = req.body;
    if (!author || !mongoose.isValidObjectId(author)) {
      return res.status(400).json({ error: 'A valid author id is required' });
    }
    const authorExists = await Author.findById(author);
    if (!authorExists) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
