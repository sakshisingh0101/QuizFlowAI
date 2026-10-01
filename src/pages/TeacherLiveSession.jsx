import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, SkipForward, Users } from "lucide-react";
import TeacherLayout from "../components/TeacherLayout.jsx";
import { useSocket } from "../context/SocketContext.jsx";

export default function TeacherLiveSession() {
  const { roomCode } = useParams();
  const socket = useSocket();

  const [status, setStatus] = useState("joining"); // joining | waiting | live | finished
  const [students, setStudents] = useState([]);
  const [question, setQuestion] = useState(null);
  const [answered, setAnswered] = useState(0);
  const [reveal, setReveal] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [report, setReport] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket) return;
    const join = () => socket.emit("join_quiz", { roomCode });
    if (socket.connected) join();
    socket.on("connect", join);

    socket.on("joined_room", (d) => setStatus((s) => (s === "joining" ? (d.status === "live" ? "live" : "waiting") : s)));
    socket.on("student_joined", (st) =>
      setStudents((prev) => (prev.some((p) => p.id === st.id) ? prev : [...prev, st]))
    );
    socket.on("question_started", (q) => {
      setQuestion(q); setAnswered(0); setReveal(null); setError("");
      setDeadline(Date.now() + q.timeLimit * 1000);
      setStatus("live");
    });
    socket.on("answer_count_updated", (d) => setAnswered(d.totalAnswered));
    socket.on("question_ended", (r) => { setReveal(r); setDeadline(null); });
    socket.on("leaderboard_updated", (d) => setLeaderboard(d.leaderboard));
    socket.on("quiz_finished", (d) => { setLeaderboard(d.finalLeaderboard); setStatus("finished"); setDeadline(null); });
    socket.on("performance_report", setReport);
    socket.on("error_message", setError);

    return () => {
      ["connect", "joined_room", "student_joined", "question_started", "answer_count_updated", "question_ended", "leaderboard_updated", "quiz_finished", "performance_report", "error_message"]
        .forEach((e) => socket.off(e));
    };
  }, [socket, roomCode]);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline]);

  const isLast = question && question.questionNumber === question.totalQuestions;

  return (
    <TeacherLayout title="Live session" subtitle="Control the quiz in real time.">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-indigo-600">ROOM CODE</p>
          <p className="font-mono text-4xl font-bold tracking-[0.3em] text-indigo-600">{roomCode}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Users size={18} /> <span className="text-xl font-bold">{students.length}</span> joined
        </div>
        <div className="flex gap-2">
          {status === "waiting" && (
            <button onClick={() => socket.emit("start_quiz")} disabled={students.length === 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <Play size={14} /> Start quiz
            </button>
          )}
          {status === "live" && (
            <button onClick={() => socket.emit("next_question")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              <SkipForward size={14} /> {isLast ? "Finish quiz" : reveal ? "Next question" : "End question & continue"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {status === "joining" && <p className="text-slate-500">Connecting...</p>}

          {status === "waiting" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-3 font-semibold text-slate-900">Lobby</h3>
              {students.length === 0 ? (
                <p className="text-sm text-slate-500">Waiting for students to join with the code above...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {students.map((s) => (
                    <span key={s.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {status === "live" && question && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Question {question.questionNumber} / {question.totalQuestions}</span>
                {deadline ? (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-600">{secondsLeft}s</span>
                ) : (
                  <span className="text-xs font-semibold text-green-600">TIME UP</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{question.questionText}</h3>
              <ul className="mt-4 space-y-2">
                {question.options.map((o, i) => {
                  const count = reveal?.stats?.find((s) => s.selected_option === i)?.count || 0;
                  const correct = reveal && reveal.correctOption === i;
                  return (
                    <li key={i} className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${correct ? "border-green-300 bg-green-50 text-green-800" : "border-slate-200 text-slate-700"}`}>
                      <span><span className="mr-2 text-slate-400">{"ABCD"[i]}</span>{o}</span>
                      {reveal && <span className="text-xs font-semibold">{count} picked</span>}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-sm text-slate-500">
                <span className="font-bold text-slate-900">{answered}</span> / {students.length} answered
              </p>
              {reveal?.explanation && <p className="mt-2 text-sm text-slate-500">💡 {reveal.explanation}</p>}
            </div>
          )}

          {status === "finished" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-bold text-slate-900">Quiz finished 🏁</h3>
              {report ? (
                <div className="mt-4 space-y-3 text-sm">
                  <p className="text-slate-700">{report.summary}</p>
                  <p><span className="font-semibold">Overall accuracy:</span> {report.overallAccuracy}%</p>
                  <div>
                    <p className="font-semibold text-green-700">Strong areas</p>
                    <ul className="list-disc pl-5 text-slate-600">{report.strongAreas?.map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">Weak areas</p>
                    <ul className="list-disc pl-5 text-slate-600">{report.weakAreas?.map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                  <p className="rounded-xl bg-indigo-50 p-3 text-indigo-800">💡 {report.recommendation}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">AI performance report is being generated...</p>
              )}
              <Link to="/teacher/dashboard" className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Back to dashboard</Link>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4 font-semibold text-slate-900">Leaderboard</div>
          {leaderboard.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Scores appear after the first question.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {leaderboard.map((r, i) => (
                <li key={r.student_id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span><span className="mr-2 text-slate-400">#{i + 1}</span>{r.name}</span>
                  <span className="font-semibold text-indigo-600">{r.score}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}