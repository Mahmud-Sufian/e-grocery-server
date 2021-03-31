const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const admin = require("firebase-admin");
require('dotenv').config();


var serviceAccount = require("./configs/grocery-c8cc1-firebase-adminsdk-g8rrc-79692a7a64.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
 

const app = express();
app.use(bodyParser.json());
app.use(cors());


    
 
 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozkvf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




 

app.get('/', (req, res) => {
  res.send('Hello World!')
})




 

client.connect(err => {
    const productCollection = client.db("grocery").collection("products");
    const orderCollection = client.db("grocery").collection("order");


     app.get('/allProduct', (req, res) => {
        productCollection.find({})
        .toArray( (err, document) => {
            res.send(document);
        })
     })


     app.get('/singleProduct/:id', (req, res) => {
        productCollection.find({_id: ObjectId(req.params.id)})
        .toArray( (err, document) => {
            res.send(document[0]);
        })
     })

      app.post('/addProduct', (req, res) => {
          const item = req.body;
          productCollection.insertOne(item)
        .then(result => {
             res.send(result.insertedCount > 0);
        })
      })


      app.delete('/delete/:id', (req, res) => {
        productCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
           res.send(result.deletedCount > 0);
        })
      })


      app.post('/addOrder', (req, res) => {
        orderCollection.insertOne(req.body)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
      })

      app.get('/getOrder', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('bearer')) {
            const idToken = bearer.split(' ')[1];
        
          admin.auth().verifyIdToken(idToken)
            .then((decodedToken) => {
              const tokenEmail = decodedToken.email;
              const queryEmail = req.query.email;
             
              if(tokenEmail == queryEmail){
                orderCollection.find({email: queryEmail})
                  .toArray( (err, document) => {
                  res.send(document);
                })
              }
              else{
                res.status(401).send('un authrized access')
              }
              
            })
            .catch((error) => {
              // Handle error
            });
        }
        else{
          res.status(401).send('un authrized access')
        }
      })
      
  });



app.listen(process.env.PORT || 8080, () => console.log(`This port is running`))