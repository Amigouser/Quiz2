import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "grid", placeItems: "center",
          background: "var(--bg)", padding: 24, fontFamily: "var(--f-sans)",
        }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
            <h2 style={{ fontFamily: "var(--f-serif)", fontSize: 24, marginBottom: 12 }}>
              Что-то пошло не так
            </h2>
            <p style={{ color: "var(--text-soft)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Произошла непредвиденная ошибка. Попробуй обновить страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 28px", borderRadius: 14,
                background: "var(--green-800)", color: "#fff",
                fontWeight: 600, fontSize: 14, border: "none",
                cursor: "pointer",
              }}
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
