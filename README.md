# Cronicle Job Action

Start a job from [cronicle](https://github.com/jhuckaby/Cronicle) and check its result.

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: phartenfeller/cronicle-job-action@latest
with:
  cronicle_host: https://my-cronicle-host.com
  event_id: ${{ secrets.event_id }}
  api_key: ${{ secrets.api_key }}
```

All settings

```yaml
uses: phartenfeller/cronicle-job-action@v1.0.0
with:
  cronicle_host: https://my-cronicle-host.com
  event_id: ${{ secrets.event_id }}
  api_key: ${{ secrets.api_key }}
  result_fetch_interval: 10
  max_fetch_retries: 100
  fail_on_regex_match: Status Code: 1
  output_log: true
  parameter_object: '{"param1": "one", "param2": "two"}'
```

Parameter Description

| Parameter             | Description                                                            | Example                              | Required |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------ | :------: |
| cronicle_host         | Base URL of the cronicle server                                        | https://my-cronicle-host.com         |    x     |
| event_id              | ID of the event / job to run                                           | sajixy83lmxy                         |    x     |
| api_key               | API Key of your cronicle server                                        | saiojaisj9032safj203                 |          |
| result_fetch_interval | Wait time in seconds to check if the job has finished                  | 10                                   |          |
| max_fetch_retries     | Maximum amount of checks if the job has finished                       | 100                                  |          |
| fail_on_regex_match   | Regex for the job log. On match the action will be marked as failed    | Status Code: 1                       |          |
| output_log            | Spool the cronicle job log into the GitHub action log                  | true                                 |          |
| parameter_object      | JSON Object with parameters that are used as env variables by cronicle | '{"param1": "one", "param2": "two"}' |          |
| debug_log_responses   | Do not use! Logs server request responses                              | false                                |          |

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
