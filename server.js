require('dotenv').config();
const express = require('express');
const https = require('https');
const crypto = require('crypto');
const app = express();
const path = require('path');
const port = 2300;
let exchangeRatesUSD;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/api/accounts', async (req, res) => {
  const accounts = await getCoinbaseData('/accounts', 'GET');
  const activeAccounts = accounts.filter((account) => account.balance > 0);
  exchangeRatesUSD = await getNomicsData();

  res.send(activeAccounts);
});

app.get('/api/convert/:from-:to-:amount', async (req, res) => {
  const rate = exchangeRatesUSD.filter(exchangeRate => exchangeRate.currency === req.params.from)

  res.send({'conversion': rate[0].rate * req.params.amount});
});

app.listen(port, () => {
  console.log(`Coinbase viewer listening at http://localhost:${port}`);
});

const getNomicsData = async () => {
  const nomicsURL = 'api.nomics.com'
  const path = '/v1/exchange-rates'
  const auth = `?key=${process.env.NOMICS_KEY}`

  const options = {
    hostname: nomicsURL,
    path: path + auth,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  };

  let apiDataPromise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });

  return await apiDataPromise;
}

const getCoinbaseData = async (requestPath, method, bodyObject) => {
  const body = JSON.stringify(bodyObject) || '';

  const coinbaseURL = 'api.pro.coinbase.com';

  // create the prehash string by concatenating required parts
  const timestamp = Date.now() / 1000;
  const what = timestamp + method + requestPath + body;

  // decode the base64 secret
  const key = Buffer.from(process.env.CB_SECRET, 'base64');

  // create a sha256 hmac with the secret
  const hmac = crypto.createHmac('sha256', key);

  // sign the require message with the hmac
  // and finally base64 encode the result
  const sign = hmac.update(what).digest('base64');

  const options = {
    hostname: coinbaseURL,
    // port: 443,
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

  if (bodyObject) {
    options.headers['Content-Length'] = body.length.toString();
  }

  let apiDataPromise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (bodyObject) {
      req.write(body);
    }

    req.end();
  });

  return await apiDataPromise;
};
