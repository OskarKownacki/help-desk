import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rooms = await prisma.pokoj.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(rooms);
}

export async function POST(request: NextRequest) {
  const { name, floor } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const newRoom = await prisma.pokoj.create({
    data: {
      name,
      ...(floor !== undefined && floor !== null && floor !== "" && { floor: Number(floor) }),
    },
  });

  return NextResponse.json(newRoom, { status: 201 });
}