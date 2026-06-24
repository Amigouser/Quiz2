import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import API from "./api";
import { LandingPage } from "./screens/landing";
import { LoginCompact } from "./screens/login";
import { StudentDashboard } from "./screens/dashboard";
import { QuizClassic, QuizResults } from "./screens/quiz";
import { AdminPanel } from "./screens/admin";
import FlashcardsRoute from "./screens/flashcards";
import TasksPage from "./screens/tasks";
import PrivacyPage from "./screens/privacy";
import CookiePage from "./screens/cookie";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    API.me()
      .then((d) => setUser(d.user))
      .catch((err) => {
        if (err.status === 410 || err.message === "account_deleted") setDeleted(true);
        setUser(null);
      })
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
  if (deleted) return <DeletedScreen />;
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

function DeletedScreen() {
  const plants = ["🌻", "🌹", "🌵", "🌿", "🌸", "🌷", "🎋", "💜", "🪴", "🌼"];
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        {/* Animated plant garden */}
        <div style={{ fontSize: 52, marginBottom: 8, letterSpacing: 6, lineHeight: 1.4 }}>
          {plants.slice(0, 5).map((p, i) => (
            <span key={i} style={{
              display: "inline-block",
              animation: `floatPlant 2.4s ease-in-out ${i * 0.3}s infinite alternate`,
            }}>{p}</span>
          ))}
        </div>

        <style>{`
          @keyframes floatPlant {
            from { transform: translateY(0px); }
            to   { transform: translateY(-10px); }
          }
        `}</style>

        {/* Card */}
        <div style={{
          background: "var(--surface)", borderRadius: 28,
          border: "1.5px solid var(--border-soft)",
          boxShadow: "0 20px 60px rgba(26,52,36,0.12)",
          padding: "40px 40px 36px",
          marginTop: 8,
        }}>
          <div style={{
            fontFamily: "var(--f-serif)", fontSize: 28, fontWeight: 500,
            lineHeight: 1.2, marginBottom: 16, color: "var(--text)",
          }}>
            Твой учебный курс<br/>
            <em style={{ color: "var(--green-800)" }}>завершён!</em>
          </div>

          <p style={{
            fontSize: 15, color: "var(--text-soft)", lineHeight: 1.75,
            marginBottom: 10,
          }}>
            Репетитор завершил занятия и закрыл твой профиль.
            Все твои результаты и выращенные растения
            сохранены у преподавателя.
          </p>

          <p style={{
            fontSize: 15, color: "var(--text-soft)", lineHeight: 1.75,
            marginBottom: 28,
          }}>
            Ты отлично поработал — желаем успехов
            на экзаменах и во всём остальном! 🎓
          </p>

          <div style={{
            height: 1, background: "var(--border-soft)", marginBottom: 24,
          }} />

          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Если ты считаешь, что это ошибка — напиши репетитору.
          </p>

          <button
            onClick={() => { window.location.href = "/"; }}
            style={{
              padding: "12px 28px", borderRadius: 14,
              background: "var(--green-800)", color: "#fff",
              fontWeight: 600, fontSize: 14, border: "none",
              cursor: "pointer", opacity: 1, transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            На главную страницу
          </button>
        </div>
      </div>
    </div>
  );
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
    API.getTests().then((response) => {
      const data = response.data || response;
      setQuizzes(
        data.map((q) => ({
          id: q.id,
          topic: q.topic || "Биология",
          title: q.title,
          description: q.description,
          category: q.category || null,
          section: q.section || null,
          part: q.part || null,
          line: q.line || null,
          source: q.source || null,
          questions: q.questions_count,
          questions_count: q.questions_count,
          est_minutes: q.est_minutes,
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
  const { user } = useAuth();
  const isAdmin = user?.is_admin;

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
          correct_indices: q.answers.map((a, i) => a.is_correct ? i : -1).filter(i => i >= 0),
          explain: q.explanation,
          question_type: q.question_type || "single",
          image_data: q.image_data || null,
          correct_text: q.correct_text || null,
          match_options: q.match_options || ["1", "2"],
          _questionId: q.id,
          _answerIds: q.answers.map((a) => a.id),
          _matchAnswers: q.answers,
        })),
      });
    });
  }, [id]);

  const handleStart = async () => {
    if (isAdmin) return;
    try {
      const d = await API.createAttempt(Number(id));
      setAttemptId(d.attempt_id);
    } catch (err) {
      console.error("createAttempt failed:", err);
    }
  };

  useEffect(() => {
    if (quiz && !attemptId) handleStart();
  }, [quiz]);

  const handleFinish = async (answers) => {
    if (!quiz) return;

    const localScore = answers.filter((a) => a.correct).length;
    const localMax = quiz.questions.length;

    if (isAdmin || !attemptId) {
      setResult({ score: localScore, max_score: localMax });
      return;
    }

    const payload = answers.map((a, i) => {
      const q = quiz.questions[i];
      const qType = q.question_type || "single";
      if (qType === "text_input") return { question_id: q._questionId, answer_text: a.typed || "" };
      if (qType === "matching" || qType === "fill_blanks") return { question_id: q._questionId, matches: a.matches || {} };
      if (qType === "multiple_select") return { question_id: q._questionId, answer_text: (a.selected || []).map(si => q._answerIds[si]).join(",") };
      if (qType === "sequence") return { question_id: q._questionId, answer_text: (a.order || []).map(si => q._answerIds[si]).join(",") };
      return { question_id: q._questionId, answer_id: q._answerIds[a.picked] };
    });

    try {
      const r = await API.submitAttempt(attemptId, payload);
      setResult(r);
    } catch (err) {
      console.error("submitAttempt failed:", err);
      setResult({ score: localScore, max_score: localMax });
    }
  };

  if (!quiz) return <Spinner />;

  if (result) {
    return (
      <QuizResults
        total={result.max_score}
        correct={result.score}
        quizTitle={quiz.title}
        isPreview={isAdmin}
        onRetry={() => { setResult(null); setAttemptId(null); handleStart(); }}
        onHome={() => navigate(isAdmin ? "/admin" : "/dashboard")}
      />
    );
  }

  return (
    <QuizClassic
      quiz={quiz}
      onFinish={handleFinish}
      onExit={() => navigate(isAdmin ? "/admin" : "/dashboard")}
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
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacy/" element={<PrivacyPage />} />
          <Route path="/cookie" element={<CookiePage />} />
          <Route path="/cookie/" element={<CookiePage />} />
          <Route path="/tasks" element={<TasksPage />} />
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
