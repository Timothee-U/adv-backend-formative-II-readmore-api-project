const mongoose = require('mongoose');
const Author = require('../models/Author');
const Book = require('../models/Book');

exports.createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuthorById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBooksByAuthor = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const books = await Book.find({ author: author._id });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAuthor = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    const bookCount = await Book.countDocuments({ author: author._id });
    if (bookCount > 0) {
      return res.status(409).json({
        error: `Cannot delete author: they still have ${bookCount} book(s). Delete or reassign the books first.`,
      });
    }
    await author.deleteOne();
    res.json({ message: 'Author deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
