const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const app = express();

// MongoDB connection URI
const mongoURI = 'mongodb+srv://blogkawsar:DyUHLUUmnkEMlKTI@cluster0.zwupuzd.mongodb.net/?retryWrites=true&w=majority';
// Database name
const dbName = 'testdb';
// Collection name
const collectionName = 'data';

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

// Endpoint for handling the POST request
app.post('/api/data', (req, res) => {
  // Create a new data object based on the request body
  const newData = {
    message: req.body.message
  };
console.log(newData);
  // Connect to MongoDB
  mongodb.connect(mongoURI, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
      console.error('Failed to connect to MongoDB', err);
      res.status(500).json({ error: 'Failed to connect to the database' });
      return;
    }

    // Access the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the data object into the collection
    collection.insertOne(newData, (err, result) => {
      if (err) {
        console.error('Failed to save data to MongoDB', err);
        res.status(500).json({ error: 'Failed to save data' });
      } else {
        res.status(201).json({ message: 'Data saved successfully' });
      }

      // Close the MongoDB connection
      client.close();
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
