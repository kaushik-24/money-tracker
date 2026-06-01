#!/usr/bin/env npx tsx
import prompts from "prompts";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { encrypt } from "../src/lib/encryption.js";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] || "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const accounts = await prisma.account.findMany({
    where: { isArchived: false },
  });

  const categories = await prisma.category.findMany();

  if (accounts.length === 0) {
    console.error("No accounts found. Create one first with tools/add-account.ts");
    await prisma.$disconnect();
    process.exit(1);
  }

  const response = await prompts([
    {
      type: "select",
      name: "accountId",
      message: "Account:",
      choices: accounts.map((a) => ({ title: a.name, value: a.id })),
    },
    {
      type: "select",
      name: "categoryId",
      message: "Category:",
      choices: categories.map((c) => ({
        title: `${c.icon} ${c.name} (${c.type})`,
        value: c.id,
      })),
    },
    {
      type: "number",
      name: "amount",
      message: "Amount (positive=income, negative=expense):",
      float: true,
      validate: (v: number) => v !== 0 || "Amount cannot be zero",
    },
    {
      type: "date",
      name: "date",
      message: "Date:",
      initial: new Date(),
    },
    {
      type: "text",
      name: "description",
      message: "Description:",
      initial: "",
    },
  ]);

  const encryptedAmount = encrypt(response.amount.toString());
  const encryptedDesc = encrypt(response.description || "");

  const transaction = await prisma.transaction.create({
    data: {
      accountId: response.accountId,
      categoryId: response.categoryId,
      amount: encryptedAmount,
      date: response.date,
      description: encryptedDesc,
    },
  });

  console.log(`Transaction created: ${transaction.id}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
import "dotenv/config";
