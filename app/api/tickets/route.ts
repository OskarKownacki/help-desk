import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function GET() {
  await dbConnect();
  const tickets = await Ticket.find();
  return NextResponse.json(tickets);
}

export async function POST(request: NextRequest) {
    const { title, content, author, urgency } = await request.json();
    if (!title || !content || !author) {    
        return NextResponse.json({ error: "Title, content and author are required" }, { status: 400 });
    }

    const newTicket = await Ticket.create({
        title,
        content,
        author,
        urgency: urgency || 0,
        status: "open"
    });

    return NextResponse.json(newTicket);
}