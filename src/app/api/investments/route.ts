import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investments = await prisma.investment.findMany({
    where: { ...(session.user.isAdmin ? {} : { userId: session.user.id }) },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  });

  const decrypted = investments.map((inv) => ({
    ...inv,
    purchasePrice: parseFloat(decrypt(inv.purchasePrice) || "0"),
    currentPrice: parseFloat(decrypt(inv.currentPrice) || "0"),
  }));

  return NextResponse.json(decrypted);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const investment = await prisma.investment.create({
    data: {
      accountId: body.accountId,
      name: body.name,
      type: body.type,
      shares: body.shares,
      purchasePrice: encrypt(body.purchasePrice.toString()),
      currentPrice: encrypt(body.currentPrice?.toString() || body.purchasePrice.toString()),
      currency: body.currency || "USD",
      userId: session.user.id,
    },
    include: { account: true },
  });

  return NextResponse.json(
    {
      ...investment,
      purchasePrice: body.purchasePrice,
      currentPrice: body.currentPrice || body.purchasePrice,
    },
    { status: 201 }
  );
}
