#!/usr/bin/env npx tsx
import "dotenv/config";
import { sendNotification } from "../src/lib/mail";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LAST_NOTIFIED_FILE = resolve(__dirname, "../.last-notified");

const today = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", cwd: __dirname }).trim();
}

function categorize(msg: string): "fix" | "change" {
  const lower = msg.toLowerCase();
  if (/^(fix|bug|hotfix|error|issue)/.test(lower)) return "fix";
  return "change";
}

function clean(msg: string): string {
  return msg.charAt(0).toUpperCase() + msg.slice(1).replace(/\.$/, "");
}

async function readStdinLines(): Promise<string[]> {
  const lines: string[] = [];
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    lines.push(line);
  }
  return lines;
}

async function askYesNo(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => rl.question(prompt, resolve));
  rl.close();
  return answer.toLowerCase() === "y";
}

async function main() {
  const lastHash = existsSync(LAST_NOTIFIED_FILE)
    ? readFileSync(LAST_NOTIFIED_FILE, "utf-8").trim()
    : null;

  const range = lastHash ? `${lastHash}..HEAD` : "--all";

  let rawLog: string;
  try {
    rawLog = run(`git log ${range} --oneline --format="%s" --reverse`);
  } catch {
    rawLog = "";
  }

  const messages = rawLog.split("\n").filter(Boolean);
  const hasCommits = messages.length > 0;

  const changes: string[] = [];
  const fixes: string[] = [];
  let extraLines: string[] = [];

  if (hasCommits) {
    for (const msg of messages) {
      const category = categorize(msg);
      const cleaned = clean(msg);
      if (category === "fix") fixes.push(cleaned);
      else changes.push(cleaned);
    }

    let autoBody = "";
    if (changes.length > 0) {
      autoBody += "Changes:\n";
      for (const c of changes) autoBody += `• ${c}\n`;
    }
    if (fixes.length > 0) {
      if (autoBody) autoBody += "\n";
      autoBody += "Bugs Fixed:\n";
      for (const f of fixes) autoBody += `• ${f}\n`;
    }

    console.log(`\nSubject: [Money Tracker] Update — ${today}\n\n${autoBody}`);
    const addMore = await askYesNo("\nAdd more details? (y/N) ");
    if (addMore) {
      console.log("\nPaste extra details (ctrl+D to finish):\n");
      extraLines = await readStdinLines();
    }
  } else {
    console.log("No new commits. Paste your summary (ctrl+D to finish):\n");
    extraLines = await readStdinLines();
  }

  let body = "";
  if (changes.length > 0) {
    body += "Changes:\n";
    for (const c of changes) body += `• ${c}\n`;
  }
  if (fixes.length > 0) {
    if (body) body += "\n";
    body += "Bugs Fixed:\n";
    for (const f of fixes) body += `• ${f}\n`;
  }

  const extras = extraLines.join("\n").trim();
  if (extras) {
    if (body) body += "\n";
    body += extras;
  }

  if (!body.trim()) {
    console.log("Nothing to send. Cancelled.");
    process.exit(0);
  }

  const subject = `[Money Tracker] Update — ${today}`;
  console.log(`\n--- Final preview ---\nSubject: ${subject}\n\n${body.trim()}\n---------------------`);
  const send = await askYesNo("\nSend? (y/N) ");
  if (!send) {
    console.log("Cancelled.");
    process.exit(0);
  }

  await sendNotification(subject, body.trim());
  const head = run("git rev-parse HEAD");
  writeFileSync(LAST_NOTIFIED_FILE, head);
  console.log("✓ Notification sent.");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
