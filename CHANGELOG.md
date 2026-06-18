# Changelog

All notable changes are documented here, following
[Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [0.2.0]

### Added
- **SemVer bump recommendation**: `recommendBump` (breaking → major, feat →
  minor, else patch), `bumpVersion` (preserves a `v` prefix, drops pre-release
  metadata), and `nextVersion`.
- CLI modes `--bump`, `--next <prev>`, and an `auto` version that fills itself in
  from the commits. The CLI core is now a pure, unit-tested `run()`.

## [0.1.0]

### Added
- Turn Conventional Commits into grouped, linked release notes — breaking
  changes first, PR/commit links, deduplicated contributor credits, and an
  "Other Changes" catch-all so nothing is dropped.
