import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { generateQuiz } from "../api/quiz.api.js";

const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    topic: "", difficulty: "medium", learningGoal: "", numQuestions: 5, timePerQuestion: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { quiz } = await generateQuiz({
        ...form,
        numQuestions: Number(form.numQuestions),
        timePerQuestion: Number(form.timePerQuestion),
      });
      navigate(`/teacher/quizzes/${quiz.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Generation failed, try again");
      setLoading(false);
    }
  };

  return (
    <TeacherLayout title="Create Quiz" subtitle="Describe your quiz and let AI write the questions.">
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
          <input required maxLength={200} className={field} value={form.topic} onChange={set("topic")} placeholder="e.g. Dynamic Programming" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Difficulty</label>
            <select className={field} value={form.difficulty} onChange={set("difficulty")}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Questions (1-20)</label>
            <input type="number" min={1} max={20} className={field} value={form.numQuestions} onChange={set("numQuestions")} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Seconds / question</label>
            <input type="number" min={5} max={300} className={field} value={form.timePerQuestion} onChange={set("timePerQuestion")} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Learning goal (optional)</label>
          <textarea rows={3} maxLength={500} className={field} value={form.learningGoal} onChange={set("learningGoal")} placeholder="What should students understand after this quiz?" />
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          <Sparkles size={16} /> {loading ? "Generating... (can take 10-40s)" : "Generate with AI"}
        </button>
      </form>
    </TeacherLayout>
  );
}