const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const dbName = 'esercizio';

async function connectToDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(dbName);
    return database;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

module.exports = connectToDatabase;