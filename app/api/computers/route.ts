import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const computers = await prisma.komputer.findMany({
    include: {
      room: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  return NextResponse.json(computers);
}

export async function POST(request: NextRequest) {
  const { name, roomId, owner } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const parsedRoomId = Number(roomId);
  if (!Number.isInteger(parsedRoomId) || parsedRoomId <= 0) {
    return NextResponse.json({ error: "Room is required" }, { status: 400 });
  }

  const newComputer = await prisma.komputer.create({
    data: {
      name,
      roomId: parsedRoomId,
      ...(owner !== undefined && { owner }),
    },
    include: {
      room: true,
    },
  });
  return NextResponse.json(newComputer);
}
