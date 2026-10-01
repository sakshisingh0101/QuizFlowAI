import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { getTeacherHistory, endSession } from "../api/session.api.js";

const badge = {
  waiting: "bg-amber-50 text-amber-700",
  live: "bg-red-50 text-red-600",
  completed: "bg-slate-100 text-slate-600",
};

export default function LiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    getTeacherHistory()
      .then(setSessions)
      .catch((e) => setError(e.response?.data?.message || "Failed to load sessions"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const end = async (id) => {
    if (!confirm("End this session? Students in the room will no longer be able to join.")) return;
    try {
      await endSession(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not end session");
    }
  };

  const active = sessions.filter((s) => s.status !== "completed");
  const past = sessions.filter((s) => s.status === "completed");

  const Row = ({ s }) => (
    <li className="flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <p className="font-medium text-slate-900">{s.topic}</p>
        <p className="mt-1 text-xs text-slate-500">
          <span className="font-mono font-semibold text-indigo-600">{s.room_code}</span>
          {" · "}{s.students} students · {new Date(s.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${badge[s.status]}`}>{s.status}</span>
        {s.status === "completed" ? (
          <Link to={`/teacher/sessions/${s.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">View results</Link>
        ) : (
          <>
            <Link to={`/teacher/session/${s.room_code}`} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Resume</Link>
            <button onClick={() => end(s.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">End</button>
          </>
        )}
      </div>
    </li>
  );

  return (
    <TeacherLayout title="Live Sessions" subtitle="Active rooms and past sessions.">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading...</p> : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white">
            <h3 className="border-b border-slate-100 p-5 font-semibold text-slate-900">Active ({active.length})</h3>
            {active.length === 0
              ? <p className="p-5 text-sm text-slate-500">No active sessions.</p>
              : <ul className="divide-y divide-slate-100">{active.map((s) => <Row key={s.id} s={s} />)}</ul>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white">
            <h3 className="border-b border-slate-100 p-5 font-semibold text-slate-900">Past sessions ({past.length})</h3>
            {past.length === 0
              ? <p className="p-5 text-sm text-slate-500">Completed sessions will appear here.</p>
              : <ul className="divide-y divide-slate-100">{past.map((s) => <Row key={s.id} s={s} />)}</ul>}
          </section>
        </div>
      )}
    </TeacherLayout>
  );
}