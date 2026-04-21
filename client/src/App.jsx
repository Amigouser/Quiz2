import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import API from "./api";
import { LandingPage } from "./screens/landing";
import { LoginCompact } from "./screens/login";
import { StudentDashboard } from "./screens/dashboard";
import { QuizClassic, QuizResults } from "./screens/quiz";
import { AdminPanel } from "./screens/admin";
import FlashcardsRoute from "./screens/flashcards";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.me()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (code, password) => {
    const d = await API.login(code, password);
    setUser(d.user);
    return d.user;
  };

  const logout = async () => {
    await API.logout();
    setUser(null);
  };

  if (loading) return <Spinner />;
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <div style={{ fontFamily: "var(--f-serif)", fontSize: 18, color: "var(--green-800)", opacity: 0.6 }}>
        Загрузка…
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;

  const handleEnter = async (code, password) => {
    const u = await login(code, password);
    navigate("/dashboard", { replace: true });
  };

  return <LoginCompact onEnter={handleEnter} />;
}

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.is_admin) return <Navigate to="/admin" replace />;
  const [quizzes, setQuizzes] = useState([]);
  const [cardSets, setCardSets] = useState([]);

  useEffect(() => {
    API.getTests().then((data) => {
      setQuizzes(
        data.map((q) => ({
          id: q.id,
          topic: q.topic || "Биология",
          title: q.title,
          questions: q.questions_count,
          est: `${q.est_minutes} мин`,
          status: q.status,
          score: q.score,
          max_score: q.max_score,
          progress: q.max_score ? Math.round((q.score / q.max_score) * 100) : 0,
          is_assigned: q.is_assigned,
        }))
      );
    });
    API.getCardSets().then(setCardSets).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <StudentDashboard
      name={user.name}
      quizzes={quizzes}
      cardSets={cardSets}
      onOpenQuiz={(q) => navigate(`/quiz/${q.id}`)}
      onOpenCards={(s) => navigate(`/cards/${s.id}`)}
      onAdmin={user.is_admin ? () => navigate("/admin") : null}
      onLogout={handleLogout}
    />
  );
}

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    API.getTest(id).then((data) => {
      setQuiz({
        title: data.title,
        topic: data.topic,
        questions: data.questions.map((q) => ({
          q: q.text,
          note: q.hint,
          options: q.answers.map((a) => a.text),
          correct: q.correct_index,
          explain: q.explanation,
          _questionId: q.id,
          _answerIds: q.answers.map((a) => a.id),
        })),
      });
    });
  }, [id]);

  const handleStart = async () => {
    const d = await API.createAttempt(Number(id));
    setAttemptId(d.attempt_id);
  };

  useEffect(() => {
    if (quiz && !attemptId) handleStart();
  }, [quiz]);

  const handleFinish = async (answers) => {
    if (!attemptId || !quiz) return;
    const payload = answers.map((a, i) => ({
      question_id: quiz.questions[i]._questionId,
      answer_id: quiz.questions[i]._answerIds[a.picked],
    }));
    const r = await API.submitAttempt(attemptId, payload);
    setResult(r);
  };

  if (!quiz) return <Spinner />;

  if (result) {
    return (
      <QuizResults
        total={result.max_score}
        correct={result.score}
        quizTitle={quiz.title}
        onRetry={() => { setResult(null); setAttemptId(null); handleStart(); }}
        onHome={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <QuizClassic
      quiz={quiz}
      onFinish={handleFinish}
      onExit={() => navigate("/dashboard")}
    />
  );
}

function AdminPage() {
  return <AdminPanel />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/quiz/:id" element={<RequireAuth><QuizPage /></RequireAuth>} />
          <Route path="/cards/:id" element={<RequireAuth><FlashcardsRoute /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
