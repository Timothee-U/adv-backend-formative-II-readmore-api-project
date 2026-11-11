const mongoose = require('mongoose');
const Book = require('../models/Book');
const Author = require('../models/Author');
const { checkPriceAndYear } = require('../utils/bookRules');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findDuplicateTitle = (authorId, title, excludeId) => {
  const query = {
    author: authorId,
    title: { $regex: `^${escapeRegex(title.trim())}$`, $options: 'i' },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Book.findOne(query);
};

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
    const ruleError = checkPriceAndYear(req.body);
    if (ruleError) {
      return res.status(422).json({ error: ruleError });
    }
    if (typeof req.body.title === 'string') {
      const duplicate = await findDuplicateTitle(req.body.author, req.body.title);
      if (duplicate) {
        return res
          .status(409)
          .json({ error: 'This author already has a book with that title' });
      }
    }
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const { genre, author, minPrice, maxPrice, search, sort, order } = req.query;
    const filter = {};

    if (genre) {
      filter.genre = { $regex: `^${escapeRegex(genre)}$`, $options: 'i' };
    }
    if (author) {
      if (!mongoose.isValidObjectId(author)) {
        return res.status(400).json({ error: 'author must be a valid id' });
      }
      filter.author = author;
    }
    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: 'i' };
    }

    const priceFilter = {};
    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);
    if (Object.values(priceFilter).some(Number.isNaN)) {
      return res.status(400).json({ error: 'minPrice and maxPrice must be numbers' });
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    const allowedSorts = ['price', 'title', 'publishedYear'];
    const sortOption = {};
    if (sort) {
      if (!allowedSorts.includes(sort)) {
        return res
          .status(400)
          .json({ error: `sort must be one of: ${allowedSorts.join(', ')}` });
      }
      sortOption[sort] = order === 'desc' ? -1 : 1;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const total = await Book.countDocuments(filter);
    const results = await Book.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author');
    res.json({ page, limit, total, results });
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
    const ruleError = checkPriceAndYear(req.body);
    if (ruleError) {
      return res.status(422).json({ error: ruleError });
    }
    const existing = await Book.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const duplicate = await findDuplicateTitle(
      req.body.author || existing.author,
      req.body.title || existing.title,
      existing._id
    );
    if (duplicate) {
      return res
        .status(409)
        .json({ error: 'This author already has a book with that title' });
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
