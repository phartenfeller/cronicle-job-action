const pause = (seconds) =>
  new Promise((resolve) => {
    if (typeof seconds !== 'number') {
      throw new Error('seconds not a number');
    }
    setTimeout(() => resolve('done!'), seconds * 1000);
  });

module.exports = pause;
