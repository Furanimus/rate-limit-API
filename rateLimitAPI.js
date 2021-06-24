const bodyParser = require("body-parser");
const express = require("express");
const fetch = require("node-fetch");
const crypto = require('crypto');
const app = express()

setUses();
loadEnvVariables();

const appJsonHeaderSTR = "application/json";

//Env Variables
const requestRate = process.env.requestRate;
const interval = process.env.interval;
const port = process.env.PORT;

hash = crypto.getHashes();

const urlsMap = new Map()
let isThrottled = false;

app.post('/visit', function (request, response) {
  //handle /visit
  const timestampRcv = Date.now();
  if (request.is('application/json')) {
    const data = request.body;
    hashedUrl = crypto.createHash('sha1').update(data.url).digest('hex');
    addToUrlsMap(hashedUrl, timestampRcv);
    isThrottled = isUrlThrottled(hashedUrl);

    response.contentType(appJsonHeaderSTR);
    throttledJSON = {throttled: isThrottled};
    response.send(throttledJSON);
  } 
})

app.listen(port);

function loadEnvVariables() {
  const dotenv = require('dotenv');
  dotenv.config();
}

function setUses() {
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
}

function addToUrlsMap(hashedUrl, timestampRcv) {
  if(urlsMap.has(hashedUrl))
  {
    timestampsArray = urlsMap.get(hashedUrl);
    cleanOldEntries(timestampsArray, timestampRcv);
    timestampsArray.push(timestampRcv);
  } else {
    urlsMap.set(hashedUrl, new Array);
    urlsMap.get(hashedUrl).push(timestampRcv);
  }
}

function cleanOldEntries(timestampsArray, timestamp) {
  while(timestamp - timestampsArray[0] > interval) {
    timestampsArray.shift();
  }
}

function isUrlThrottled(hashedUrl) {
  if (urlsMap.get(hashedUrl).length > requestRate) {
    return true;
  } else {
    return false;
  }
}