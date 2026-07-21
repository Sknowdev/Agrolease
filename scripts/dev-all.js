#!/usr/bin/env node
/**
 * Starts the backend (Fastify, /backend) and the Expo web dev server
 * together, from one command, with clearly prefixed output.
 *
 * Why this exists: in this Codespace, NOTHING survives a restart - no
 * process supervisor, no auto-start. Every restart previously meant
 * running two separate commands (`npm run backend:dev` in one
 * terminal, `npx expo start --web` in another) before the app worked
 * again - easy to forget one, and the resulting failure (a 401/CORS/
 * ERR_FAILED error from a missing backend) looks like an app bug
 * rather than "the backend just isn't running yet." One command here
 * removes that ambiguity - if this script is running, both are
 * running.
 *
 * Plain Node child_process only - no new dependency (e.g.
 * `concurrently`) added just for this, matching this repo's existing
 * preference for minimal tooling (see metro.config.js's own plain-
 * `http` proxy for the same reason).
 *
 * Usage: `npm run dev` from the repo root (see package.json).
 * Ctrl+C stops both processes together.
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT, 'backend');

const children = [];

function run(name, command, args, cwd, color) {
  const child = spawn(command, args, { cwd, shell: false, env: process.env });
  children.push(child);

  const prefix = `\x1b[${color}m[${name}]\x1b[0m `;

  function pipe(stream, out) {
    stream.on('data', (chunk) => {
      const text = chunk.toString();
      const lines = text.split('\n').filter((line, idx, arr) => !(idx === arr.length - 1 && line === ''));
      for (const line of lines) {
        out.write(prefix + line + '\n');
      }
    });
  }

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code, signal) => {
    process.stdout.write(`${prefix}exited (code=${code}, signal=${signal})\n`);
  });

  return child;
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.stdout.write('Starting backend (port ' + (process.env.BACKEND_PORT || '4055') + ') and Expo web...\n');

run('backend', 'node', ['src/server.js'], BACKEND_DIR, '36'); // cyan
run('expo', 'npx', ['expo', 'start', '--web'], ROOT, '35'); // magenta
