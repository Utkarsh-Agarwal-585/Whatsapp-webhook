const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));
require('dotenv').config();
// app.use(express.json());
// const router = express.Router()
// const test = require('./routes/rhizitest')
// app.use('/rhizicube', test)
const verify_token = process.env.VERIFY_TOKEN 
const token = process.env.TOKEN

app.get('/webhook', (req, res) => {
    /*
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
    */
    // Parse params from the webhook verification request
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        // eslint-disable-next-line no-console
        console.log('WEBHOOK_VERIFIED')
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  })

  app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
    let body_param = req.body;
    // Check the Incoming webhook message
    console.log(JSON.stringify(req.body, null, 2))
    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (body_param.object) {
        console.log("inside body param");
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
        let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
        let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;// extract the message text from the webhook payload

        console.log("phone number: ", phone_number_id);
        console.log("from: ",from);
        console.log("msg_body: ", msg_body);
        axios({
          method: 'POST', // Required, HTTP method, a string, e.g. POST, GET
          url:
            'https://graph.facebook.com/v15.0/'+phone_number_id+'/messages?access_token='+token,
          data: {
            messaging_product: 'whatsapp',
            to: from,
            text: { 
                body: 'Hi, I am from Rhizicube, your message is '+msg_body 
            }
          },
          headers: { 'Content-Type': 'application/json' },
        // eslint-disable-next-line no-console
        });
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404);
    }
    }
  });
  
  app.get("/",(req,res) => {
    res.status(200).send("Webhook has setup and listening..")
  })
 
module.exports = app;