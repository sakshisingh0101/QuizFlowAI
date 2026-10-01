import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { getMyQuizzes, deleteQuiz } from "../api/quiz.api.js";
import { createSession } from "../api/session.api.js";

const statusStyle = {
  ready: "bg-green-50 text-green-700",
  draft: "bg-orange-50 text-orange-600",
  archived: "bg-slate-100 text-slate-600",
};

export default function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getMyQuizzes()
      .then(setQuizzes)
      .catch((e) => setError(e.response?.data?.message || "Failed to load quizzes"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = quizzes.filter(
    (q) =>
      q.topic.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || q.status === status)
  );

  const goLive = async (id) => {
    try {
      setBusyId(id);
      const s = await createSession(id);
      navigate(`/teacher/session/${s.room_code}`);
    } catch (e) {
      setError(e.response?.data?.message || "Could not start session");
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this quiz and its questions?")) return;
    try {
      await deleteQuiz(id);
      setQuizzes((qs) => qs.filter((q) => q.id !== id));
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <TeacherLayout title="My Quizzes" subtitle="Manage all your quizzes in one place.">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:max-w-sm">
          <Search size={15} className="text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic..." className="w-full text-sm outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
          <option value="all">All status</option>
          <option value="ready">Ready</option>
          <option value="draft">Draft</option>
        </select>
        <Link to="/teacher/quizzes/new" className="ml-auto flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> New quiz
        </Link>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-slate-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            {quizzes.length === 0 ? "No quizzes yet." : "No quizzes match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Topic</th>
                  <th className="px-3 py-3 font-medium">Difficulty</th>
                  <th className="px-3 py-3 font-medium">Questions</th>
                  <th className="px-3 py-3 font-medium">Time</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link to={`/teacher/quizzes/${q.id}`} className="hover:text-indigo-600">{q.topic}</Link>
                    </td>
                    <td className="px-3 capitalize text-slate-600">{q.difficulty}</td>
                    <td className="px-3 text-slate-600">{q.num_questions}</td>
                    <td className="px-3 text-slate-600">{q.time_per_question}s</td>
                    <td className="px-3 text-slate-600">{new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                    <td className="px-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[q.status] || statusStyle.draft}`}>{q.status}</span>
                    </td>
                    <td className="px-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/teacher/quizzes/${q.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Review</Link>
                        <button onClick={() => goLive(q.id)} disabled={busyId === q.id}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
                          {busyId === q.id ? "..." : "Go live"}
                        </button>
                        <button onClick={() => remove(q.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}