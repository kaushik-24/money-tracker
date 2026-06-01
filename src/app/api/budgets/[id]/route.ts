import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const budget = await prisma.budget.findFirst({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    include: { category: true },
  });
  if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(budget);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.categoryId) data.categoryId = body.categoryId;
  if (body.amount !== undefined) data.amount = body.amount;
  if (body.period) data.period = body.period;
  if (body.startDate) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

  const budget = await prisma.budget.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data,
    include: { category: true },
  });
  return NextResponse.json(budget);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.budget.delete({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
