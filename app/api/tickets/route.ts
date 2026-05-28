// app/api/tickets/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { auth0 } from "@/lib/auth0"; // Import your secure Auth0 instance

export async function GET() {
  try {
    // 1. Fetch the secure active user session
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract their assigned company slug
    const userCompany = session.user['https://helpdesk.com/tenantId'];
    console.log("User's assigned company (tenantId):", userCompany);
    if (!userCompany) {
      return NextResponse.json({ error: "Forbidden: No company assigned to this profile" }, { status: 403 });
    }

    await dbConnect();

    // 3. STRICT GUARD: Only fetch tickets belonging to their company
    const tickets = await Ticket.find({ company: userCompany }).sort({ createdAt: -1 });
    return NextResponse.json(tickets);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Fetch the secure active user session
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract their assigned company slug
    const userCompany = session.user['https://helpdesk.com/tenantId'];
    if (!userCompany) {
      return NextResponse.json({ error: "Forbidden: Cannot create tickets without an assigned company" }, { status: 403 });
    }

    const { title, content, author, urgency } = await request.json();
    if (!title || !content || !author) {    
      return NextResponse.json({ error: "Title, content and author are required" }, { status: 400 });
    }

    await dbConnect();

    // 3. SECURE STAMP: Force the ticket creation to use the session's company field
    const newTicket = await Ticket.create({
      title,
      content,
      author,
      urgency: urgency || 1,
      status: "Open",
      company: userCompany // Automatically binds the ticket to their organization
    });

    return NextResponse.json(newTicket, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}