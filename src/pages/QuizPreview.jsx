import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2, Play, Check } from "lucide-react";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { getQuizById, updateQuestion, deleteQuestion } from "../api/quiz.api.js";
import { createSession } from "../api/session.api.js";

const input = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500";

function QuestionCard({ q, index, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const startEdit = () => {
    setDraft({
      questionText: q.question_text,
      options: [...q.options],
      correctOption: q.correct_option,
      explanation: q.explanation || "",
    });
    setEditing(true);
  };

  const save = async () => {
    if (draft.options.some((o) => !o.trim()) || !draft.questionText.trim()) {
      return setErr("Question and all 4 options are required");
    }
    try {
      setBusy(true);
      const updated = await updateQuestion(q.id, draft);
      onSaved(updated);
      setEditing(false);
      setErr("");
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteQuestion(q.id);
      onDeleted(q.id);
    } catch (e) {
      setErr(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-indigo-600">Q{index + 1}</p>
        <div className="flex gap-1">
          {!editing && (
            <button onClick={startEdit} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
          )}
          <button onClick={remove} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea rows={2} className={input} value={draft.questionText} onChange={(e) => setDraft({ ...draft, questionText: e.target.value })} />
          {draft.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" checked={draft.correctOption === i} onChange={() => setDraft({ ...draft, correctOption: i })} />
              <input className={input} value={opt} onChange={(e) => {
                const options = [...draft.options];
                options[i] = e.target.value;
                setDraft({ ...draft, options });
              }} />
            </div>
          ))}
          <textarea rows={2} className={input} placeholder="Explanation" value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} />
          <p className="text-xs text-slate-500">Radio button = correct answer</p>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={busy} className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Saving..." : "Save"}</button>
            <button onClick={() => setEditing(false)} className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="font-medium text-slate-900">{q.question_text}</p>
          <ul className="mt-3 space-y-2">
            {q.options.map((o, i) => (
              <li key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${i === q.correct_option ? "border-green-200 bg-green-50 text-green-800" : "border-slate-100 text-slate-700"}`}>
                {i === q.correct_option && <Check size={14} />} {o}
              </li>
            ))}
          </ul>
          {q.explanation && <p className="mt-3 text-xs text-slate-500">💡 {q.explanation}</p>}
          {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        </>
      )}
    </div>
  );
}

export default function QuizPreview() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getQuizById(quizId)
      .then((d) => { setQuiz(d.quiz); setQuestions(d.questions); })
      .catch((e) => setError(e.response?.data?.message || "Failed to load quiz"));
  }, [quizId]);

  const goLive = async () => {
    try {
      setStarting(true);
      const s = await createSession(quizId);
      navigate(`/teacher/session/${s.room_code}`);
    } catch (e) {
      setError(e.response?.data?.message || "Could not start session");
      setStarting(false);
    }
  };

  return (
    <TeacherLayout title="Review quiz" subtitle="Edit questions before going live.">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {quiz && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{quiz.topic}</h1>
              <p className="text-sm capitalize text-slate-500">
                {quiz.difficulty} · {questions.length} questions · {quiz.time_per_question}s each
              </p>
            </div>
            <button onClick={goLive} disabled={starting || questions.length === 0} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <Play size={14} /> {starting ? "Starting..." : "Go live"}
            </button>
          </div>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id} q={q} index={i}
                onSaved={(u) => setQuestions((qs) => qs.map((x) => (x.id === u.id ? u : x)))}
                onDeleted={(id) => setQuestions((qs) => qs.filter((x) => x.id !== id))}
              />
            ))}
          </div>
        </>
      )}
    </TeacherLayout>
  );
}