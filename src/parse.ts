// Parse Conventional Commits. Input lines look like:
//   <hash>\t<author>\t<subject>
// or just <subject>. Subjects follow `type(scope)!: description`.
export interface Commit {
  type: string;
  scope: string | null;
  breaking: boolean;
  subject: string;
  hash: string | null;
  author: string | null;
  pr: number | null;
}

const HEADER = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;

export function parseCommit(line: string): Commit | null {
  const parts = line.split("\t");
  let hash: string | null = null, author: string | null = null, message: string;
  if (parts.length >= 3) { [hash, author] = [parts[0], parts[1]]; message = parts.slice(2).join("\t"); }
  else message = line;
  message = message.trim();

  const firstLine = message.split("\n")[0];
  const m = HEADER.exec(firstLine);
  if (!m) return null;
  const [, type, scope, bang, rest] = m;

  const prMatch = rest.match(/\(#(\d+)\)\s*$/);
  const pr = prMatch ? parseInt(prMatch[1], 10) : null;
  const subject = rest.replace(/\s*\(#\d+\)\s*$/, "").trim();
  const breaking = !!bang || /BREAKING[ -]CHANGE/i.test(message);

  return { type: type.toLowerCase(), scope: scope ?? null, breaking, subject,
           hash: hash ? hash.slice(0, 7) : null, author, pr };
}

export function parseLog(text: string): Commit[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean)
    .map(parseCommit).filter((c): c is Commit => c !== null);
}
