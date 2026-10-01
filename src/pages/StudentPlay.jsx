import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/useAuth.js";

function Leaderboard({ rows, meId }) {
  return (
    <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-left">
      {rows.map((r, i) => (
        <li key={r.student_id} className={`flex items-center justify-between px-4 py-3 text-sm ${r.student_id === meId ? "bg-indigo-50 font-semibold" : ""}`}>
          <span><span className="mr-3 text-slate-400">#{i + 1}</span>{r.name}</span>
          <span className="text-indigo-600">{r.score} pts</span>
        </li>
      ))}
    </ol>
  );
}

export default function StudentPlay() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();

  const [phase, setPhase] = useState("joining"); // joining | lobby | question | answered | reveal | finished
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!socket) return;
    const join = () => socket.emit("join_quiz", { roomCode });
    if (socket.connected) join();
    socket.on("connect", join);

    socket.on("joined_room", () => setPhase((p) => (p === "joining" ? "lobby" : p)));
    socket.on("question_started", (q) => {
      setQuestion(q); setSelected(null); setReveal(null); setError("");
      setDeadline(Date.now() + q.timeLimit * 1000);
      setPhase("question");
    });
    socket.on("question_ended", (r) => { setReveal(r); setPhase("reveal"); });
    socket.on("leaderboard_updated", (d) => setLeaderboard(d.leaderboard));
    socket.on("quiz_finished", (d) => { setLeaderboard(d.finalLeaderboard); setPhase("finished"); });
    socket.on("error_message", (m) => {
      if (m === "Room not found or session ended") { setError(m); setPhase("joining"); }
      else setError(m);
    });

    return () => {
      ["connect", "joined_room", "question_started", "question_ended", "leaderboard_updated", "quiz_finished", "error_message"]
        .forEach((e) => socket.off(e));
    };
  }, [socket, roomCode]);

  useEffect(() => {
    if (!deadline || (phase !== "question" && phase !== "answered")) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline, phase]);

  const answer = (i) => {
    if (phase !== "question") return;
    setSelected(i);
    setPhase("answered");
    socket.emit("submit_answer", { questionId: question.questionId, selectedOption: i });
  };

  const me = leaderboard.find((r) => r.student_id === user?.id);

  return (
    <StudentLayout>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {phase === "joining" && (
        <div className="mt-16 text-center text-slate-500">
          {error ? <button onClick={() => navigate("/student/dashboard")} className="text-indigo-600 underline">Back</button> : "Joining room..."}
        </div>
      )}

      {phase === "lobby" && (
        <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-xs font-semibold tracking-wider text-indigo-600">ROOM {roomCode}</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">You're in! 🎉</h2>
          <p className="mt-1 text-sm text-slate-500">Waiting for the teacher to start the quiz...</p>
        </div>
      )}

      {(phase === "question" || phase === "answered") && question && (
        <div>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">Question {question.questionNumber} / {question.totalQuestions}</span>
            <span className={`rounded-full px-3 py-1 font-bold ${secondsLeft <= 5 ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"}`}>{secondsLeft}s</span>
          </div>
          <h2 className="mb-5 text-xl font-bold text-slate-900">{question.questionText}</h2>
          <div className="space-y-3">
            {question.options.map((o, i) => (
              <button
                key={i} onClick={() => answer(i)} disabled={phase === "answered"}
                className={`w-full rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                  selected === i ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white hover:border-indigo-300"
                } disabled:cursor-not-allowed`}
              >
                <span className="mr-3 text-slate-400">{"ABCD"[i]}</span>{o}
              </button>
            ))}
          </div>
          {phase === "answered" && <p className="mt-5 text-center text-sm text-slate-500">Answer locked in. Waiting for time to end...</p>}
        </div>
      )}

      {phase === "reveal" && question && reveal && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-900">{question.questionText}</h2>
          <div className="space-y-2">
            {question.options.map((o, i) => {
              const correct = i === reveal.correctOption;
              const wrongPick = selected === i && !correct;
              return (
                <div key={i} className={`rounded-xl border px-4 py-3 text-sm ${correct ? "border-green-300 bg-green-50 text-green-800" : wrongPick ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}>
                  {o} {selected === i && <span className="ml-1 text-xs">(your answer)</span>}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm font-semibold">
            {selected === null ? "⏰ You didn't answer" : selected === reveal.correctOption ? "✅ Correct! +10" : "❌ Not quite"}
          </p>
          {reveal.explanation && <p className="mt-1 text-sm text-slate-500">💡 {reveal.explanation}</p>}
          {leaderboard.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Leaderboard</h3>
              <Leaderboard rows={leaderboard.slice(0, 5)} meId={user?.id} />
            </div>
          )}
          <p className="mt-6 text-center text-sm text-slate-400">Waiting for the next question...</p>
        </div>
      )}

      {phase === "finished" && (
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Quiz finished 🏁</h2>
          {me && <p className="mt-1 text-slate-500">You scored <span className="font-bold text-indigo-600">{me.score}</span> points</p>}
          <div className="mt-6"><Leaderboard rows={leaderboard} meId={user?.id} /></div>
          <button onClick={() => navigate("/student/dashboard")} className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white">Back to home</button>
        </div>
      )}
    </StudentLayout>
  );
}