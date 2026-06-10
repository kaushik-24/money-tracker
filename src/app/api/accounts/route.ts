import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.account.findMany({
    where: { isArchived: false, ...(session.user.isAdmin ? {} : { userId: session.user.id }) },
    orderBy: { createdAt: "desc" },
  });

  const accountIds = accounts.map((a) => a.id);

  const transactions = await prisma.transaction.findMany({
    where: { accountId: { in: accountIds }, isArchived: false },
    select: { accountId: true, amount: true },
  });

  const transactionSums: Record<string, number> = {};
  for (const t of transactions) {
    const decryptedAmount = parseFloat(decrypt(t.amount) || "0");
    transactionSums[t.accountId] = (transactionSums[t.accountId] || 0) + decryptedAmount;
  }

  const decrypted = accounts.map((a) => {
    const startingBalance = parseFloat(decrypt(a.balance) || "0");
    const runningBalance = startingBalance + (transactionSums[a.id] || 0);
    return { ...a, balance: runningBalance };
  });

  return NextResponse.json(decrypted);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const encryptedBalance = encrypt(body.balance.toString());

  const account = await prisma.account.create({
    data: {
      name: body.name,
      type: body.type,
      balance: encryptedBalance,
      currency: body.currency || "USD",
      color: body.color || "#6366f1",
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ...account, balance: body.balance }, { status: 201 });
}
