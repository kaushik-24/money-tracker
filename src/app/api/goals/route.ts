import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { ...(session.user.isAdmin ? {} : { userId: session.user.id }) },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const goal = await prisma.goal.create({
    data: {
      name: body.name,
      targetAmount: body.targetAmount,
      currentAmount: body.currentAmount || 0,
      deadline: body.deadline ? new Date(body.deadline) : null,
      accountId: body.accountId || null,
      icon: body.icon || "🎯",
      color: body.color || "#6366f1",
      userId: session.user.id,
    },
    include: { account: true },
  });

  return NextResponse.json(goal, { status: 201 });
}
