import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const category = await prisma.category.findFirst({
    where: session.user.isAdmin ? { id } : { id, OR: [{ userId: null }, { userId: session.user.id }] },
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(category);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.category.findFirst({
    where: session.user.isAdmin ? { id, userId: { not: null } } : { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found or cannot edit built-in category" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.type) data.type = body.type;
  if (body.icon) data.icon = body.icon;
  if (body.color) data.color = body.color;

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const category = await prisma.category.findFirst({
    where: session.user.isAdmin ? { id, userId: { not: null } } : { id, userId: session.user.id },
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (category.isBuiltIn) {
    return NextResponse.json({ error: "Cannot delete built-in category" }, { status: 403 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
