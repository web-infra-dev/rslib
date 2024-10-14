#!/usr/bin/env zx

import fs from 'node:fs/promises';
import path from 'node:path';
import { $, chalk } from 'zx';

// Exit when error
$.verbose = false;

const args = process.argv.slice(2);
const bumpTypeArgs = args.find((arg) => arg.startsWith('--type='));

async function getCurrentVersion() {
  const packageJsonPath = path.join(
    process.cwd(),
    'packages/core/package.json',
  );
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

async function getNextVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  switch (type) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      throw new Error('Invalid version type');
  }
}

async function generateChangesetFile(bumpType, nextVersion) {
  const changesetDir = path.join(process.cwd(), '.changeset');
  const timestamp = Date.now();
  const filename = `${timestamp}-${bumpType}-release.md`;
  const content = `---
"@rslib/core": ${bumpType}
---

Release version ${nextVersion}
`;

  await fs.mkdir(changesetDir, { recursive: true });
  await fs.writeFile(path.join(changesetDir, filename), content);

  console.log(chalk.blue(`Generated changeset file: ${filename}`));
}

async function main() {
  try {
    // 1. Read the current version
    const currentVersion = await getCurrentVersion();
    console.log(chalk.blue(`Current version: ${currentVersion}`));

    // 2. Determine bump type
    const bumpType = bumpTypeArgs ? bumpTypeArgs.split('=')[1] : 'patch';

    if (!['major', 'minor', 'patch'].includes(bumpType)) {
      console.error('Invalid bump type. Please select major, minor, or patch.');
      process.exit(1);
    }

    const nextVersion = await getNextVersion(currentVersion, bumpType);
    const branchName = `release-v${nextVersion}`;

    console.log(chalk.blue(`Creating branch: ${branchName}`));

    // 3. Create and switch to new branch
    await $`git checkout -b ${branchName}`;

    // 4. Generate changeset file
    await generateChangesetFile(bumpType, nextVersion);

    // 5. Run changeset version and pnpm install
    await $`pnpm run changeset version`;
    await $`pnpm install --ignore-scripts`;

    // 6. Commit changes
    await $`git add .`;
    await $`git commit -m "Release v${nextVersion}"`;

    // 7. Push to remote repo
    await $`git push -u origin ${branchName}`;

    console.log(chalk.green(`Successfully created and pushed ${branchName}`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main();
