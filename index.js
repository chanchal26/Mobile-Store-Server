const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v73oziy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     console.log(req.headers);
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }

//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.WEB_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }


async function dbConnect() {
    try {

        const AllPhones = client.db('Mobile-Store').collection('AllPhones');
        const Users = client.db('Mobile-Store').collection('users');
        const MyOrder = client.db('Mobile-Store').collection('myOrders');
        const AdvertiseItem = client.db('Mobile-Store').collection('advertiseItem');
        const PaymentsCollection = client.db('Mobile-Store').collection('payments');



        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await Users.insertOne(user);
            res.send(result)
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await Users.findOne(query);
            res.send({ isAdmin: user?.adminRole === 'admin' });
        });

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await Users.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' });
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await Users.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        });

        // app.get('/myOrder/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const ID = id.trim();
        //     const query = { _id: ObjectId(ID) }
        //     const order = await MyOrder.findOne(query);
        //     res.send(order);
        // });


        app.get('/myOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await MyOrder.findOne(query);
            res.send(result);
        })

        app.post("/create-payment-intent", async (req, res) => {
            const data = req.body;
            const price = parseInt(data.price);

            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                "payment_method_types": [
                    "card"
                ],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });


        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await PaymentsCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId,
                }
            };
            const updatedResult = await MyOrder.updateOne(filter, updatedDoc);
            res.send(result);
        });

        app.delete('/deletePhone/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await AllPhones.deleteOne(query);
            res.send(result);
        });





        app.post('/myOrder', async (req, res) => {
            const order = req.body;
            const result = await MyOrder.insertOne(order);
            res.send(result)
        });



        app.get('/myOrder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await MyOrder.find(query).toArray();
            console.log(result);
            res.send(result);
        });

        app.get('/myProducts/:email', async (req, res) => {
            const email = req.params.email;
            const result = await AllPhones.find({ email: email }).toArray();
            res.send(result);
        });


        app.post('/advertise', async (req, res) => {
            const advertise = req.body;
            const result = await AdvertiseItem.insertOne(advertise);
            res.send(result)
        });

        app.get('/advertise', async (req, res) => {
            const result = await AdvertiseItem.find().toArray();
            res.send(result);
        });


        app.get('/allBuyers', async (req, res) => {
            const query = { role: "Buyer" };
            const result = await Users.find(query).toArray();
            res.send(result);
        });


        app.get('/allSellers', async (req, res) => {
            const query = { role: "Seller" };
            const result = await Users.find(query).toArray();
            res.send(result);
        });


        app.post('/allPhones', async (req, res) => {
            const phone = req.body;
            const result = await AllPhones.insertOne(phone)
            res.send(result)
        });


        app.get('/allPhones', async (req, res) => {
            const result = await AllPhones.find({}).toArray();
            res.send(result);
        });

        app.get('/allPhones/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const getSinglePhone = await AllPhones.findOne(query);
            res.send(getSinglePhone)
        })

        app.get('/iphone', async (req, res) => {
            const query = { brand: "Iphone" };
            const result = await AllPhones.find(query).toArray();
            res.send(result)
        });

        app.get('/lg', async (req, res) => {
            const query = { brand: "LG" };
            const result = await AllPhones.find(query).toArray();
            res.send(result)
        });

        app.get('/mi', async (req, res) => {
            const query = { brand: "MI" };
            const result = await AllPhones.find(query).toArray();
            res.send(result)
        });

        app.get('/onePlus', async (req, res) => {
            const query = { brand: "OnePlus" };
            const result = await AllPhones.find(query).toArray();
            res.send(result)
        });


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