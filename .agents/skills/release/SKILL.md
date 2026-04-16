---
name: release
description: Use when asked to release Rslib for a specific version.
metadata:
  internal: true
---

# Release

## Input

- Target version, for example `0.21.3`

If the version is missing, ask for it before making changes.

## Steps

1. Check the worktree with `git status --short`. If there are uncommitted edits, stop and ask the user how to proceed.
2. Update only the `version` field in these files to the target version:
   - `packages/core/package.json`
   - `packages/plugin-dts/package.json`
   - `packages/create-rslib/package.json`
3. Create and switch to branch `release/v<version>`. If the branch already exists, stop and ask the user how to proceed.
4. Review the diff and confirm the change is limited to the three version bumps.
5. Create a commit with this exact message: `release: v<version>`
6. Push the branch, then create a GitHub PR with `gh pr create`. Use the same text for the PR title as the commit message: `release: v<version>`
7. If `.github/PULL_REQUEST_TEMPLATE.md` exists, keep its structure. Fill it with:
   - `Summary`: `Release @rslib/core, rsbuild-plugin-dts, and create-rslib <version>.`
   - `Related Links`: `https://github.com/web-infra-dev/rslib/releases/tag/v<version>`

## Notes

- Do not modify unrelated dependency ranges such as `workspace:*` entries or the `rslib` npm alias in devDependencies.
