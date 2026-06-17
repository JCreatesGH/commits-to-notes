# commits-to-notes

[![CI](https://github.com/JCreatesGH/commits-to-notes/actions/workflows/ci.yml/badge.svg)](https://github.com/JCreatesGH/commits-to-notes/actions)
[![TypeScript](https://img.shields.io/badge/types-included-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Turn [Conventional Commits](https://www.conventionalcommits.org) into polished, grouped **release notes** — with breaking changes surfaced first, PR/commit links, and deduplicated contributor credits.

![screenshot](assets/screenshot.png)

## Install

```bash
npm install commits-to-notes
```

## Use it (CLI)

```bash
git log --pretty='%h%x09%an%x09%s' v1.0.0..HEAD \
  | npx commits-to-notes v1.1.0 https://github.com/you/repo v1.0.0 > NOTES.md
#                                  └ version  └ repo (links)      └ prev tag (compare link)
```

## Use it (library)

```ts
import { parseLog, renderNotes } from "commits-to-notes";

const md = renderNotes(parseLog(gitLog), {
  version: "v1.2.0",
  date: "2026-06-04",
  repoUrl: "https://github.com/you/repo",
  previousVersion: "v1.1.0",   // adds a "Full Changelog" compare link
});
```

## What it does

- **Parses** `type(scope)!: subject (#pr)` plus `BREAKING CHANGE:` footers; reads `hash` and `author` from a tab-separated `git log`.
- **Groups** into Features / Fixes / Performance / Refactors / Docs / Styles / Tests / Build / CI / Reverts / Chores, with **breaking changes pulled to the top**. Unrecognized types land in an **Other Changes** section, so nothing is ever silently dropped.
- **Links** to PRs and commits when you pass a `repoUrl`, and adds a GitHub **Full Changelog** compare link when you also pass `previousVersion`.
- **Credits** every unique contributor, sorted.
- **Ignores** non-conventional lines (merges, WIP without a type), so the output stays clean.

## Development

```bash
npm install && npm test    # 9 tests
npm run build              # tsc, clean
```

## License

MIT
