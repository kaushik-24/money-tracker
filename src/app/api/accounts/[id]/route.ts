import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.account.findFirst({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
  });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...account,
    balance: parseFloat(decrypt(account.balance) || "0"),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.type) data.type = body.type;
  if (body.balance !== undefined) data.balance = encrypt(body.balance.toString());
  if (body.currency) data.currency = body.currency;
  if (body.color) data.color = body.color;
  if (body.isArchived !== undefined) data.isArchived = body.isArchived;

  const account = await prisma.account.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data,
  });
  return NextResponse.json({ ...account, balance: body.balance ?? decrypt(account.balance) });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.account.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data: { isArchived: true },
  });
  return NextResponse.json({ success: true });
}
