import { describe, it, expect } from "vitest";
import { recommendBump, bumpVersion, nextVersion } from "./bump";
import { parseLog, parseCommit } from "./parse";
import { run } from "./cli";

describe("recommendBump", () => {
  it("major on a breaking change, minor on feat, else patch", () => {
    expect(recommendBump(parseLog("feat!: drop node 14\nfix: x"))).toBe("major");
    expect(recommendBump(parseLog("feat: add thing\nfix: y"))).toBe("minor");
    expect(recommendBump(parseLog("fix: a\nchore: b\ndocs: c"))).toBe("patch");
    // a BREAKING CHANGE footer (multi-line) is detected through parseCommit
    expect(recommendBump([parseCommit("refactor: x\n\nBREAKING CHANGE: y")!])).toBe("major");
  });
});

describe("bumpVersion", () => {
  it("increments the right field and resets lower ones", () => {
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
    expect(bumpVersion("1.2.3", "minor")).toBe("1.3.0");
    expect(bumpVersion("1.2.3", "patch")).toBe("1.2.4");
  });
  it("preserves a v prefix and drops pre-release metadata", () => {
    expect(bumpVersion("v1.2.3", "minor")).toBe("v1.3.0");
    expect(bumpVersion("v1.2.3-rc.1", "patch")).toBe("v1.2.4");
  });
  it("throws on a non-semver input", () => {
    expect(() => bumpVersion("1.2", "patch")).toThrow();
  });
});

describe("nextVersion", () => {
  it("combines the recommended bump with the previous version", () => {
    expect(nextVersion("v1.4.2", parseLog("feat: new"))).toBe("v1.5.0");
    expect(nextVersion("v1.4.2", parseLog("feat!: break"))).toBe("v2.0.0");
  });
});

describe("cli run()", () => {
  const log = "h1\tAda\tfeat: add x\nh2\tGrace\tfix: y";

  it("--bump prints the bump", () => {
    expect(run(["--bump"], log, "2026-06-04")).toEqual({ code: 0, output: "minor" });
  });
  it("--next prints the next version (and errors without a previous)", () => {
    expect(run(["--next", "v1.0.0"], log, "2026-06-04").output).toBe("v1.1.0");
    expect(run(["--next"], log, "2026-06-04").code).toBe(2);
  });
  it("`auto` version is computed from the commits", () => {
    const md = run(["auto", "https://github.com/u/r", "v1.0.0"], log, "2026-06-04").output;
    expect(md).toContain("## v1.1.0 (2026-06-04)");
  });
  it("--help exits 0", () => {
    expect(run(["--help"], "", "2026-06-04").code).toBe(0);
  });
});
