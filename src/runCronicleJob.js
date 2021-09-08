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
  outputLog = true,
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

  if (outputLog) {
    core.info('======== Job Output ========');
    const rows = log.split('\n');
    for (let i = 0; i < rows.length; i += 1) {
      core.info(rows[i]);
    }
  }

  if (!failRegex) {
    core.info(`Job success => ${jobSuccess}`);
    if (!jobSuccess) {
      core.setFailed(`Cronicle job finished with error`);
    }
  } else {
    const success = log.match(new RegExp(failRegex, 'gm')) === null;
    if (!success) {
      core.setFailed(`Regex "${failRegex}" did match.`);
    }
  }
}

module.exports = runCronicleJob;
