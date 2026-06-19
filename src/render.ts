import { Commit } from "./parse.js";

const SECTIONS: Array<[string, string]> = [
  ["feat", "🚀 Features"],
  ["fix", "🐛 Bug Fixes"],
  ["perf", "⚡ Performance"],
  ["refactor", "♻️ Refactors"],
  ["docs", "📝 Documentation"],
  ["style", "💄 Styles"],
  ["test", "✅ Tests"],
  ["build", "📦 Build"],
  ["ci", "🤖 CI"],
  ["revert", "⏪ Reverts"],
  ["chore", "🧹 Chores"],
];

const KNOWN_TYPES = new Set(SECTIONS.map(([t]) => t));

export interface NotesOptions {
  version?: string;
  date?: string;
  repoUrl?: string;          // e.g. https://github.com/u/r  (enables PR/commit links)
  previousVersion?: string;  // enables a "Full Changelog" compare link (needs repoUrl + version)
  groupByScope?: boolean;    // within each section, cluster commits under their scope (monorepos)
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

/** Render a section's commits — flat, or (with `groupByScope`) clustered under each scope
 *  as a nested list, with scopeless commits as flat bullets after the scoped groups. */
function renderItems(group: Commit[], repoUrl: string | undefined, groupByScope: boolean): string[] {
  if (!groupByScope) return group.map((c) => line(c, repoUrl));
  const lines: string[] = [];
  const scopes = [...new Set(group.filter((c) => c.scope).map((c) => c.scope as string))].sort();
  for (const s of scopes) {
    lines.push(`- **${s}**`);
    for (const c of group.filter((c) => c.scope === s)) lines.push(`  - ${c.subject}${link(c, repoUrl)}`);
  }
  for (const c of group.filter((c) => !c.scope)) lines.push(`- ${c.subject}${link(c, repoUrl)}`);
  return lines;
}

export function renderNotes(commits: Commit[], opts: NotesOptions = {}): string {
  const out: string[] = [];
  const header = opts.version ? `## ${opts.version}` : "## Release notes";
  out.push(opts.date ? `${header} (${opts.date})` : header, "");

  const gbs = !!opts.groupByScope;

  const breaking = commits.filter((c) => c.breaking);
  if (breaking.length) {
    out.push("### ⚠️ BREAKING CHANGES", "");
    out.push(...renderItems(breaking, opts.repoUrl, gbs));
    out.push("");
  }

  for (const [type, title] of SECTIONS) {
    const group = commits.filter((c) => c.type === type);
    if (!group.length) continue;
    out.push(`### ${title}`, "");
    out.push(...renderItems(group, opts.repoUrl, gbs));
    out.push("");
  }

  // Catch-all so commits with an unrecognized type are never silently dropped.
  const other = commits.filter((c) => !KNOWN_TYPES.has(c.type));
  if (other.length) {
    out.push("### 📌 Other Changes", "");
    out.push(...renderItems(other, opts.repoUrl, gbs));
    out.push("");
  }

  const contributors = [...new Set(commits.map((c) => c.author).filter(Boolean))] as string[];
  if (contributors.length) {
    out.push("### 👥 Contributors", "",
      contributors.sort().map((a) => `- ${a}`).join("\n"), "");
  }

  if (opts.repoUrl && opts.previousVersion && opts.version) {
    out.push("",
      `**Full Changelog**: ${opts.repoUrl}/compare/${opts.previousVersion}...${opts.version}`);
  }

  return out.join("\n").trim() + "\n";
}
