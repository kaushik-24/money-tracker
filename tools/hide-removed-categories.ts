#!/usr/bin/env npx tsx
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] || "" });
const prisma = new PrismaClient({ adapter });

const REMOVED_CATEGORIES = [
  { name: "Freelance", type: "income" },
  { name: "Investment Income", type: "income" },
  { name: "Shopping", type: "expense" },
  { name: "Dining Out", type: "expense" },
  { name: "Subscriptions", type: "expense" },
  { name: "Insurance", type: "expense" },
  { name: "Education", type: "expense" },
];

async function main() {
  console.log("Hiding removed built-in categories for all existing users...\n");

  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  if (users.length === 0) {
    console.log("No users found. Nothing to do.");
    await prisma.$disconnect();
    return;
  }
  console.log(`Found ${users.length} user(s)\n`);

  let totalHidden = 0;

  for (const { name, type } of REMOVED_CATEGORIES) {
    const category = await prisma.category.findFirst({
      where: { name, type, userId: null, isBuiltIn: true },
    });

    if (!category) {
      console.log(`  ~ "${name}" not found in DB, skipping`);
      continue;
    }

    for (const user of users) {
      const existing = await prisma.hiddenCategory.findUnique({
        where: { userId_categoryId: { userId: user.id, categoryId: category.id } },
      });
      if (existing) continue;

      await prisma.hiddenCategory.create({
        data: { userId: user.id, categoryId: category.id },
      });
      totalHidden++;
      console.log(`  ✓ "${name}" hidden for ${user.email}`);
    }
  }

  console.log(`\nDone. ${totalHidden} hidden category record(s) created.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Script failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
