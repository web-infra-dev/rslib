---
name: create-pr
description: Guides creating a pull request in the Rslib repository, covering branch naming conventions, commit message format, and how to write and open a PR. Use this skill when the user wants to create a PR or needs to know the conventions for branching and committing in Rslib.
---

# Create a Pull Request

Key conventions and steps for branching, committing, and opening a PR in the Rslib monorepo.

---

## Step 1 — Branch Naming

Always branch off an up-to-date `main`. Follow this naming convention:

| Type    | Pattern                     | Example                |
| ------- | --------------------------- | ---------------------- |
| Feature | `feat/<scope>-<short-desc>` | `feat/core-esm-output` |
| Bug fix | `fix/<scope>-<short-desc>`  | `fix/dts-bundle-path`  |
| Docs    | `docs/<short-desc>`         | `docs/migration-guide` |
| Chore   | `chore/<short-desc>`        | `chore/update-deps`    |
| Release | `release/v<version>`        | `release/v1.2.0`       |

---

## Step 2 — Commit Messages

Rslib uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Scopes** (match the package or area changed):

- `core` — `packages/core`
- `dts` — `packages/plugin-dts`
- `create-rslib` — `packages/create-rslib`
- `docs` — website / documentation
- `examples` — examples directory
- `deps` — dependency updates

Keep commits focused — one logical change per commit.

---

## Step 3 — Create a Pull Request

Analyze the changes in this branch and write with following template in `.github/PULL_REQUEST_TEMPLATE.md`. The PR should include a detailed description that explains:

- What changes were made
- Why they were made
- Related issues or links
- Any important implementation details

Open the PR with GitHub CLI, the title must follow Conventional Commits format. For a draft PR, add `--draft`.
