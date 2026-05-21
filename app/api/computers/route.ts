import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const computers = await prisma.komputer.findMany();
  return NextResponse.json(computers);
}

export async function POST(request: NextRequest) {
  const { name, room, owner } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const newComputer = await prisma.komputer.create({
    data: {
      name,
      ...(room !== undefined && { room }),
      ...(owner !== undefined && { owner }),
    },
  });
  return NextResponse.json(newComputer);
}
