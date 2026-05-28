"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { resolveTicket, deleteTicket, updateTicket } from "../../lib/tickets";
import InviteLinkGenerator from "@/components/InviteLinkGenerator";

type Ticket = {
  _id: string;
  title: string;
  content: string;
  author: string;
  urgency?: number;
  status?: string;
  createdAt?: string;
};

type EditState = {
  title: string;
  content: string;
};

export default function AdminPage() {
  const { user, loading: userLoading } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ title: "", content: "" });

  useEffect(() => {
    if (!userLoading && user) fetchTickets();
  }, [userLoading, user]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      setTickets(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleDoubleClick(ticket: Ticket) {
    setEditingId(ticket._id);
    setEditState({ title: ticket.title, content: ticket.content });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditState({ title: "", content: "" });
  }

  async function handleConfirm(id: string) {
    await updateTicket(id, editState.title, editState.content);
    setEditingId(null);
    await fetchTickets();
  }

  async function handleResolve(id: string) {
    await resolveTicket(id);
    await fetchTickets();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this ticket?")) return;
    await deleteTicket(id);
    await fetchTickets();
  }

  if (userLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-[#071026] text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Admin — Ticket Management</h1>
        <p className="text-zinc-300 mt-2">Manage all tickets. Double-click a row to edit.</p>

        <div className="mt-6 bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
          {tickets.length === 0 ? (
            <p className="text-zinc-400">No tickets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-400 text-sm">
                    <th className="py-2">Title</th>
                    <th className="py-2">Author</th>
                    <th className="py-2">Urgency</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => {
                    const isEditing = editingId === t._id;
                    return (
                      <tr
                        key={t._id}
                        className={`border-t border-zinc-800 transition-colors ${isEditing ? "bg-zinc-800/40" : "hover:bg-zinc-900/40 cursor-pointer"}`}
                        onDoubleClick={() => !isEditing && handleDoubleClick(t)}
                      >
                        <td className="py-3 align-top max-w-xs">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <input
                                className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:border-sky-500"
                                value={editState.title}
                                onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                              />
                              <textarea
                                className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-white w-full resize-none focus:outline-none focus:border-sky-500"
                                rows={3}
                                value={editState.content}
                                onChange={(e) => setEditState((s) => ({ ...s, content: e.target.value }))}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="font-medium">{t.title}</div>
                              <div className="text-zinc-400 text-sm mt-1 truncate max-w-xs">{t.content}</div>
                            </>
                          )}
                        </td>
                        <td className="py-3 align-top">{t.author}</td>
                        <td className="py-3 align-top">{t.urgency ?? 0}</td>
                        <td className="py-3 align-top">{t.status}</td>
                        <td className="py-3 align-top">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResolve(t._id)}
                              className="px-3 py-1 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-sm"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => isEditing ? handleConfirm(t._id) : handleDoubleClick(t)}
                              className={`px-3 py-1 rounded-full text-white text-sm transition-colors ${
                                isEditing
                                  ? "bg-green-600 hover:bg-green-500 ring-2 ring-green-400"
                                  : "bg-zinc-800 hover:bg-zinc-700"
                              }`}
                            >
                              {isEditing ? "Confirm" : "Edit"}
                            </button>
                            {isEditing && (
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(t._id)}
                              className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <InviteLinkGenerator />
        </div>
      </div>
    </main>
  );
}