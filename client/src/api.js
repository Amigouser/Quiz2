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
  login: (name) => req("/api/auth/login", { method: "POST", body: { name } }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  me: () => req("/api/auth/me"),

  getTests: () => req("/api/tests"),
  getTest: (id) => req(`/api/tests/${id}`),
  createAttempt: (test_id) => req("/api/attempts", { method: "POST", body: { test_id } }),
  submitAttempt: (id, answers) =>
    req(`/api/attempts/${id}/submit`, { method: "POST", body: { answers } }),

  admin: {
    getTests: () => req("/api/admin/tests"),
    createTest: (data) => req("/api/admin/tests", { method: "POST", body: data }),
    updateTest: (id, data) => req(`/api/admin/tests/${id}`, { method: "PUT", body: data }),
    deleteTest: (id) => req(`/api/admin/tests/${id}`, { method: "DELETE" }),
    toggleTest: (id) => req(`/api/admin/tests/${id}/toggle`, { method: "PATCH" }),
    publishTest: (id) => req(`/api/admin/tests/${id}/publish`, { method: "PATCH" }),
    getStudents: () => req("/api/admin/students"),
    getResults: () => req("/api/admin/results"),
  },
};

export default API;
