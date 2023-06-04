const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const WooCommerceAPI = require("woocommerce-api");

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server Working");
});

// Create a new instance of the WooCommerceAPI with your credentials
const WooCommerce = new WooCommerceAPI({
  url: "https://hostmsn.com",
  consumerKey: "ck_786fa0b155e6ba15579ca8997829fc0a81063eb0",
  consumerSecret: "cs_483f23aa650611797a259d15bf0d658ec531239d",
  wpAPI: true,
  version: "wc/v3",
});

// CRUD operations
async function run() {
  try {
    const client = new MongoClient(
      "mongodb+srv://blogkawsar:DyUHLUUmnkEMlKTI@cluster0.zwupuzd.mongodb.net/?retryWrites=true&w=majority"
    );
    const database = await client.db("testdb");

    // Calling collections
    const msgss = await database.collection("orders");

    // Add services
    app.get("/api/:data", async (req, res) => {
      const str = req.params.data;
      // Remove all "+"
      let cleanedStr = str.replace(/\+/g, " ");

      // Extracting Phone Number
      const phoneNumberRegex = /from (\d+)/i;
      const phoneNumberMatch = cleanedStr.match(phoneNumberRegex);
      const phoneNumber = phoneNumberMatch ? phoneNumberMatch[1] : null;

      // Extracting Transaction ID
      const trxIDRegex = /TrxID (\w+)/;
      const trxIDMatch = cleanedStr.match(trxIDRegex);
      const trxID = trxIDMatch ? trxIDMatch[1] : null;

      // Extracting Received Payment
      const receivedPaymentRegex = /received payment Tk (\d+\.\d+)/i;
      const receivedPaymentRegex2 = /received payment Tk (\d+\,\d+)/i;
      const receivedPaymentMatch = cleanedStr.match(receivedPaymentRegex);

      let receivedPayment = receivedPaymentMatch
        ? receivedPaymentMatch[1]
        : cleanedStr.match(receivedPaymentRegex2)[1].replace(",", "");

      const result = await msgss.insertOne({
        phoneNumber,
        trxID,
        receivedPayment,
      });

      const params = req.params.text;
      // Define the order data
      const orderData = {
        payment_method: "bkash",
        payment_method_title: "bKash",
        set_paid: true,
        transaction_id: trxID,
        billing: {
          first_name: trxID + " " + phoneNumber,
          email: "unknown@unknown.com",
          phone: phoneNumber,
        },
        line_items: [
          {
            product_id: 628, // ID of the product
            quantity: parseInt(receivedPayment),
          },
        ],
        meta_data: [
          {
            key: "Transaction ID",
            value: trxID,
          },
        ],
      };

      // Create the order
      WooCommerce.post("orders", orderData, (err, data, response) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Failed to create order" });
        }

        return res
          .status(200)
          .json({ message: "Order created successfully", order: data });
      });
    });

    app.get("/numbers", async (req, res) => {
      //only phoneNumber with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const skip = (page - 1) * limit;
      const total = await msgss.countDocuments();
      const pages = Math.ceil(total / limit);
      const result = await msgss
        .find(
          {},
          {
            projection: {
              _id: 0,
              phoneNumber: 1,
            },
          }
        )
        .skip(skip)
        .limit(limit)
        .toArray();

      res.status(200).json({ data: result, page, pages });
    });
  } finally {
  }
}

run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`server listen on port ${port}`);
});
