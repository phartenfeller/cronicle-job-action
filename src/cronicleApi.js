const fetch = require('node-fetch');
const core = require('@actions/core');
const blankLog = require('./blankLog');
const isObject = require('./isObject');
const packageJson = require('../package.json');

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': `cronicle-job-action@${packageJson.version}`,
};

class HTTPResponseError extends Error {
  constructor(response, ...args) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText}`,
      ...args
    );
    this.response = response;
  }
}

const checkStatus = (response) => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    return response;
  }
  throw new HTTPResponseError(response);
};

async function startEvent({
  cronicleHost,
  eventId,
  apiKey = null,
  parameters = null,
}) {
  const payload = {
    id: eventId,
    api_key: apiKey,
  };

  if (isObject(parameters)) {
    payload.params = parameters;
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: defaultHeaders,
  };

  const response = await fetch(`${cronicleHost}/api/app/run_event/v1`, options);
  try {
    checkStatus(response);
  } catch (error) {
    const errorBody = await error.response.text();
    core.error(`Could not start job: ${errorBody}`);
    throw new Error(errorBody);
  }
  const data = await response.json();

  if (data.code !== 0) {
    core.error(`Error from API: ${data.description}`);
    throw new Error(`Error from API: ${data.description}`);
  }

  // for now only handle first id
  return data.ids[0];
}

async function checkJobStatus(hostname, taskId, apiKey, errorRetryCount) {
  let newErrorRetryCount = errorRetryCount;

  const payload = {
    id: taskId,
    api_key: apiKey,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: defaultHeaders,
  };

  const response = await fetch(
    `${hostname}/api/app/get_job_status/v1`,
    options
  );
  try {
    checkStatus(response);
  } catch (error) {
    const errorBody = await error.response.text();
    const errorText = blankLog(errorBody);

    if (errorRetryCount < 5) {
      newErrorRetryCount += 1;
      core.info(
        `API returned error: ${errorText}. Retrying #${newErrorRetryCount} ...`
      );
    } else {
      core.error(`Could not check job status: ${errorText}`);
      throw new Error(errorText);
    }
  }
  const data = await response.json();

  if (data.code !== 0) {
    core.error(`Error from API: ${data.description}`);
    throw new Error(`Error from API: ${data.description}`);
  }

  const finished = 'time_end' in data.job;

  return { finished, success: data.job.code === 0, newErrorRetryCount };
}

async function getJobLog(hostname, taskId) {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': `cronicle-job-action@${packageJson.version}`,
    },
  };

  const response = await fetch(
    `${hostname}/api/app/get_job_log?id=${taskId}`,
    options
  );
  try {
    checkStatus(response);
  } catch (error) {
    const errorBody = await error.response.text();
    core.error(`Could not get job log: ${errorBody}`);
    throw new Error(errorBody);
  }
  const data = await response.text();
  const blanked = blankLog(data);

  return blanked;
}

module.exports = { startEvent, checkJobStatus, getJobLog };
