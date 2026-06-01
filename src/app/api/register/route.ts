import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (body.password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const inviteCode = process.env["INVITE_CODE"];
  if (inviteCode && body.inviteCode !== inviteCode) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const adminEmail = process.env["ADMIN_EMAIL"];
  const isAdmin = adminEmail ? body.email === adminEmail : false;

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      name: body.name || null,
      email: body.email,
      passwordHash,
      isAdmin,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, isAdmin }, { status: 201 });
}
