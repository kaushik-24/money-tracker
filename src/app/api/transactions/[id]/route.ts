import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const transaction = await prisma.transaction.findFirst({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    include: { account: true, category: true },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...transaction,
    amount: parseFloat(decrypt(transaction.amount) || "0"),
    description: decrypt(transaction.description) || "",
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.accountId) data.accountId = body.accountId;
  if (body.categoryId) data.categoryId = body.categoryId;
  if (body.amount !== undefined) data.amount = encrypt(body.amount.toString());
  if (body.date) data.date = new Date(body.date);
  if (body.description !== undefined) data.description = encrypt(body.description || "");
  if (body.isReconciled !== undefined) data.isReconciled = body.isReconciled;

  const transaction = await prisma.transaction.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data,
    include: { account: true, category: true },
  });

  return NextResponse.json({
    ...transaction,
    amount: body.amount ?? parseFloat(decrypt(transaction.amount) || "0"),
    description: body.description ?? (decrypt(transaction.description) || ""),
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.transaction.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data: { isArchived: true },
  });
  return NextResponse.json({ success: true });
}
