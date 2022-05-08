const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.umplf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db('Assignment').collection('services');

    app.get('/service', async (req, res) => {
      console.log('query', req.body)
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size)

      const query = {};
      const cursor = servicesCollection.find(query);
      let services;
      if (page || size) {
        services = await cursor.skip(page * size).limit(size).toArray();
      }
      else {
        services = await cursor.toArray()
      }

      res.send(services);
    })



    app.get('/productCount', async (req, res) => {
      const count = await servicesCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // service id
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await servicesCollection.findOne(query)
      res.send(result)
    })
    // update
    app.put('/service/:id', async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateService = {
        $set: {
          image:update.image,
          name: update.name,
          price: update.price,
          quantity: update.quantity,
          description: update.description,
        }
      }
      const result = await servicesCollection.updateOne(filter,updateService,option);
      res.send(result);
    })

    app.post('/service',async(req, res)=>{
      const newItem = req.body;
      console.log('adding new user', newItem);
      const result = await servicesCollection.insertOne(newItem)
      res.send(result)
    })



  }

  finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Assignment-11-running')
})
app.listen(port, () => {
  console.log('Assignment 11 is running', port)
})