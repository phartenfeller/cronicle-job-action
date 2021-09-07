/* eslint-disable no-console */
const process = require('process');
const cp = require('child_process');
const path = require('path');

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env.INPUT_CRONICLE_HOST = 'https://example.com';
  process.env.INPUT_EVENT_ID = 'secret-sxkasassa';
  process.env.INPUT_API_KEY = 'secret-saasfasifakmgpaosagso';
  process.env.INPUT_RESULT_FETCH_INTERVAL = 5;
  process.env.INPUT_MAX_FETCH_RETRIES = 50;
  process.env.INPUT_FAIL_ON_REGEX_MATCH = null;

  const ip = path.join(__dirname, 'index.js');
  console.log(cp.execSync(`node ${ip}`, { env: process.env }).toString());
});
