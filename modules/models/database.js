async function connectToDatabase() {
  
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://127.0.0.1:27017/esercizio');

}

module.exports = connectToDatabase;