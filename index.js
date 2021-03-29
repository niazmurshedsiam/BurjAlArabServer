const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();
app.use(cors());
app.use(bodyParser.json());
require('dotenv').config();
const port = 5000;
var serviceAccount = require("./configs/burj-al-arab-after-auth-1e819-firebase-adminsdk-pxrwo-0f33ee5c0c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

const MongoClient = require("mongodb").MongoClient;
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bm8mo.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("burjAlArab").collection("bookings");
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });
  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer")) {
      const idToken = bearer.split(" ")[1];
      console.log({ idToken });
      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          console.log(tokenEmail,queryEmail);
          if (tokenEmail == queryEmail) {
            bookings
              .find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              });
          }
          else{
            res.status(401).send('unauthorized access');
          }
        })
        .catch(function (error) {
          res.status(401).send('unauthorized access');
        });
    }
    else{
      res.status(401).send('unauthorized access');
    }
  });
});

app.listen(port);
