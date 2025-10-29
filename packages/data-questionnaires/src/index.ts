import path from 'path';
import fs from 'fs';

export function getMonorepoRoot(cwd: string = process.cwd()): string {
  // ascend until we find pnpm-workspace.yaml
  let dir = cwd;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return cwd;
}

export function getQuestionnairesRoot(): string {
  const root = getMonorepoRoot();
  return path.join(root, 'data', 'questionnaires', 'extracted');
}

