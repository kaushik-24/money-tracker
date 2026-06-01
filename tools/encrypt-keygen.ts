#!/usr/bin/env npx tsx
import crypto from "node:crypto";

const key = crypto.randomBytes(32).toString("hex");
console.log("Generated ENCRYPTION_KEY (64 hex chars):");
console.log(key);
console.log("\nAdd this to your .env file as:");
console.log(`ENCRYPTION_KEY=${key}`);
