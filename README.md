# Coinbase Viewer

A simple express app that allows you to view your coinbase accounts using the Coinbase Pro API.

## Requirements
You will need to have Node.js installed to run this project, please visit the node site for install
instructions: https://nodejs.org/en/download/. You will also need a Coinbase Pro account and will 
need to issue an API key with view access to the accounts/portfolio you wish to display.

## Installation
Once you have NPM installed you can run the following shell commands to install this project, two
npm:
```
git clone https://github.com/jb-0/coinbase-viewer.git
cd coinbase-viewer
npm install
```

## Environment variables
For assigning environment variables in dev I opted to use https://www.npmjs.com/package/dotenv,
however you can use your preferred approach to assigning environment variables.
- **CB_KEY** - The api key as a string.
- **CB_SECRET** - The api secret associated with the key.
- **CB_PASSPHRASE** - The passphrase you specified when creating the API key.

## Running the application
To run the app you can execute the following commands in the project root directory:
```
node server.js
```

Using your preferred web browser you can navigate to localhost:2300 to view and use the app.
