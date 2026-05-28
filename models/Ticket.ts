// models/Ticket.js
import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    author: { 
        type: String, 
        required: true 
    },
    urgency: { 
        type: Number, 
        enum: [1, 2, 3], // e.g., 1 = Low, 2 = Medium, 3 = High
        default: 1 
    },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Closed'], 
        default: 'Open' 
    },
    company: { 
        type: String, 
        required: true, 
        index: true // <-- CRITICAL: This optimizes multi-tenant query speeds dramatically
    },
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);