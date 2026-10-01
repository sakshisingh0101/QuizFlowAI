import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText, Activity, Users, Trophy, Plus, Play, BarChart3, Sparkles, ChevronRight,
} from "lucide-react";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { useAuth } from "../context/useAuth.js";
import { getMyQuizzes } from "../api/quiz.api.js";
import { createSession, getTeacherOverview } from "../api/session.api.js";

const statusStyle = {
  ready: "bg-green-50 text-green-700",
  draft: "bg-orange-50 text-orange-600",
  archived: "bg-slate-100 text-slate-600",
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

function StatCard({ icon: Icon, tint, value, label, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${tint}`}>
        <Icon size={18} />
      </span>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{label}</span> {sub}
      </p>
    </div>
  );
}

function ActionCard({ icon: Icon, tint, title, desc, to, onClick, disabled }) {
  const cls =
    "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition " +
    (disabled ? "cursor-not-allowed opacity-50" : "hover:border-indigo-200 hover:shadow-sm");
  const inner = (
    <>
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon size={18} /></span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-slate-400" />
    </>
  );
  return to && !disabled
    ? <Link to={to} className={cls}>{inner}</Link>
    : <button onClick={onClick} disabled={disabled} className={cls}>{inner}</button>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    Promise.all([getMyQuizzes(), getTeacherOverview()])
      .then(([q, o]) => { setQuizzes(q); setOverview(o); })
      .catch((e) => setError(e.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const goLive = async (quizId) => {
    try {
      setStartingId(quizId);
      const session = await createSession(quizId);
      navigate(`/teacher/session/${session.room_code}`);
    } catch (e) {
      setError(e.response?.data?.message || "Could not start session");
      setStartingId(null);
    }
  };

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();
  const firstName = user?.name?.split(" ")[0];
  const latestReady = quizzes.find((q) => q.status === "ready");
  const active = overview?.activeSession;
  const progress = active
    ? active.status === "waiting" ? 0 : active.current_question_index + 1
    : 0;

  return (
    <TeacherLayout title="Dashboard" subtitle="Create, host, and analyze your AI-powered quizzes.">
      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-indigo-600">{today}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Ready to create your next interactive quiz?</p>
        </div>
        <Link
          to="/teacher/quizzes/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Create Quiz
        </Link>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} tint="bg-indigo-50 text-indigo-600" value={quizzes.length} label="Total Quizzes" sub="created" />
        <StatCard icon={Activity} tint="bg-green-50 text-green-600" value={overview?.sessionsThisWeek ?? 0} label="Live Sessions" sub="this week" />
        <StatCard icon={Users} tint="bg-orange-50 text-orange-500" value={overview?.studentsReached ?? 0} label="Students Reached" sub="all time" />
        <StatCard
          icon={Trophy} tint="bg-purple-50 text-purple-600"
          value={overview?.averageScore != null ? `${overview.averageScore}%` : "—"}
          label="Average Score" sub="across sessions"
        />
      </div>

      {/* Recent quizzes + active session */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between p-5">
            <div>
              <h3 className="font-semibold text-slate-900">Recent Quizzes</h3>
              <p className="text-xs text-slate-500">Your latest created quizzes</p>
            </div>
          </div>

          {loading ? (
            <p className="p-5 text-sm text-slate-500">Loading...</p>
          ) : quizzes.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No quizzes yet. Create your first one with AI.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-y border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3 font-medium">Topic</th>
                    <th className="px-3 py-3 font-medium">Difficulty</th>
                    <th className="px-3 py-3 font-medium">Questions</th>
                    <th className="px-3 py-3 font-medium">Created</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizzes.slice(0, 5).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <Link to={`/teacher/quizzes/${q.id}`} className="hover:text-indigo-600">{q.topic}</Link>
                      </td>
                      <td className="px-3 capitalize text-slate-600">{q.difficulty}</td>
                      <td className="px-3 text-slate-600">{q.num_questions}</td>
                      <td className="px-3 text-slate-600">
                        {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                      <td className="px-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[q.status] || statusStyle.draft}`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 text-right">
                        <button
                          onClick={() => goLive(q.id)}
                          disabled={q.status !== "ready" || startingId === q.id}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {startingId === q.id ? "Starting..." : "Go live"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active live session */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
          {active ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-wider text-indigo-600">ACTIVE LIVE SESSION</p>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {active.status === "live" ? "LIVE" : "WAITING"}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{active.topic}</h3>
              <p className="text-xs capitalize text-slate-500">{active.difficulty} difficulty</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] text-slate-500">Room code</p>
                  <p className="font-mono text-sm font-bold tracking-wider text-indigo-600">{active.room_code}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] text-slate-500">Students</p>
                  <p className="text-sm font-bold text-slate-900">{active.students} <span className="font-normal text-slate-500">joined</span></p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Question progress</span>
                  <span className="font-medium text-slate-700">{progress} / {active.num_questions}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200">
                  <div className="h-1.5 rounded-full bg-indigo-600" style={{ width: `${(progress / active.num_questions) * 100}%` }} />
                </div>
              </div>

              <Link
                to={`/teacher/session/${active.room_code}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Play size={14} /> Manage session
              </Link>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <Activity className="mb-2 text-indigo-300" />
              <p className="text-sm font-semibold text-slate-900">No active session</p>
              <p className="text-xs text-slate-500">Go live with a ready quiz to host a class.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <h3 className="font-semibold text-slate-900">Quick actions</h3>
      <p className="mb-3 text-xs text-slate-500">Jump right into your next task</p>
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard icon={Sparkles} tint="bg-indigo-50 text-indigo-600" title="Create a quiz" desc="Generate with AI in seconds" to="/teacher/quizzes/new" />
        <ActionCard
          icon={Play} tint="bg-green-50 text-green-600" title="Start a session" desc="Host a live classroom"
          onClick={() => latestReady && goLive(latestReady.id)} disabled={!latestReady}
        />
       <ActionCard icon={BarChart3} tint="bg-purple-50 text-purple-600" title="View analytics" desc="Understand student progress" to="/teacher/analytics" />
      </div>
    </TeacherLayout>
  );
}