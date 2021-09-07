const core = require('@actions/core');
const { startEvent, checkJobStatus, getJobLog } = require('./cronicleApi');
const pause = require('./pause');

let jobDone = false;
let retryCount = 0;
let jobSuccess = false;

async function runCronicleJob({
  cronicleHost,
  eventId,
  apiKey,
  fetchInterval,
  maxFetchRetries,
  failRegex,
}) {
  const taskId = await startEvent(cronicleHost, eventId, apiKey);
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
    core.setFailed(!jobSuccess);
  } else {
    const success = log.match(new RegExp(failRegex)) === null;
    core.setFailed(success);
  }
}

module.exports = runCronicleJob;
