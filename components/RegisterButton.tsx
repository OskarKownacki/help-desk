"use client";

export default function RegisterButton() {
  return (
    <a
      href="/auth/login?screen_hint=signup"
      className="w-full text-center inline-block px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white bg-blue-500 hover:bg-blue-400 transition-colors text-[14px]"
    >
      Register
    </a>
  );
}
