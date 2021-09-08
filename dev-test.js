// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const runCronicleJob = require('./src/runCronicleJob');

const main = async () => {
  // test simple
  // see jobs/job#1.sh
  await runCronicleJob({
    cronicleHost: process.env.CRONICLE_HOST,
    eventId: process.env.EVENT_ID,
    apiKey: process.env.API_KEY,
    fetchInterval: 5,
    maxFetchRetries: 100,
    failRegex: null,
  });

  // test regex
  // see jobs/job#2.sh
  await runCronicleJob({
    cronicleHost: process.env.CRONICLE_HOST,
    eventId: process.env.EVENT_ID2,
    apiKey: process.env.API_KEY,
    fetchInterval: 5,
    maxFetchRetries: 100,
    failRegex: 'Status Code: 1',
  });

  // test parameters + regex
  // see jobs/job#3.sh
  await runCronicleJob({
    cronicleHost: process.env.CRONICLE_HOST,
    eventId: process.env.EVENT_ID3,
    apiKey: process.env.API_KEY,
    failRegex: `First:\\s*$`,
    parameters: {
      param1: 'one',
      param2: 'two',
    },
  });
};

main();
