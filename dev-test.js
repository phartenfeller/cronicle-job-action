// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const runCronicleJob = require('./src/runCronicleJob');

const main = async () => {
  await runCronicleJob({
    cronicleHost: process.env.CRONICLE_HOST,
    eventId: process.env.EVENT_ID,
    apiKey: process.env.API_KEY,
    fetchInterval: 5,
    maxFetchRetries: 100,
    failRegex: null,
  });

  await runCronicleJob({
    cronicleHost: process.env.CRONICLE_HOST,
    eventId: process.env.EVENT_ID2,
    apiKey: process.env.API_KEY,
    fetchInterval: 5,
    maxFetchRetries: 100,
    failRegex: 'Status Code: 1',
  });
};

main();
