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

function formatResponseLog(response, body) {
  const blanked = blankLog(body);
  return `\nStatus: ${response.status} - ${
    response.statusText
  }\nHeaders: ${JSON.stringify(response.headers)}\nBody: ${blanked}`;
}

async function startEvent({
  cronicleHost,
  eventId,
  apiKey = null,
  parameters = null,
  debugLogResponses = false,
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

    if (debugLogResponses) {
      core.info(
        `Job start response: ${formatResponseLog(response, errorBody)}`
      );
    }

    core.error(`Could not start job: ${errorBody}`);
    throw new Error(errorBody);
  }
  const data = await response.json();

  if (debugLogResponses) {
    core.info(
      `Job start response: ${formatResponseLog(response, JSON.stringify(data))}`
    );
  }

  if (data.code !== 0) {
    core.error(`No success code from start job call: ${data.description}`);
    throw new Error(`No success code from start job call: ${data.description}`);
  }

  // for now only handle first id
  return data.ids[0];
}

async function checkJobStatus(
  hostname,
  taskId,
  apiKey,
  errorRetryCount,
  debugLogResponses = false
) {
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

    if (debugLogResponses) {
      core.info(
        `Job status request response: ${formatResponseLog(response, errorText)}`
      );
    }

    if (errorRetryCount < 5) {
      newErrorRetryCount += 1;
      core.info(
        `Checking job status resulted in error: ${errorText}. Retrying #${newErrorRetryCount} ...`
      );

      return { finished: false, success: null, newErrorRetryCount };
    }

    core.error(`Could not check job status: ${errorText}`);
    throw new Error(errorText);
  }

  const data = await response.json();

  if (debugLogResponses) {
    core.info(
      `Job status request response: ${formatResponseLog(
        response,
        JSON.stringify(data)
      )}`
    );
  }

  let finished = false;

  if (data && data.job && data.job.time_end) {
    finished = true;
  }

  let success = false;

  if (finished) {
    core.info(`Job finished execution`);

    if (data.code !== 0) {
      core.error(`Job finished without success code: ${data.description}`);
      throw new Error(`Job finished withoud success code: ${data.description}`);
    } else {
      success = true;
    }
  }

  return { finished, success, newErrorRetryCount };
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
