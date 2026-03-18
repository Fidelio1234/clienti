import { useState } from "react";
import { PASSWORD_ACCESSO } from "../auth";

export default function Login({ onAccesso }) {
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password === PASSWORD_ACCESSO) {
      onAccesso();
    } else {
      setErrore(true);
      setPassword("");
      setTimeout(() => setErrore(false), 2000);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#f5f5f5", fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "2.5rem 2rem",
        width: "100%", maxWidth: 360, boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "0.5px solid #e0e0e0"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔧</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>DMI</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Inserisci il codice di accesso</div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Codice accesso"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrore(false); }}
            autoFocus
            style={{
              width: "100%", height: 44, padding: "0 14px",
              border: errore ? "1.5px solid #e24b4a" : "0.5px solid #ccc",
              borderRadius: 10, fontSize: 16, boxSizing: "border-box",
              background: errore ? "#fff5f5" : "#fafafa",
              outline: "none", fontFamily: "sans-serif",
              transition: "border 0.2s, background 0.2s"
            }}
          />
          {errore && (
            <div style={{ color: "#e24b4a", fontSize: 12, marginTop: 6, textAlign: "center" }}>
              ⚠️ Codice errato, riprova
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%", height: 44, marginTop: 16, borderRadius: 10,
              background: "#111", color: "#fff", border: "none",
              fontSize: 15, fontWeight: 500, cursor: "pointer"
            }}
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}