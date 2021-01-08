require('dotenv').config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require('express');
const https = require('https');
const crypto = require('crypto');
const admin = require("firebase-admin");

const app = express();
const path = require('path');
const port = 2300;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/***************************************************************************************************
FIREBASE SETUP 
***************************************************************************************************/
const serviceAccount = require("./saKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


/***************************************************************************************************
AUTH MIDDLEWARE
***************************************************************************************************/
const isLoggedIn = (req, res, next) => {
  const sessionCookie = req.cookies.session || "";

  console.log(sessionCookie);

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      next()
    })
    .catch((error) => {
      res.redirect("/");
    });
};

/***************************************************************************************************
ROUTE DEFINITION
***************************************************************************************************/
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get('/accounts', isLoggedIn, async (req, res) => {
  res.sendFile(path.join(__dirname + '/public/accounts.html'));
});

app.get('/api/accounts', isLoggedIn, async (req, res) => {
  const accounts = await getCoinbaseData('/accounts', 'GET');
  const activeAccounts = accounts.filter(
    (account) => account.balance > 0 && account.currency !== 'EUR'
  );

  res.send(activeAccounts);
});

app.get('/api/products/bidask/:id', isLoggedIn, async (req, res) => {
  const bidAsk = await getCoinbaseData(
    `/products/${req.params.id}/book`,
    'GET'
  );

  res.send(bidAsk);
});

app.get('/api/user/purchased/rates', isLoggedIn, (req, res) => {
  res.send(process.env.BOUGHT_RATES)
});

app.listen(port, () => {
  console.log(`Coinbase viewer listening at http://localhost:${port}`);
});

/***************************************************************************************************
COINBASE API
***************************************************************************************************/
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
