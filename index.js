const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 5000;

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://arabian:gVwTMU5dC3e0sFWh@cluster0.bm8mo.mongodb.net/burjAlArab?retryWrites=true&w=majority";
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
  app.get('/bookings',(req,res)=>{
    bookings.find({email : req.query.email})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })
});



app.listen(port);
