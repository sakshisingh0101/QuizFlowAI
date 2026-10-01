// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import StudentLayout from "../components/StudentLayout.jsx";
// import { useAuth } from "../context/useAuth.js";
// import { getSessionByRoom } from "../api/session.api.js";

// export default function StudentDashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const join = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const s = await getSessionByRoom(code.trim().toUpperCase());
//       navigate(`/student/play/${s.room_code}`);
//     } catch (err) {
//       setError(err.response?.data?.message || "Room not found");
//       setLoading(false);
//     }
//   };

//   return (
//     <StudentLayout>
//       <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
//         <h1 className="text-2xl font-bold text-slate-900">Hi {user?.name?.split(" ")[0]} 👋</h1>
//         <p className="mt-1 text-sm text-slate-500">Enter the room code your teacher shared.</p>
//         <form onSubmit={join} className="mt-6 space-y-4">
//           <input
//             value={code}
//             onChange={(e) => setCode(e.target.value.toUpperCase())}
//             maxLength={6}
//             required
//             placeholder="K7M2PX"
//             className="w-full rounded-xl border border-slate-200 py-4 text-center font-mono text-3xl font-bold tracking-[0.4em] text-indigo-600 outline-none focus:border-indigo-500"
//           />
//           {error && <p className="text-sm text-red-600">{error}</p>}
//           <button
//             disabled={loading || code.length < 6}
//             className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
//           >
//             {loading ? "Checking..." : "Join quiz"}
//           </button>
//         </form>
//       </div>
//     </StudentLayout>
//   );
// }










import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Target, CheckCircle2 } from "lucide-react";
import StudentLayout from "../components/StudentLayout.jsx";
import { useAuth } from "../context/useAuth.js";
import { getSessionByRoom, getStudentHistory } from "../api/session.api.js";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    getStudentHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  const join = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const s = await getSessionByRoom(code.trim().toUpperCase());
      navigate(`/student/play/${s.room_code}`);
    } catch (err) {
      setError(err.response?.data?.message || "Room not found");
      setLoading(false);
    }
  };

  const totalC = history?.reduce((a, h) => a + h.correct, 0) ?? 0;
  const totalQ = history?.reduce((a, h) => a + h.total_questions, 0) ?? 0;
  const accuracy = totalQ ? Math.round((totalC / totalQ) * 100) : null;
  const bestRank = history?.length ? Math.min(...history.map((h) => h.rank)) : null;

  return (
    <StudentLayout>
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hi {user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the room code your teacher shared.</p>
        <form onSubmit={join} className="mx-auto mt-6 max-w-md space-y-4">
          <input
            value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} required
            placeholder="ABC123"
            className="w-full rounded-xl border border-slate-200 bg-white py-4 text-center font-mono text-3xl font-bold tracking-[0.4em] text-indigo-600 outline-none focus:border-indigo-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading || code.length < 6} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Checking..." : "Join classroom"}
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          [CheckCircle2, "text-green-600 bg-green-50", history?.length ?? "–", "Quizzes done"],
          [Target, "text-indigo-600 bg-indigo-50", accuracy !== null ? `${accuracy}%` : "–", "Accuracy"],
          [Trophy, "text-amber-600 bg-amber-50", bestRank ? `#${bestRank}` : "–", "Best rank"],
        ].map(([Icon, tint, val, label]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <span className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon size={17} /></span>
            <p className="text-xl font-bold text-slate-900">{val}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <h3 className="border-b border-slate-100 p-4 font-semibold text-slate-900">Recent results</h3>
        {history === null ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : history.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No quizzes yet. Join a room to get started!</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.map((h) => {
              const p = h.total_questions ? Math.round((h.correct / h.total_questions) * 100) : 0;
              return (
                <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{h.topic}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" · "}{h.correct}/{h.total_questions} correct · Rank #{h.rank} of {h.participants}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{h.score} pts</p>
                    <p className={`text-xs font-semibold ${p >= 70 ? "text-green-600" : p >= 40 ? "text-amber-600" : "text-red-500"}`}>{p}%</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </StudentLayout>
  );
}