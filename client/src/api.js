async function req(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || "Ошибка запроса"), { status: res.status });
  }
  return res.json();
}

const API = {
  login: (code, password) => req("/api/auth/login", { method: "POST", body: { code, password } }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  me: () => req("/api/auth/me"),

  getPublicTests: () => req("/api/tests/public"),
  getPublicTest: (id) => req(`/api/tests/public/${id}`),
  getPublicCardSets: () => req("/api/flashcard-sets/public"),
  getPublicCardSet: (id) => req(`/api/flashcard-sets/public/${id}`),
  getTests: () => req("/api/tests"),
  getTest: (id) => req(`/api/tests/${id}`),
  createAttempt: (test_id) => req("/api/attempts", { method: "POST", body: { test_id } }),
  submitAttempt: (id, answers) =>
    req(`/api/attempts/${id}/submit`, { method: "POST", body: { answers } }),

  getCardSets: () => req("/api/flashcard-sets"),
  getCardSet: (id) => req(`/api/flashcard-sets/${id}`),

  admin: {
    getTests: () => req("/api/admin/tests"),
    getTest: (id) => req(`/api/admin/tests/${id}`),
    createTest: (data) => req("/api/admin/tests", { method: "POST", body: data }),
    updateTest: (id, data) => req(`/api/admin/tests/${id}`, { method: "PUT", body: data }),
    deleteTest: (id) => req(`/api/admin/tests/${id}`, { method: "DELETE" }),
    toggleTest: (id) => req(`/api/admin/tests/${id}/toggle`, { method: "PATCH" }),
    publishTest: (id) => req(`/api/admin/tests/${id}/publish`, { method: "PATCH" }),
    getStudents: () => req("/api/admin/students"),
    getStudent: (id) => req(`/api/admin/students/${id}`),
    assignTest: (studentId, test_id) =>
      req(`/api/admin/students/${studentId}/assign`, { method: "POST", body: { test_id } }),
    unassignTest: (studentId, testId) =>
      req(`/api/admin/students/${studentId}/assign/${testId}`, { method: "DELETE" }),
    createStudent: (name, group_name) => req("/api/admin/students", { method: "POST", body: { name, group_name } }),
    deleteStudent: (id) => req(`/api/admin/students/${id}`, { method: "DELETE" }),
    getResults: () => req("/api/admin/results"),
    deleteResult: (id) => req(`/api/admin/results/${id}`, { method: "DELETE" }),
    deleteAllResults: () => req("/api/admin/results", { method: "DELETE" }),
    getCardSets: () => req("/api/admin/flashcard-sets"),
    getCardSet: (id) => req(`/api/admin/flashcard-sets/${id}`),
    createCardSet: (data) => req("/api/admin/flashcard-sets", { method: "POST", body: data }),
    updateCardSet: (id, data) => req(`/api/admin/flashcard-sets/${id}`, { method: "PUT", body: data }),
    deleteCardSet: (id) => req(`/api/admin/flashcard-sets/${id}`, { method: "DELETE" }),
    toggleCardSet: (id) => req(`/api/admin/flashcard-sets/${id}/toggle`, { method: "PATCH" }),
    getStudentCardSets: (studentId) => req(`/api/admin/students/${studentId}/card-sets`),
    assignCardSet: (studentId, set_id) =>
      req(`/api/admin/students/${studentId}/card-sets`, { method: "POST", body: { set_id } }),
    unassignCardSet: (studentId, setId) =>
      req(`/api/admin/students/${studentId}/card-sets/${setId}`, { method: "DELETE" }),
  },
};

export default API;
