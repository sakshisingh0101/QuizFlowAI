import { NavLink, Link } from "react-router-dom";
import {
  Zap, LayoutDashboard, BookOpen, PlusCircle, Activity, BarChart3,
   LogOut, Search, Bell,
} from "lucide-react";
import { useAuth } from "../context/useAuth.js";

const workspace = [
  { label: "Dashboard", to: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "My Quizzes", to: "/teacher/quizzes", icon: BookOpen },
  { label: "Create Quiz", to: "/teacher/quizzes/new", icon: PlusCircle },
  { label: "Live Sessions", to: "/teacher/sessions", icon: Activity },
  { label: "Analytics", to: "/teacher/analytics", icon: BarChart3 },
];
// const support = [
//   { label: "Help center", icon: HelpCircle },
//   { label: "Settings", icon: Settings },
// ];

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function NavItem({ label, to, icon: Icon }) {
  const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
  // `to` nahi hai = page abhi bana nahi, disabled dikhao
  if (!to) {
    return (
      <span className={`${base} cursor-not-allowed text-slate-400`}>
        <Icon size={16} /> {label}
      </span>
    );
  }
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${base} ${isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`
      }
    >
      <Icon size={16} /> {label}
    </NavLink>
  );
}

const Section = ({ title, items }) => (
  <div className="mb-6">
    <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400">{title}</p>
    <nav className="space-y-1">{items.map((i) => <NavItem key={i.label} {...i} />)}</nav>
  </div>
);

export default function TeacherLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f9fb] md:flex">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <Link to="/teacher/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <Zap size={16} />
          </span>
          <span className="font-bold text-slate-900">
            QuizFlow <span className="text-indigo-600">AI</span>
          </span>
        </Link>

        <Section title="WORKSPACE" items={workspace} />
       

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
          <button onClick={logout} className="flex items-center gap-3 px-3 text-sm text-slate-600 hover:text-red-500">
            <LogOut size={16} /> Log out
          </button>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
              {initials(user?.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Teacher account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 sm:flex">
              <Search size={14} /> Search anything...
            </div>
            <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                {initials(user?.name)}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-medium text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500">Teacher</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}