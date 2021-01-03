require('dotenv').config()
const express = require('express')
const https = require('https')
const app = express()
const path = require('path')
const port = 2300
const coinbaseURL = 'https://api.pro.coinbase.com';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/index.html'))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})