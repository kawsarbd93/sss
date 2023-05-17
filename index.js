 
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
 

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server Working");
});

 

// crud operations
async function run() {
  try {
    const client = new MongoClient('mongodb+srv://blogkawsar:DyUHLUUmnkEMlKTI@cluster0.zwupuzd.mongodb.net/?retryWrites=true&w=majority';);
    const database = await client.db("testdb");

    //calling collections
    const msgss = await database.collection("msgs");
 


    // add services
    app.post("/api/data", async (req, res) => {
      const service = req.body;
 
      const result = await msgss.insertOne({
        ...service,
      });

      res.send(result);
    });

     

     
  } finally {
  }
}

run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`server listen on port ${port}`);
});
