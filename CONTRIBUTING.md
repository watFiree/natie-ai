# Contributing to Natie AI

Thanks for your interest in contributing.

This repository currently follows a **PR-based workflow** with **`main` as the default branch** and **squash merge** enabled on GitHub.

## Code of Conduct

By participating in this project, you agree to follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Ways to contribute

- Report bugs
- Request features
- Improve docs
- Submit code improvements and fixes

## Report bugs

Use [GitHub Issues](https://github.com/watFiree/natie-ai/issues) and include:

- Clear summary and expected behavior
- Steps to reproduce
- Environment details (OS, Node.js version, browser if relevant)
- Logs/screenshots if helpful

## Request features

Open a GitHub issue with:

- The problem to solve
- Proposed behavior or UX
- Any constraints or alternatives considered

## Branching and pull requests

1. Start from the latest `main`.
2. Create a feature branch (examples):
   - `feature/<short-description>`
   - `fix/<short-description>`
   - `docs/<short-description>`
3. Make focused changes and keep PRs small when possible.
4. Run local checks (see below).
5. Push your branch and open a PR targeting `main`.
6. Address review feedback.
7. PRs are merged with **squash merge**.

## Commit message expectations

Use short, descriptive, imperative messages.

Good examples:

- `Add Telegram security notes to docs`
- `Fix X account validation in setup form`
- `Update README with API usage examples`

Including issue/PR references is encouraged when available (for example, `(#123)`).

## Local setup

```bash
pnpm install
```

## Local checks before opening a PR

Run from repo root:

```bash
pnpm build
pnpm lint
pnpm test
pnpm format:check
```

Useful app-specific commands:

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api dev
pnpm --filter web dev
```

## CI expectations

At the time of writing, this repository does **not** include GitHub Actions workflow files under `.github/workflows`.
Because of that, contributors are expected to run the local checks above before requesting review.

If CI is added later, required checks in branch protection take precedence.

## Code style

- TypeScript-first codebase (web and API)
- Follow existing patterns in each app/module
- Keep changes scoped and readable
- Prefer existing utilities over introducing duplicate logic
- Run formatting and lint checks before opening a PR

## Documentation updates

If your change modifies behavior, endpoints, scripts, or configuration, update related docs in the same PR (especially `README.md`).
