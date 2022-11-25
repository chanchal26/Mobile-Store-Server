const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v73oziy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function dbConnect() {
    try {

        const AllPhones = client.db('Mobile-Store').collection('AllPhones');
        const Users = client.db('Mobile-Store').collection('users');

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await Users.insertOne(user);
            res.send(result)
        });


        // app.get('/allBuyers', async (req, res) => {
        //     const query = { role: "Buyer" };
        //     const result = await Users.find(query).toArray();
        //     res.send(result);
        // });


        // app.get('/allSellers', async (req, res) => {
        //     const query = { role: "Seller" };
        //     const result = await Users.find(query).toArray();
        //     res.send(result);
        // });


        app.post('/allPhones', async (req, res) => {
            const phone = req.body;
            const result = await AllPhones.insertOne(phone)
            res.send(result)
        });


        // app.get('/allPhones', async (req, res) => {
        //     const result = await AllPhones.find({}).toArray();
        //     res.send(result);
        // });

        // app.get('/allPhones/:id', async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: ObjectId(id) }
        //     const getSinglePhone = await AllPhones.findOne(query);
        //     res.send(getSinglePhone)
        // })

        // app.get('/iphone', async (req, res) => {
        //     const query = { brand: "Iphone" };
        //     const result = await AllPhones.find(query).toArray();
        //     res.send(result)
        // });
        // app.get('/lg', async (req, res) => {
        //     const query = { brand: "LG" };
        //     const result = await AllPhones.find(query).toArray();
        //     res.send(result)
        // });
        // app.get('/mi', async (req, res) => {
        //     const query = { brand: "MI" };
        //     const result = await AllPhones.find(query).toArray();
        //     res.send(result)
        // });
        // app.get('/onePlus', async (req, res) => {
        //     const query = { brand: "OnePlus" };
        //     const result = await AllPhones.find(query).toArray();
        //     res.send(result)
        // });

    }
    finally {

    }
}

dbConnect().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Mobile Store');
});

app.listen(port, () => {
    console.log(`listening to port on ${port}`);
});