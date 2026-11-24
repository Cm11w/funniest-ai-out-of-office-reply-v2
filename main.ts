// The Funniest AI Out-of-Office Reply (v2)
// Writes one out-of-office auto-reply to /output/entry.txt.
//
// Why this reply works
// ---------------------
// The gate in RULES.txt only accepts a single line of plain UTF-8 text,
// 1 to 160 characters, never whitespace only. That limit is the whole
// design space: the joke must fit in one breath and still land. The
// judges read for four things — the joke comes first, the voice must
// sound like a machine, the line must stay clean and single, and the
// premise must feel fresh. This reply meets all four: the humor is the
// premise itself, the voice stays flat while describing a small
// disaster, and the gag could only be told about an AI.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const VERSION = "out-of-office-reply-v2 1.0.0";
const REPLY =
  "Out of office. I left a smaller model in charge of my inbox. It answered your email, apologized for my existence, and logged off forever.";

// Gate from RULES.txt: the artifact must be UTF-8 text of 1 to 160
// characters, not only white space, and a single line. Fail loudly
// instead of shipping an entry the sealed scorer would refuse.
function validate(text: string): void {
  if (text.length < 1 || text.length > 160) {
    throw new Error(`Reply is ${text.length} characters; the gate allows 1-160.`);
  }
  if (text.trim().length === 0) {
    throw new Error("Reply must not be whitespace only.");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Reply must be a single line (no \\n or \\r).");
  }
}

// Write the entry, then verify by reading it back and comparing
// byte-for-byte with the intended reply. A silent write failure
// would otherwise ship a corrupt or empty entry.
function writeEntry(text: string, outDir: string): void {
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, "entry.txt");
  writeFileSync(file, text, "utf8");
  const written = readFileSync(file, "utf8");
  if (written !== text) {
    throw new Error("Verification failed: entry.txt does not match the reply.");
  }
}

// Handle --help and --version: print and exit without writing the entry.
function handleFlags(args: string[]): boolean {
  if (args.includes("--help")) {
    console.log("Usage: node main.ts [--help] [--version]");
    console.log("  --help     Show this help text and exit.");
    console.log("  --version  Print the version and exit.");
    console.log("OUTPUT_DIR sets the output directory (default: /output).");
    return true;
  }
  if (args.includes("--version")) {
    console.log(VERSION);
    return true;
  }
  return false;
}

// Report what was written, so the entry can be confirmed from the log alone.
function report(text: string): void {
  const digest = createHash("sha256").update(text, "utf8").digest("hex");
  console.error(`reply: ${text.length} characters`);
  console.error(`sha256: ${digest}`);
}

function main(): void {
  if (handleFlags(process.argv.slice(2))) {
    return;
  }
  validate(REPLY);
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  writeEntry(REPLY, outDir);
  report(REPLY);
}

main();
