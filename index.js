const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.enable('trust proxy'); //to detect if req.secure is true/false

//Block http requests. Only allow https requests
app.use(function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(404).send('Not found');
  } else {
    next();
  }
});

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Genius server');
});

app.get('/new', (req, res) => {
  res.send('Heroku Deploy');
});
app.get('/another', (req, res) => {
  res.send('Another Heroku Deploy');
});

app.listen(port, () => {
  console.log('Running Genius Car Mechanics on', port);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8vsmo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log('successfully connect to database');

    const database = client.db('CarMechanics');
    const servicesCollection = database.collection('services');

    // POST API
    app.post('/services', async (req, res) => {
      const data = req.body;
      const result = await servicesCollection.insertOne(data);
      res.send(result);
    });

    // GET API
    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET SINGLE SERVICE
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    // DELETE API
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // client.close();
    // console.log('disconnected');
  }
}

run().catch(console.dir);
