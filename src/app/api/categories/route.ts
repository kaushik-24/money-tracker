import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: session.user.isAdmin
      ? {}
      : {
          OR: [
            { userId: session.user.id },
            {
              userId: null,
              NOT: { hiddenBy: { some: { userId: session.user.id } } },
            },
          ],
        },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const category = await prisma.category.create({
    data: {
      name: body.name,
      type: body.type,
      icon: body.icon || "📦",
      color: body.color || "#6b7280",
      userId: session.user.id,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
