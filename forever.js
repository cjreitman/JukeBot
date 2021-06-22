const forever = require('forever-monitor');

const child = new (forever.Monitor)('index.js', {
  silent: true,
  args: [],
});

child.start();
