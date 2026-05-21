import {NextResponse, NextRequest} from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    await dbConnect();
    const ticket = await Ticket.findById(id);
    if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json(ticket);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const { title, content, author, urgency } = await request.json();

    const data = {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(author !== undefined && { author }),
        ...(urgency !== undefined && { urgency }),
        ...(status !== undefined && { status })
    };

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ error: "No fields provided" }, { status: 400 });
    }

    await dbConnect();
    const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
    );

    if (!updatedTicket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTicket);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    await dbConnect();
    const deletedTicket = await Ticket.findByIdAndDelete(id);
    if (!deletedTicket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Ticket deleted successfully" });
}