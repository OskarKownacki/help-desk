


export function createTicket(title: string, content: string, author: string, urgency: number) {
    return fetch("/api/tickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, author, urgency }),
    });
}

export function updateTicket(id: string, title?: string, content?: string, author?: string, urgency?: number) {
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (author !== undefined) data.author = author;
    if (urgency !== undefined) data.urgency = urgency;

    return fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export function resolveTicket(id: string) {
    return fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "resolved" }),
    });
}

export function deleteTicket(id: string) {
    return fetch(`/api/tickets/${id}`, {
        method: "DELETE",
    });
}


