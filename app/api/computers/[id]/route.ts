import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: number } },
) {
  const { id } = await params;
  const { name, room, owner } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updated = await prisma.komputer.update({
    where: { id: Number(id) },
    data: {
      name,
      ...(room !== undefined && { room }),
      ...(owner !== undefined && { owner }),
    },
  });

  return NextResponse.json(updated);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> },
) {
  const { id } = await params;
  const komputer = await prisma.komputer.findUnique({
    where: { id: Number(id) },
  });

  if (!komputer) {
    return NextResponse.json({ error: "Computer not found" }, { status: 404 });
  }

  return NextResponse.json(komputer);
}
