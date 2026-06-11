import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: number } },
) {
  const { id } = await params;
  const { name, roomId, owner } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const parsedRoomId = Number(roomId);
  if (!Number.isInteger(parsedRoomId) || parsedRoomId <= 0) {
    return NextResponse.json({ error: "Room is required" }, { status: 400 });
  }

  const updated = await prisma.komputer.update({
    where: { id: Number(id) },
    data: {
      name,
      roomId: parsedRoomId,
      ...(owner !== undefined && { owner }),
    },
    include: {
      room: true,
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
    include: {
      room: true,
    },
  });

  if (!komputer) {
    return NextResponse.json({ error: "Computer not found" }, { status: 404 });
  }

  return NextResponse.json(komputer);
}
