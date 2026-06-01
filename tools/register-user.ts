#!/usr/bin/env npx tsx
import prompts from "prompts";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] || "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Display name:",
    },
    {
      type: "text",
      name: "email",
      message: "Email:",
      validate: (v: string) => (v.includes("@") ? true : "Valid email required"),
    },
    {
      type: "password",
      name: "password",
      message: "Password:",
      validate: (v: string) => (v.length >= 6 ? true : "At least 6 characters"),
    },
  ]);

  const existing = await prisma.user.findUnique({ where: { email: response.email } });
  if (existing) {
    console.error(`User with email ${response.email} already exists.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(response.password, 12);
  const user = await prisma.user.create({
    data: {
      name: response.name || null,
      email: response.email,
      passwordHash,
    },
  });

  console.log(`User created: ${user.email} (${user.id})`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
import "dotenv/config";
