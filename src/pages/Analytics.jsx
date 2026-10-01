import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { getTeacherHistory } from "../api/session.api.js";

export default function Analytics() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeacherHistory()
      .then(setSessions)
      .catch((e) => setError(e.response?.data?.message || "Failed to load analytics"));
  }, []);

  if (error) return <TeacherLayout title="Analytics"><p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p></TeacherLayout>;
  if (!sessions) return <TeacherLayout title="Analytics"><p className="text-sm text-slate-500">Loading...</p></TeacherLayout>;

  const done = sessions.filter((s) => s.status === "completed");
  const scored = done.filter((s) => s.accuracy !== null);
  const avg = scored.length ? Math.round(scored.reduce((a, s) => a + s.accuracy, 0) / scored.length) : null;
  const totalStudents = done.reduce((a, s) => a + s.students, 0);
  const recent = scored.slice(0, 8).reverse(); // purane se naye

  // topic-wise average
  const byTopic = {};
  scored.forEach((s) => {
    (byTopic[s.topic] ||= []).push(s.accuracy);
  });
  const topics = Object.entries(byTopic)
    .map(([t, arr]) => ({ topic: t, avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length), n: arr.length }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <TeacherLayout title="Analytics" subtitle="How your classes are performing over time.">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Completed sessions", done.length],
          ["Student participations", totalStudents],
          ["Average accuracy", avg !== null ? `${avg}%` : "—"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{l}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>

      {scored.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Run and finish a live quiz with students to see analytics here.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-900">Accuracy trend (recent sessions)</h3>
           <div className="flex h-52 items-end gap-3">
                {recent.map((s) => (
                    <Link
                    key={s.id}
                    to={`/teacher/sessions/${s.id}`}
                    title={s.topic}
                    className="group flex h-full flex-1 flex-col justify-end gap-1"
                    >
                    <span className="text-center text-xs font-semibold text-slate-700">{s.accuracy}%</span>
                    <div
                        className="w-full rounded-t-lg bg-indigo-500 transition group-hover:bg-indigo-600"
                        style={{ height: `${Math.max(s.accuracy, 4) * 1.2}px` }}
                    />
                    <span className="w-full truncate text-center text-[10px] text-slate-400">{s.topic}</span>
                    </Link>
                ))}
                </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-900">Accuracy by topic</h3>
            <div className="space-y-4">
              {topics.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{t.topic} <span className="text-xs text-slate-400">({t.n} session{t.n > 1 ? "s" : ""})</span></span>
                    <span className="font-semibold">{t.avg}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${t.avg >= 70 ? "bg-green-500" : t.avg >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${t.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {topics.length > 0 && (
              <p className="mt-5 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-800">
                Strongest: <b>{topics[0].topic}</b> · Needs work: <b>{topics[topics.length - 1].topic}</b>
              </p>
            )}
          </section>
        </div>
      )}
    </TeacherLayout>
  );
}