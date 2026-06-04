import { Commit } from "./parse.js";

const SECTIONS: Array<[string, string]> = [
  ["feat", "🚀 Features"],
  ["fix", "🐛 Bug Fixes"],
  ["perf", "⚡ Performance"],
  ["refactor", "♻️ Refactors"],
  ["docs", "📝 Documentation"],
  ["test", "✅ Tests"],
  ["build", "📦 Build"],
  ["ci", "🤖 CI"],
  ["chore", "🧹 Chores"],
];

export interface NotesOptions {
  version?: string;
  date?: string;
  repoUrl?: string;       // e.g. https://github.com/u/r  (enables PR/commit links)
}

function link(c: Commit, repoUrl?: string): string {
  if (c.pr && repoUrl) return ` ([#${c.pr}](${repoUrl}/pull/${c.pr}))`;
  if (c.hash && repoUrl) return ` ([${c.hash}](${repoUrl}/commit/${c.hash}))`;
  if (c.pr) return ` (#${c.pr})`;
  return "";
}

function line(c: Commit, repoUrl?: string): string {
  const scope = c.scope ? `**${c.scope}:** ` : "";
  return `- ${scope}${c.subject}${link(c, repoUrl)}`;
}

export function renderNotes(commits: Commit[], opts: NotesOptions = {}): string {
  const out: string[] = [];
  const header = opts.version ? `## ${opts.version}` : "## Release notes";
  out.push(opts.date ? `${header} (${opts.date})` : header, "");

  const breaking = commits.filter((c) => c.breaking);
  if (breaking.length) {
    out.push("### ⚠️ BREAKING CHANGES", "");
    for (const c of breaking) out.push(line(c, opts.repoUrl));
    out.push("");
  }

  for (const [type, title] of SECTIONS) {
    const group = commits.filter((c) => c.type === type);
    if (!group.length) continue;
    out.push(`### ${title}`, "");
    for (const c of group) out.push(line(c, opts.repoUrl));
    out.push("");
  }

  const contributors = [...new Set(commits.map((c) => c.author).filter(Boolean))] as string[];
  if (contributors.length) {
    out.push("### 👥 Contributors", "",
      contributors.sort().map((a) => `- ${a}`).join("\n"), "");
  }
  return out.join("\n").trim() + "\n";
}
