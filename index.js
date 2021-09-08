const core = require('@actions/core');
const runCronicleJob = require('./src/runCronicleJob');

// most @actions toolkit packages have async methods
async function run() {
  try {
    // don't log - could be sensitive
    const cronicleHost = core.getInput('cronicle_host').replace(/\/$/, '');
    const eventId = core.getInput('event_id');
    const apiKey = core.getInput('api_key');
    const outputLog = core.getBooleanInput('output_log');

    const fetchInterval =
      parseInt(core.getInput('result_fetch_interval')) || 10;
    core.info(`Fetch interval: ${fetchInterval} seconds`);

    const maxFetchRetries = parseInt(core.getInput('max_fetch_retries')) || 100;
    core.info(`Max fetch retries: ${maxFetchRetries}`);

    const failRegex = core.getInput('fail_on_regex_match');
    if (failRegex) {
      core.info(`Will fail if regex "${fetchInterval}" found in output log`);
    }

    let parameters = core.getInput('parameter_object');
    if (parameters) {
      try {
        parameters = JSON.parse(parameters);
      } catch (err) {
        core.setFailed(`Error parsing parameters: ${err.message}`);
      }
    }

    await runCronicleJob({
      cronicleHost,
      eventId,
      apiKey,
      fetchInterval,
      maxFetchRetries,
      failRegex,
      outputLog,
      parameters,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
