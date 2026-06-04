import { describe, it, expect } from "vitest";
import { parseCommit, parseLog } from "./parse";
import { renderNotes } from "./render";

describe("parseCommit", () => {
  it("parses type, scope, subject, PR", () => {
    const c = parseCommit("feat(api): add pagination (#42)")!;
    expect(c.type).toBe("feat");
    expect(c.scope).toBe("api");
    expect(c.subject).toBe("add pagination");
    expect(c.pr).toBe(42);
    expect(c.breaking).toBe(false);
  });

  it("detects breaking via ! and footer", () => {
    expect(parseCommit("feat!: drop node 14")!.breaking).toBe(true);
    expect(parseCommit("refactor: x\n\nBREAKING CHANGE: y")!.breaking).toBe(true);
  });

  it("reads hash and author from tab-separated log", () => {
    const c = parseCommit("a1b2c3d4\tAda\tfix: null guard")!;
    expect(c.hash).toBe("a1b2c3d");
    expect(c.author).toBe("Ada");
    expect(c.type).toBe("fix");
  });

  it("ignores non-conventional lines", () => {
    expect(parseCommit("merge branch main")).toBeNull();
  });
});

describe("renderNotes", () => {
  const log = [
    "h1\tAda\tfeat(api): add pagination (#42)",
    "h2\tGrace\tfix(ui): button focus ring",
    "h3\tAda\tfeat!: new auth flow",
    "h4\tLinus\tchore: bump deps",
    "garbage line",
  ].join("\n");

  it("groups by type with sections and links", () => {
    const md = renderNotes(parseLog(log), { version: "v1.2.0", date: "2026-06-04",
      repoUrl: "https://github.com/u/r" });
    expect(md).toContain("## v1.2.0 (2026-06-04)");
    expect(md).toContain("### ⚠️ BREAKING CHANGES");
    expect(md).toContain("### 🚀 Features");
    expect(md).toContain("**api:** add pagination ([#42](https://github.com/u/r/pull/42))");
    expect(md.indexOf("BREAKING")).toBeLessThan(md.indexOf("🚀 Features")); // breaking first
  });

  it("lists unique contributors sorted", () => {
    const md = renderNotes(parseLog(log));
    const section = md.slice(md.indexOf("Contributors"));
    expect(section).toContain("- Ada");
    expect(section).toContain("- Grace");
    expect(section).toContain("- Linus");
    // Ada appears once despite two commits
    expect((section.match(/- Ada/g) || []).length).toBe(1);
  });
});
