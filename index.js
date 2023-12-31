const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oz2ylzg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productCollection = client.db('productDB').collection('product');
        const cartCollection = client.db('productDB').collection('mycart')

        //Product Related

        //read all data
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //Product data Create fo Post
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        //Reading Data of a particular product or item---put/details
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query)
            res.send(result);
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true };
            const updatedProduct = req.body;
            const product = {
                $set: {
                    name: updatedProduct.name,
                    brand: updatedProduct.brand,
                    type: updatedProduct.type,
                    price: updatedProduct.price,
                    photo: updatedProduct.photo,
                    rating: updatedProduct.rating,
                }
            }
            const result = await productCollection.updateOne(filter, product, option);
            res.send(result);
        })

        //Cart Related

        app.post('/mycart', async (req, res) => {
            const product = req.body;
            const result = await cartCollection.insertOne(product)
            res.send(result)
        })

        app.get('/mycart', async (req, res) => {
            const cursor = cartCollection.find()
            const result = await cursor.toArray()
            res.send(result);
        })



        app.delete('/mycart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Brand Shop Server Is Running")
});

app.listen(port, () => {
    console.log(`Coffee server is running on port:${port}`);
})