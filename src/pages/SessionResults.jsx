import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { getSessionResults } from "../api/session.api.js";

const toArr = (v) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v) || []; } catch { return []; }
};
const pct = (c, t) => (t ? Math.round((c / t) * 100) : 0);

export default function SessionResults() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSessionResults(sessionId)
      .then(setData)
      .catch((e) => setError(e.response?.data?.message || "Failed to load results"));
  }, [sessionId]);

  if (error) return <TeacherLayout title="Results"><p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p></TeacherLayout>;
  if (!data) return <TeacherLayout title="Results"><p className="text-sm text-slate-500">Loading...</p></TeacherLayout>;

  const { session, leaderboard, questions, report } = data;
  const withData = questions.filter((q) => q.total_answered > 0);
  const hardest = withData.length ? withData.reduce((a, b) => (pct(a.correct_count, a.total_answered) <= pct(b.correct_count, b.total_answered) ? a : b)) : null;
  const easiest = withData.length ? withData.reduce((a, b) => (pct(a.correct_count, a.total_answered) >= pct(b.correct_count, b.total_answered) ? a : b)) : null;
  const totalC = questions.reduce((s, q) => s + q.correct_count, 0);
  const totalA = questions.reduce((s, q) => s + q.total_answered, 0);
  const avgScore = leaderboard.length ? Math.round(leaderboard.reduce((s, r) => s + r.score, 0) / leaderboard.length) : 0;

  return (
    <TeacherLayout title="Session results" subtitle={`${session.topic} · Room ${session.room_code}`}>
      <Link to="/teacher/sessions" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={14} /> All sessions
      </Link>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Students", leaderboard.length],
          ["Overall accuracy", `${report?.overall_accuracy ?? pct(totalC, totalA)}%`],
          ["Average score", avgScore],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{l}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-slate-900">Accuracy by question</h3>
            <div className="space-y-4">
              {questions.map((q, i) => {
                const p = pct(q.correct_count, q.total_answered);
                return (
                  <div key={q.id}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="truncate text-slate-700">Q{i + 1}. {q.question_text}</span>
                      <span className="shrink-0 font-semibold text-slate-900">{p}% <span className="font-normal text-slate-400">({q.correct_count}/{q.total_answered})</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${p >= 70 ? "bg-green-500" : p >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {hardest && (
              <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
                <p className="rounded-xl bg-red-50 p-3 text-red-700"><b>Hardest:</b> {hardest.question_text}</p>
                <p className="rounded-xl bg-green-50 p-3 text-green-700"><b>Easiest:</b> {easiest.question_text}</p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
            <h3 className="mb-3 font-semibold text-slate-900">✨ AI performance report</h3>
            {report ? (
              <div className="space-y-3 text-sm">
                <p className="text-slate-700">{report.summary}</p>
                <div>
                  <p className="font-semibold text-green-700">Strong areas</p>
                  <ul className="list-disc pl-5 text-slate-600">{toArr(report.strong_areas).map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
                <div>
                  <p className="font-semibold text-red-600">Weak areas</p>
                  <ul className="list-disc pl-5 text-slate-600">{toArr(report.weak_areas).map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
                <p className="rounded-xl bg-white p-3 text-indigo-800">💡 {report.recommendation}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No report for this session (no answers, or generation failed).</p>
            )}
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-slate-200 bg-white">
          <h3 className="border-b border-slate-100 p-4 font-semibold text-slate-900">Leaderboard</h3>
          {leaderboard.length === 0 ? <p className="p-4 text-sm text-slate-500">No participants.</p> : (
            <ol className="divide-y divide-slate-100">
              {leaderboard.map((r, i) => (
                <li key={r.student_id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span><span className="mr-2 text-slate-400">#{i + 1}</span>{r.name}</span>
                  <span className="text-right"><b className="text-indigo-600">{r.score}</b> <span className="text-xs text-slate-400">· {r.correct} correct</span></span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </TeacherLayout>
  );
}