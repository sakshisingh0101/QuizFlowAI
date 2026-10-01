// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./context/useAuth.js";

// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import VerifyEmail from "./pages/VerifyEmail.jsx";

// function App() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-bg">
//         <p className="text-gray-500 text-sm">Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* Public routes */}
//       <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} />} />
//       <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} />} />
//       <Route path="/verify-email" element={<VerifyEmail />} />

//       {/* Default route */}
//       <Route path="/" element={<Navigate to={user ? (user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard") : "/login"} />} />

//       {/* Teacher/Student dashboard routes — abhi placeholder, baad mein banenge */}
//       {/* <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} /> */}
//       {/* <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} /> */}

//       {/* Catch-all */}
//       <Route path="*" element={<Navigate to="/login" />} />
//     </Routes>
//   );
// }

// export default App;


import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import QuizPreview from "./pages/QuizPreview.jsx";
import TeacherLiveSession from "./pages/TeacherLiveSession.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentPlay from "./pages/StudentPlay.jsx";
import MyQuizzes from "./pages/MyQuizzes.jsx";
import LiveSessions from "./pages/LiveSessions.jsx";
import SessionResults from "./pages/SessionResults.jsx";
import Analytics from "./pages/Analytics.jsx";

// Abhi placeholders, ek-ek karke real pages se replace honge
const Placeholder = ({ name }) => <div className="p-8 text-xl">{name}</div>;

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  const home = user ? `/${user.role}/dashboard` : "/login";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={home} replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={home} replace />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/" element={<Navigate to={home} replace />} />

      {/* Teacher routes */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/quizzes/new" element={<ProtectedRoute role="teacher"><CreateQuiz /></ProtectedRoute>} />
      <Route path="/teacher/quizzes/:quizId" element={<ProtectedRoute role="teacher"><QuizPreview /></ProtectedRoute>} />
      <Route path="/teacher/session/:roomCode" element={<ProtectedRoute role="teacher"><TeacherLiveSession /></ProtectedRoute>} />
      {/* Student routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/play/:roomCode" element={<ProtectedRoute role="student"><StudentPlay /></ProtectedRoute>} />
      <Route path="/teacher/quizzes" element={<ProtectedRoute role="teacher"><MyQuizzes /></ProtectedRoute>} />
      <Route path="/teacher/sessions" element={<ProtectedRoute role="teacher"><LiveSessions /></ProtectedRoute>} />
      <Route path="/teacher/sessions/:sessionId" element={<ProtectedRoute role="teacher"><SessionResults /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><Analytics /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}

export default App;