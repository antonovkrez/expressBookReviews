const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const findUser = async (username) => {
  try {
    return users.find(user => user.username === username);
  } catch (err) {
    throw err
  }
}

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: "Valid username is required" });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: "Password must be a string with at least 6 characters" });
  }

  const existingUser = await findUser(username)

  if (existingUser) {
    return res.status(409).json({ error: `User '${username}' already exists` });
  }

  try {
    users.push({ "username": username, "password": password });
    res.status(201).json({ message: `User '${username}' has been added successfully` });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

const getAllBooks = async () => {
  try {
    return books;
  } catch (err) {
    throw err;
  }
};


// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const data = await getAllBooks();
    res.json({ data });
  } catch (err) {
    console.error('Error loading books:', err);
    res.status(500).json({ error: "Error loading the books" });
  }
});

const getBookByIsbn = async (isbn) => {
  try {
    return books[isbn];
  } catch (err) {
    console.error('Error in getBookByIsbn:', err);
    throw new Error('Error retrieving book by ISBN');
  }
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const ISBN = req.params.isbn;
    const bookByIsbn = await getBookByIsbn(ISBN)
    res.json(bookByIsbn)
  } catch (err) {
    console.error('Error loading books:', err);
    res.status(500).json({ error: "Error loading the books" });
  }
});


const getBooksByAuthor = async (author) => {
  try {
      return Object.values(books).filter(book => 
          book.author.toLowerCase().includes(author.toLowerCase())
      );
  } catch (err) {
      console.error('Error in getBooksByAuthor:', err);
      throw new Error('Error retrieving books by author');
  }
};

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
      const author = req.params.author;
      
      if (!author || author.trim() === '') {
          return res.status(400).json({ error: "Author parameter is required" });
      }

      const data = await getBooksByAuthor(author);
      
      if (data.length === 0) {
          return res.status(404).json({ message: "No books found for this author" });
      }

      res.json(data);
  } catch (err) {
      console.error('Error in /author/:author route:', err);
      res.status(500).json({ error: "Error retrieving book details" });
  }
});

const getBooksByTitle = async (title) => {
  try {
      return Object.values(books).filter(book => 
          book.title.toLowerCase().includes(title.toLowerCase())
      );
  } catch (err) {
      console.error('Error in getBooksByTitle:', err);
      throw new Error('Error retrieving books by title');
  }
};

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
      const title = req.params.title;
      
      if (!title || title.trim() === '') {
          return res.status(400).json({ error: "Title parameter is required" });
      }

      const data = await getBooksByTitle(title);
      
      if (data.length === 0) {
          return res.status(404).json({ message: "No books found with this title" });
      }

      res.json(data);
  } catch (err) {
      console.error('Error in /title/:title route:', err);
      res.status(500).json({ error: "Error retrieving book details" });
  }
});

//  Get book review
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;

    // Input validation
    if (!isbn || isbn.trim() === '') {
      return res.status(400).json({ error: "ISBN parameter is required" });
    }

    const book = await getBookByIsbn(isbn);

    // Check if the book exists
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check if the book has reviews
    if (!book.reviews || book.reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }

    res.json({ reviews: book.reviews });
  } catch (err) {
    console.error('Error in /review/:isbn route:', err);
    res.status(500).json({ error: "Error retrieving book reviews" });
  }
});
module.exports.general = public_users;
