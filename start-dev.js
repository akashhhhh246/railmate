const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '🚆 Starting RailMate Services...');
console.log('\x1b[32m%s\x1b[0m', '• Frontend Web App on http://localhost:2263');
console.log('\x1b[32m%s\x1b[0m', '• Backend API on http://localhost:2264');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const backend = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Stopping RailMate processes...');
  if (backend) backend.kill();
  if (frontend) frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
