#!/usr/bin/env npx tsx
import { execSync } from "node:child_process";

console.log("Running Prisma migrations...");
try {
  execSync("npx prisma migrate dev --name init", {
    stdio: "inherit",
    cwd: process.cwd(),
  });
  console.log("Database setup complete.");
} catch {
  console.error("Migration failed. Check your DATABASE_URL in .env");
  process.exit(1);
}
