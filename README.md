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

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
