const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = {
  "john": { password: "password123" },
  "jane": { password: "password456" }
};

const isValid = (username) => {
  return username && username.trim() !== '';
};

const authenticatedUser = (username, password) => {
  return users[username] && users[username].password === password;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
    
    req.session.authorization = { accessToken, username};    
    return res.status(200).send({accessToken: accessToken});
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; 
  const review = req.body.review; 
  const username = req.session.authorization.username; 

  if (!review) {
      return res.status(400).json({ message: "Review content is required" });
  }

  let book = books[isbn];
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // If reviews object doesn't exist for the book, create it
  if (!book.reviews) {
      book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully", reviews: book.reviews });
});

//Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
      let book = books[isbn];
      delete book.reviews[username];
      return res.status(200).json("Review successfully deleted");
  }
  else {
      return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJpYXQiOjE3MjYxNTYzMzAsImV4cCI6MTcyNjE1OTkzMH0.LTeB5WYH_tFqXW94Kkrq5k7D4ggLtO9dwpo83JnEhPM