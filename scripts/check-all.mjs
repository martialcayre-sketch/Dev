#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(cmd, opts = {}) {
  const label = opts.label || cmd;
  console.log(`\n▶ ${label}`);
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', shell: '/bin/bash' });
    process.stdout.write(out);
    return 0;
  } catch (e) {
    console.error(`✖ ${label} failed`);
    if (e.stdout) process.stdout.write(e.stdout);
    if (e.stderr) process.stderr.write(e.stderr);
    return e.status || 1;
  }
}

let exit = 0;

exit |= run('node -v && pnpm -v && firebase --version && gh --version && corepack --version', {
  label: 'Toolchain versions',
});
exit |= run('./.devcontainer/docker-healthcheck.sh', { label: 'Devcontainer healthcheck' });
exit |= run('pnpm -w run lint -c', { label: 'Lint (workspace)' });
exit |= run('pnpm -w run typecheck -c', { label: 'Typecheck (workspace)' });
exit |= run('pnpm -C functions run build', { label: 'Build Cloud Functions' });
exit |= run('pnpm -C apps/patient-vite run build', { label: 'Build Patient App' });
exit |= run('pnpm -C apps/practitioner-vite run build', { label: 'Build Practitioner App' });

console.log(`\nDone with exit code ${exit}.`);
process.exit(exit);
