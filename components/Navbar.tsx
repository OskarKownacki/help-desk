"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import LoginButton from "./LoginButton";
import RegisterButton from "./RegisterButton";

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export default function Navbar() {
  const { user, loading } = useUser();
  const roles = user?.['https://helpdesk.com/roles'] || [];

  return (
    <nav className="w-full h-16 border-b border-zinc-800 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-sky-500 to-blue-800 flex items-center justify-center text-white font-bold">
            TD
          </div>
          <div className="text-sm font-semibold text-white">Tech Desk</div>
        </Link>

        <div className="flex items-center gap-3">
          {!loading && !user && (
            <div className="flex items-center gap-3">
              <LoginButton />
              <RegisterButton />
            </div>
          )}

          {!loading && user && roles.includes('Admin') && (
            <Link href="/admin" className="text-sm px-3 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white">
              Admin Panel
            </Link>
          )}
          {!loading && user && (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 text-sm text-white">
                <span className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-semibold">
                  {user.picture ? (
                    <img src={user.picture as string} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    getInitials(user.name as string | undefined, user.email as string | undefined)
                  )}
                </span>
                <span className="truncate">{(user.name || user.email) as string}</span>
              </Link>
              <a
                href="/auth/logout"
                className="text-sm px-3 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
