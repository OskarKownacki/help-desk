"use client";

import LoginButton from "../components/LoginButton";
import RegisterButton from "../components/RegisterButton";
import { useUser } from "@auth0/nextjs-auth0";

export default function Home() {
  const { user } = useUser();

  return (
    <main className="min-h-screen bg-linear-to-b from-[#03040a] to-[#071026] text-white">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-sky-400 to-blue-500">
              Tech Desk — Simple ticketing for IT support
            </h1>
            <p className="mt-6 text-lg text-zinc-300 max-w-2xl">
              Streamline tech support with a lightweight ticketing system built for teams and help desks. Create, assign and track issues from users, attach device details, and resolve problems faster.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a href="/auth/login" className="inline-flex items-center px-5 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-medium">
                Get started
              </a>
              <a href="#learn" className="text-sm text-zinc-300 hover:text-zinc-100">
                Learn more
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
              <div className="p-4 bg-zinc-900/40 rounded-lg">
                <h3 className="text-sm font-semibold text-white">Ticketing</h3>
                <p className="text-zinc-400 text-sm">Create and track tickets with status, priority and attachments.</p>
              </div>
              <div className="p-4 bg-zinc-900/40 rounded-lg">
                <h3 className="text-sm font-semibold text-white">Device Inventory</h3>
                <p className="text-zinc-400 text-sm">Log computers and devices to quickly diagnose and assign the right tech.</p>
              </div>
              <div className="p-4 bg-zinc-900/40 rounded-lg">
                <h3 className="text-sm font-semibold text-white">Collaboration</h3>
                <p className="text-zinc-400 text-sm">Assign tickets, comment, and close issues with an audit trail.</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
              <h4 className="text-sm text-zinc-300">Quick start</h4>
              <p className="text-zinc-400 text-sm mt-2">Sign in or register to create your first ticket and manage requests.</p>
              {user ? (
                <div className="mt-4">
                  <a
                    href="/tickets/new"
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-medium"
                  >
                    Create a ticket
                  </a>
                  <p className="text-zinc-400 text-sm mt-3">Create a ticket to request help or report an issue.</p>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <LoginButton />
                  <RegisterButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="learn" className="max-w-6xl mx-auto px-6 py-12">
        <div className="prose prose-invert text-zinc-300">
          <h2 className="text-2xl text-white">Why Tech Desk?</h2>
          <p>
            Tech Desk focuses on quick incident reporting and resolution. It is designed for IT teams who want a focused ticketing workflow without the bloat.
          </p>
        </div>
      </section>
    </main>
  );
}