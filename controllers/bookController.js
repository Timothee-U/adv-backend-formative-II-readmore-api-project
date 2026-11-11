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
      return res.status(400).json({ error: 'Author does not exist' });
    }
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('author');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Book not found' });
    }
    if (req.body.author) {
      if (!mongoose.isValidObjectId(req.body.author)) {
        return res.status(400).json({ error: 'Invalid author id' });
      }
      const authorExists = await Author.findById(req.body.author);
      if (!authorExists) {
        return res.status(400).json({ error: 'Author does not exist' });
      }
    }
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('author');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
