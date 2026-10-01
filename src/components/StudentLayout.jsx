import { Zap, LogOut } from "lucide-react";
import { useAuth } from "../context/useAuth.js";

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"><Zap size={16} /></span>
          <span className="font-bold text-slate-900">QuizFlow <span className="text-indigo-600">AI</span></span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>{user?.name}</span>
          <button onClick={logout} className="flex items-center gap-1 hover:text-red-500"><LogOut size={14} /> Log out</button>
        </div>
      </header>
      <main className="mx-auto max-w-2xl p-4 md:p-8">{children}</main>
    </div>
  );
}