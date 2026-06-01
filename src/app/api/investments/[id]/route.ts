import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const investment = await prisma.investment.findFirst({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    include: { account: true },
  });
  if (!investment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...investment,
    purchasePrice: parseFloat(decrypt(investment.purchasePrice) || "0"),
    currentPrice: parseFloat(decrypt(investment.currentPrice) || "0"),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.accountId) data.accountId = body.accountId;
  if (body.name) data.name = body.name;
  if (body.type) data.type = body.type;
  if (body.shares !== undefined) data.shares = body.shares;
  if (body.purchasePrice !== undefined) data.purchasePrice = encrypt(body.purchasePrice.toString());
  if (body.currentPrice !== undefined) data.currentPrice = encrypt(body.currentPrice.toString());
  if (body.currency) data.currency = body.currency;

  const investment = await prisma.investment.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data,
    include: { account: true },
  });

  return NextResponse.json({
    ...investment,
    purchasePrice: body.purchasePrice ?? parseFloat(decrypt(investment.purchasePrice) || "0"),
    currentPrice: body.currentPrice ?? parseFloat(decrypt(investment.currentPrice) || "0"),
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.investment.delete({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
