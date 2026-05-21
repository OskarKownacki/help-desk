// models/Ticket.js
import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    urgency: Number,
    status: String,
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
