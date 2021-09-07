const core = require('@actions/core');
const { startJob, checkJobStatus, getJobLog } = require('./src/cronicleApi');
const pause = require('./src/pause');

let jobDone = false;
let retryCount = 0;
let jobSuccess = false;

// most @actions toolkit packages have async methods
async function run() {
  try {
    // don't log - could be sensitive
    const cronicleHost = core.getInput('cronicle_host');
    const jobId = core.getInput('job_id');
    const apiKey = core.getInput('api_key');

    const fetchInterval =
      parseInt(core.getInput('result_fetch_interval')) || 10;
    core.info(`Fetch interval: ${fetchInterval} seconds`);

    const maxFetchRetries = parseInt(core.getInput('max_fetch_retries')) || 100;
    core.info(`Max fetch retries: ${maxFetchRetries}`);

    const failRegex = core.getInput('fail_on_regex_match');
    if (failRegex) {
      core.info(`Will fail if regex "${fetchInterval}" found in output log`);
    }

    const taskId = await startJob(cronicleHost, jobId, apiKey);
    core.info(`Job started`);
    core.debug(`Task ID returned from API "${taskId}"`);

    while (!jobDone && retryCount <= maxFetchRetries) {
      retryCount += 1;
      core.debug(`Check job done #${retryCount}`);
      // eslint-disable-next-line no-await-in-loop
      await pause(fetchInterval);

      // eslint-disable-next-line no-await-in-loop
      const { finished, success } = await checkJobStatus(
        cronicleHost,
        taskId,
        apiKey
      );
      jobDone = finished;
      jobSuccess = success;
    }
    core.info(`Job finished execution`);

    const log = await getJobLog(cronicleHost, taskId);
    core.setOutput('log', log);

    if (!failRegex) {
      core.info(`Job success => ${jobSuccess}`);
      core.setFailed(jobSuccess);
    } else {
      const success = log.match(new RegExp(failRegex)) === null;
      core.setFailed(success);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
