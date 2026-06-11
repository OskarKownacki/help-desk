"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useUser } from "@/hooks/useUser";
import { resolveTicket, deleteTicket, updateTicket } from "../../lib/tickets";
import InviteLinkGenerator from "@/components/InviteLinkGenerator";

type AdminTab = "Tickets" | "Inventory";

type Ticket = {
  _id: string;
  title: string;
  content: string;
  author: string;
  urgency?: number;
  status?: string;
  createdAt?: string;
};

type Computer = {
  id: number;
  name: string;
  room?: {
    id: number;
    name: string;
    floor?: number | null;
  } | null;
  owner?: string | null;
};

type Room = {
  id: number;
  name: string;
  floor?: number | null;
};

type EditState = {
  title: string;
  content: string;
};

type ComputerFormState = {
  name: string;
  roomId: string;
  owner: string;
};

type RoomFormState = {
  name: string;
  floor: string;
};

export default function AdminPage() {
  const { user, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState<AdminTab>("Tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [savingComputer, setSavingComputer] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ title: "", content: "" });
  const [computerForm, setComputerForm] = useState<ComputerFormState>({
    name: "",
    roomId: "",
    owner: "",
  });
  const [roomForm, setRoomForm] = useState<RoomFormState>({
    name: "",
    floor: "",
  });

  useEffect(() => {
    if (!userLoading && user) {
      fetchTickets();
    }
  }, [userLoading, user]);

  useEffect(() => {
    if (!userLoading && user && activeTab === "Inventory") {
      fetchInventory();
    }
  }, [activeTab, userLoading, user]);

  async function fetchTickets() {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      setTickets(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  }

  async function fetchInventory() {
    setLoadingInventory(true);
    try {
      const [computersRes, roomsRes] = await Promise.all([fetch("/api/computers"), fetch("/api/rooms")]);

      if (!computersRes.ok) {
        throw new Error("Failed to load computers");
      }

      if (!roomsRes.ok) {
        throw new Error("Failed to load rooms");
      }

      const [computersData, roomsData] = await Promise.all([computersRes.json(), roomsRes.json()]);
      setComputers(computersData);
      setRooms(roomsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInventory(false);
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

  async function handleCreateComputer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavingComputer(true);
    try {
      const res = await fetch("/api/computers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: computerForm.name.trim(),
          roomId: computerForm.roomId || rooms[0]?.id.toString() || "",
          owner: computerForm.owner.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create computer");
      }

      setComputerForm({
        name: "",
        roomId: rooms[0]?.id.toString() ?? "",
        owner: "",
      });
      await fetchInventory();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingComputer(false);
    }
  }

  async function handleCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavingRoom(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomForm.name.trim(),
          floor: roomForm.floor.trim() === "" ? undefined : Number(roomForm.floor),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create room");
      }

      setRoomForm({ name: "", floor: "" });
      await fetchInventory();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRoom(false);
    }
  }

  if (userLoading || loadingTickets) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
      </main>
    );
  }

  const renderTicketsTab = () => (
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
                          onClick={() => (isEditing ? handleConfirm(t._id) : handleDoubleClick(t))}
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
  );

  const renderInventoryTab = () => (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">PCs</h2>
            <p className="text-sm text-zinc-400">Manage computers and assign them to rooms.</p>
          </div>
          <div className="text-sm text-zinc-500">{computers.length} total</div>
        </div>

        <form className="grid gap-3 mb-5" onSubmit={handleCreateComputer}>
          <input
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="PC name"
            value={computerForm.name}
            onChange={(e) => setComputerForm((current) => ({ ...current, name: e.target.value }))}
            required
          />
          <select
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 disabled:opacity-60"
            value={computerForm.roomId || rooms[0]?.id.toString() || ""}
            onChange={(e) => setComputerForm((current) => ({ ...current, roomId: e.target.value }))}
            required
            disabled={rooms.length === 0}
          >
            <option value="" disabled>
              {rooms.length === 0 ? "Create a room first" : "Select room"}
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          <input
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="Owner"
            value={computerForm.owner}
            onChange={(e) => setComputerForm((current) => ({ ...current, owner: e.target.value }))}
          />
          <button
            type="submit"
            disabled={savingComputer || rooms.length === 0}
            className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white"
          >
            {savingComputer ? "Saving..." : "Add PC"}
          </button>
        </form>

        <div className="space-y-2">
          {computers.length === 0 ? (
            <p className="text-sm text-zinc-400">No PCs yet.</p>
          ) : (
            computers.map((computer) => (
              <div key={computer.id} className="rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2">
                <div className="font-medium">{computer.name}</div>
                <div className="text-sm text-zinc-400">
                  Room: {computer.room?.name || "Unassigned"}
                  {computer.room?.floor !== undefined && computer.room?.floor !== null ? ` (floor ${computer.room.floor})` : ""}
                  {computer.owner ? ` • Owner: ${computer.owner}` : ""}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Rooms</h2>
            <p className="text-sm text-zinc-400">Create room records for assignment.</p>
          </div>
          <div className="text-sm text-zinc-500">{rooms.length} total</div>
        </div>

        <form className="grid gap-3 mb-5" onSubmit={handleCreateRoom}>
          <input
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="Room name"
            value={roomForm.name}
            onChange={(e) => setRoomForm((current) => ({ ...current, name: e.target.value }))}
            required
          />
          <input
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="Floor"
            type="number"
            value={roomForm.floor}
            onChange={(e) => setRoomForm((current) => ({ ...current, floor: e.target.value }))}
          />
          <button
            type="submit"
            disabled={savingRoom}
            className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white"
          >
            {savingRoom ? "Saving..." : "Add Room"}
          </button>
        </form>

        <div className="space-y-2">
          {rooms.length === 0 ? (
            <p className="text-sm text-zinc-400">No rooms yet.</p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="rounded-lg border border-zinc-800 bg-zinc-950/30 px-3 py-2">
                <div className="font-medium">{room.name}</div>
                <div className="text-sm text-zinc-400">Floor: {room.floor ?? "-"}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );

  return (
    <main className="min-h-screen p-8 bg-[#071026] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="text-zinc-300 mt-2">
              {activeTab === "Tickets" ? "Manage all tickets. Double-click a row to edit." : "Track PCs and rooms from one place."}
            </p>
          </div>

          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-950/40 p-1">
            {(["Tickets", "Inventory"] as AdminTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab ? "bg-sky-600 text-white" : "text-zinc-300 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Tickets" ? renderTicketsTab() : renderInventoryTab()}

        {activeTab === "Inventory" && loadingInventory && (
          <p className="mt-4 text-sm text-zinc-400">Loading inventory...</p>
        )}
      </div>
    </main>
  );
}