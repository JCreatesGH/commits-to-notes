#!/usr/bin/env node
// Pipe a git log in:
//   git log --pretty='%h%x09%an%x09%s' v1.0.0..HEAD | commits-to-notes v1.1.0 https://github.com/you/repo v1.0.0
import { parseLog } from "./parse.js";
import { renderNotes } from "./render.js";
import { recommendBump, nextVersion } from "./bump.js";

const HELP = `commits-to-notes — Conventional Commits → release notes

Usage (pipe a git log on stdin):
  git log --pretty='%h%x09%an%x09%s' v1.0.0..HEAD | commits-to-notes [version] [repoUrl] [prevVersion]

  commits-to-notes v1.1.0 https://github.com/u/r v1.0.0   # release notes
  commits-to-notes auto    https://github.com/u/r v1.0.0   # version auto-bumped from the commits
  commits-to-notes --bump                                  # print just the bump: major|minor|patch
  commits-to-notes --next v1.0.0                           # print just the next version

  -h, --help   show this help`;

/** Pure core: given argv and the piped git log, return an exit code + output. */
export function run(args: string[], stdin: string, today: string): { code: number; output: string } {
  if (args.includes("-h") || args.includes("--help")) return { code: 0, output: HELP };

  const commits = parseLog(stdin);

  if (args[0] === "--bump") return { code: 0, output: recommendBump(commits) };

  if (args[0] === "--next") {
    if (!args[1]) return { code: 2, output: "Error: --next needs a previous version, e.g. --next v1.1.0" };
    try {
      return { code: 0, output: nextVersion(args[1], commits) };
    } catch (e) {
      return { code: 2, output: `Error: ${(e as Error).message}` };
    }
  }

  let [version, repoUrl, previousVersion] = args;
  if (version === "auto") {
    if (!previousVersion) {
      return { code: 2, output: "Error: `auto` needs a previous version as the third argument, e.g. `auto <repoUrl> v1.0.0`" };
    }
    try {
      version = nextVersion(previousVersion, commits);
    } catch (e) {
      return { code: 2, output: `Error: ${(e as Error).message}` };
    }
  }
  return { code: 0, output: renderNotes(commits, { version, date: today, repoUrl, previousVersion }) };
}

// Execute only as the CLI binary (not when imported by tests).
if (process.argv[1] && /cli\.js$/.test(process.argv[1])) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (input += d));
  process.stdin.on("end", () => {
    const { code, output } = run(process.argv.slice(2), input, new Date().toISOString().slice(0, 10));
    (code === 0 ? process.stdout : process.stderr).write(output.endsWith("\n") ? output : output + "\n");
    process.exit(code);
  });
}
