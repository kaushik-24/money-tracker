#!/usr/bin/env npx tsx
import prompts from "prompts";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { encrypt } from "../src/lib/encryption.js";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] || "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Account name:",
      validate: (v: string) => v.length > 0 || "Name is required",
    },
    {
      type: "select",
      name: "type",
      message: "Account type:",
      choices: [
        { title: "Checking", value: "checking" },
        { title: "Savings", value: "savings" },
        { title: "Credit Card", value: "credit" },
        { title: "Investment", value: "investment" },
        { title: "Cash", value: "cash" },
      ],
    },
    {
      type: "number",
      name: "balance",
      message: "Current balance:",
      initial: 0,
      float: true,
    },
    {
      type: "text",
      name: "currency",
      message: "Currency (ISO 4217):",
      initial: "USD",
    },
    {
      type: "text",
      name: "color",
      message: "Color (hex):",
      initial: "#6366f1",
    },
  ]);

  const encryptedBalance = encrypt(response.balance.toString());

  const account = await prisma.account.create({
    data: {
      name: response.name,
      type: response.type,
      balance: encryptedBalance,
      currency: response.currency,
      color: response.color,
    },
  });

  console.log(`Account created: ${account.name} (${account.id})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
import "dotenv/config";
