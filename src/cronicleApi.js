const fetch = require('node-fetch');
const core = require('@actions/core');

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

async function startJob(hostname, jobId, apiKey) {
  const payload = {
    id: jobId,
    api_key: apiKey,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch(`${hostname}/api/app/run_event/v1`, options);
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

async function checkJobStatus(hostname, taskId, apiKey) {
  const payload = {
    id: taskId,
    api_key: apiKey,
  };

  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch(
    `${hostname}/api/app/get_job_status/v1`,
    options
  );
  try {
    checkStatus(response);
  } catch (error) {
    const errorBody = await error.response.text();
    core.error(`Could not check job status: ${errorBody}`);
    throw new Error(errorBody);
  }
  const data = await response.json();

  if (data.code !== 0) {
    core.error(`Error from API: ${data.description}`);
    throw new Error(`Error from API: ${data.description}`);
  }

  return { finished: data.job.complete === 1, success: data.job.code === 0 };
}

async function getJobLog(hostname, taskId) {
  const options = {
    method: 'GET',
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

  return data;
}

module.exports = { startJob, checkJobStatus, getJobLog };
