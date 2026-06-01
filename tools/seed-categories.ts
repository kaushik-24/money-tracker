#!/usr/bin/env npx tsx
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] || "" });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "income" as const, icon: "💰", color: "#22c55e", isBuiltIn: true },
  { name: "Freelance", type: "income" as const, icon: "💻", color: "#16a34a", isBuiltIn: true },
  { name: "Investment Income", type: "income" as const, icon: "📈", color: "#15803d", isBuiltIn: true },
  { name: "Other Income", type: "income" as const, icon: "📥", color: "#6b7280", isBuiltIn: true },
  { name: "Housing", type: "expense" as const, icon: "🏠", color: "#ef4444", isBuiltIn: true },
  { name: "Food & Groceries", type: "expense" as const, icon: "🛒", color: "#f97316", isBuiltIn: true },
  { name: "Transportation", type: "expense" as const, icon: "🚗", color: "#eab308", isBuiltIn: true },
  { name: "Utilities", type: "expense" as const, icon: "💡", color: "#a855f7", isBuiltIn: true },
  { name: "Healthcare", type: "expense" as const, icon: "🏥", color: "#ec4899", isBuiltIn: true },
  { name: "Entertainment", type: "expense" as const, icon: "🎬", color: "#6366f1", isBuiltIn: true },
  { name: "Shopping", type: "expense" as const, icon: "🛍️", color: "#d946ef", isBuiltIn: true },
  { name: "Dining Out", type: "expense" as const, icon: "🍽️", color: "#f59e0b", isBuiltIn: true },
  { name: "Subscriptions", type: "expense" as const, icon: "📋", color: "#8b5cf6", isBuiltIn: true },
  { name: "Insurance", type: "expense" as const, icon: "🛡️", color: "#14b8a6", isBuiltIn: true },
  { name: "Education", type: "expense" as const, icon: "📚", color: "#3b82f6", isBuiltIn: true },
  { name: "Other Expense", type: "expense" as const, icon: "📤", color: "#6b7280", isBuiltIn: true },
  { name: "Transfer", type: "transfer" as const, icon: "🔄", color: "#06b6d4", isBuiltIn: true },
];

async function main() {
  console.log("Seeding default categories...");

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type },
    });

    if (!existing) {
      await prisma.category.create({ data: { ...cat, userId: null } });
      console.log(`  + ${cat.name} (${cat.type})`);
    } else {
      console.log(`  ~ ${cat.name} already exists, skipping`);
    }
  }

  console.log("Seeding complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
