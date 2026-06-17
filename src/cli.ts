#!/usr/bin/env node
// Pipe git log in:
//   git log --pretty='%h%x09%an%x09%s' v1.0.0..HEAD \
//     | commits-to-notes v1.1.0 https://github.com/you/repo v1.0.0
import { parseLog } from "./parse.js";
import { renderNotes } from "./render.js";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  const [version, repoUrl, previousVersion] = process.argv.slice(2);
  const date = new Date().toISOString().slice(0, 10);
  process.stdout.write(renderNotes(parseLog(input), { version, date, repoUrl, previousVersion }));
});
