const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    ISBN: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    genre: String,
    publishedYear: Number
});

const bookModel = mongoose.model("books", bookSchema)

module.exports = bookModel;