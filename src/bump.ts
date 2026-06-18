import { Commit } from "./parse.js";

export type Bump = "major" | "minor" | "patch";

/** SemVer bump implied by a set of Conventional Commits: a breaking change →
 * major, any `feat` → minor, otherwise patch. */
export function recommendBump(commits: Commit[]): Bump {
  if (commits.some((c) => c.breaking)) return "major";
  if (commits.some((c) => c.type === "feat")) return "minor";
  return "patch";
}

const SEMVER = /^(v?)(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;

/** Apply a bump to a `MAJOR.MINOR.PATCH` (optionally `v`-prefixed) version,
 * dropping any pre-release/build metadata. Throws on a non-semver input. */
export function bumpVersion(version: string, bump: Bump): string {
  const m = SEMVER.exec(version.trim());
  if (!m) throw new Error(`not a semver version: "${version}"`);
  const [, prefix] = m;
  let [major, minor, patch] = [Number(m[2]), Number(m[3]), Number(m[4])];
  if (bump === "major") { major++; minor = 0; patch = 0; }
  else if (bump === "minor") { minor++; patch = 0; }
  else patch++;
  return `${prefix}${major}.${minor}.${patch}`;
}

/** The next version after `previous`, given the commits since it. */
export function nextVersion(previous: string, commits: Commit[]): string {
  return bumpVersion(previous, recommendBump(commits));
}
