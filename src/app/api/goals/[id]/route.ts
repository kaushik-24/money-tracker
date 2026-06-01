import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const goal = await prisma.goal.findFirst({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    include: { account: true },
  });

  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(goal);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.targetAmount !== undefined) data.targetAmount = body.targetAmount;
  if (body.currentAmount !== undefined) data.currentAmount = body.currentAmount;
  if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null;
  if (body.accountId !== undefined) data.accountId = body.accountId || null;
  if (body.icon) data.icon = body.icon;
  if (body.color) data.color = body.color;

  const goal = await prisma.goal.update({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
    data,
    include: { account: true },
  });
  return NextResponse.json(goal);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.goal.delete({
    where: session.user.isAdmin ? { id } : { id, userId: session.user.id },
  });
  return NextResponse.json({ success: true });
}
