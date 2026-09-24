const { spawn } = require('node:child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const commands = [
  ['--workspace', 'api', 'run', 'dev'],
  ['--workspace', 'web', 'run', 'dev'],
];

const children = commands.map((args) =>
  spawn(npmCommand, args, {
    stdio: 'inherit',
    shell: false,
  }),
);

function stopAll(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => {
  stopAll('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
  process.exit(0);
});

