require('dotenv').config();
const express = require('express');
const https = require('https');
const crypto = require('crypto');
const app = express();
const path = require('path');
const port = 2300;

app.get('/', (req, res) => {
  getCoinbaseData();
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const getCoinbaseData = () => {
  // request details
  const coinbaseURL = 'api.pro.coinbase.com';
  const requestPath = '/profiles';
  const method = 'GET';

  // create the prehash string by concatenating required parts
  const timestamp = Date.now() / 1000;
  const what = timestamp + method + requestPath;

  // decode the base64 secret
  const key = Buffer.from(process.env.CB_SECRET, 'base64');

  // create a sha256 hmac with the secret
  const hmac = crypto.createHmac('sha256', key);

  // sign the require message with the hmac
  // and finally base64 encode the result
  const sign = hmac.update(what).digest('base64');

  const options = {
    hostname: coinbaseURL,
    port: 443,
    path: requestPath,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0', 
      'CB-ACCESS-KEY': process.env.CB_KEY, // The api key as a string.
      'CB-ACCESS-SIGN': sign, // The base64-encoded signature (see Signing a Message).
      'CB-ACCESS-TIMESTAMP': timestamp, // A timestamp for your request.
      'CB-ACCESS-PASSPHRASE': process.env.CB_PASSPHRASE, // The passphrase you specified when creating the API key.
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });
  
  req.end();
};
