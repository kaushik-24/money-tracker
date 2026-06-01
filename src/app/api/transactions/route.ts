import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const accountId = url.searchParams.get("accountId");

  const where: Record<string, unknown> = { isArchived: false, ...(session.user.isAdmin ? {} : { userId: session.user.id }) };
  if (accountId) where.accountId = accountId;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { account: true, category: true },
    orderBy: { date: "desc" },
    take: 100,
  });

  const decrypted = transactions.map((t) => ({
    ...t,
    amount: parseFloat(decrypt(t.amount) || "0"),
    description: decrypt(t.description) || "",
  }));

  return NextResponse.json(decrypted);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const encryptedAmount = encrypt(body.amount.toString());
  const encryptedDesc = encrypt(body.description || "");

  const transaction = await prisma.transaction.create({
    data: {
      accountId: body.accountId,
      categoryId: body.categoryId,
      amount: encryptedAmount,
      date: new Date(body.date),
      description: encryptedDesc,
      userId: session.user.id,
    },
    include: { account: true, category: true },
  });

  return NextResponse.json(
    {
      ...transaction,
      amount: body.amount,
      description: body.description || "",
    },
    { status: 201 }
  );
}
