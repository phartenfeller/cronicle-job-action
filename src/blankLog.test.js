const blankLog = require('./blankLog');

test('log is blanked', async () => {
  const log = `
# Job ID: ID123
# Event Title: Title123
# Hostname: Host123
# Date/Time: 2021/09/07 19:24:36 (GMT+2)

1234

# Job completed successfully at 2021/09/07 19:24:36 (GMT+2).
# End of log.
`;
  const blanked = blankLog(log);

  const match1 = blanked.match(/ID123/gm) === null;
  const match2 = blanked.match(/Title123/gm) === null;
  const match3 = blanked.match(/Host123/gm) === null;
  const match4 = blanked.match(/Job completed successfully/gm) !== null;

  expect(match1).toBe(true);
  expect(match2).toBe(true);
  expect(match3).toBe(true);
  expect(match4).toBe(true);
});
