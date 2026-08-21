import { useState, useEffect, useRef, useMemo } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, addDoc, deleteDoc, doc, query, orderBy,
} from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qccvubyxfhrwpgsngqgj.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjY3Z1Ynl4Zmhyd3Bnc25ncWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTAxOTcsImV4cCI6MjEwMjg4NjE5N30.EaSk6RhBTZ2qI3Hbs2lI_bMlLoajzDuIyhuXtQFgZw8";
const BUCKET = "Fatture";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtBytes(b) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}
function getAnno(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.getFullYear();
}

// ── Stili ──────────────────────────────────────────────────────────────────
const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" };
const cardStyle = { background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" };
const btnPrimary = { padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#111", color: "#fff", border: "none", fontWeight: 500 };
const btnSecondary = { padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "transparent", color: "#888", border: "0.5px solid #ccc" };
const btnDanger = { ...btnSecondary, color: "#e24b4a", border: "0.5px solid #f7c1c1" };

// ── Componente principale ──────────────────────────────────────────────────
export default function FattureCliente({ cliente, onClose }) {
  const [fatture, setFatture]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState(false);
  const [progress, setProgress]           = useState(0);
  const [dragOver, setDragOver]           = useState(false);
  const [toast, setToast]                 = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroAnno, setFiltroAnno]       = useState("");
  const [anteprimaUrl, setAnteprimaUrl]   = useState(null);
  const [anteprimaNome, setAnteprimaNome] = useState("");
  const fileInputRef = useRef(null);

  const colRef = useMemo(
    () => collection(db, "clienti", cliente.id, "fatture"),
    [cliente.id]
  );

  // ── Carica lista ──────────────────────────────────────────────────────
  useEffect(() => {
    async function carica() {
      try {
        const q = query(colRef, orderBy("dataCaricamento", "desc"));
        const snap = await getDocs(q);
        setFatture(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Errore caricamento fatture:", e);
        showToast("Errore nel caricamento delle fatture", "error");
      } finally {
        setLoading(false);
      }
    }
    carica();
  }, [colRef]);

  // ── Anni disponibili (calcolati dalle fatture caricate) ───────────────
  const anniDisponibili = useMemo(() => {
    const anni = new Set(fatture.map((f) => getAnno(f.dataCaricamento)).filter(Boolean));
    return [...anni].sort((a, b) => b - a);
  }, [fatture]);

  // ── Fatture filtrate per anno ─────────────────────────────────────────
  const fattureFiltrate = useMemo(() => {
    if (!filtroAnno) return fatture;
    return fatture.filter((f) => getAnno(f.dataCaricamento) === parseInt(filtroAnno, 10));
  }, [fatture, filtroAnno]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Upload ────────────────────────────────────────────────────────────
  async function uploadFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") { showToast("Puoi caricare solo file PDF", "error"); return; }
    if (file.size > 10 * 1024 * 1024)   { showToast("Il file supera i 10 MB", "error"); return; }

    setUploading(true);
    setProgress(10);

    const storagePath = `${cliente.id}/${Date.now()}_${file.name}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: "application/pdf", upsert: false });

    if (upErr) {
      console.error("Errore upload Supabase:", upErr);
      showToast("Errore durante il caricamento: " + upErr.message, "error");
      setUploading(false);
      setProgress(0);
      return;
    }

    setProgress(70);
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const url = urlData?.publicUrl;
    setProgress(90);

    try {
      const nuova = {
        nome: file.name, url, storagePath,
        dimensione: file.size,
        dataCaricamento: new Date().toISOString(),
      };
      const docRef = await addDoc(colRef, nuova);
      setFatture((prev) => [{ id: docRef.id, ...nuova }, ...prev]);
      showToast(`Fattura "${file.name}" caricata`);
    } catch (e) {
      console.error("Errore Firestore:", e);
      showToast("Caricamento riuscito ma errore nel salvataggio metadati", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  // ── Eliminazione ──────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      const { error: delErr } = await supabase.storage.from(BUCKET).remove([confirmDelete.storagePath]);
      if (delErr) console.warn("Errore eliminazione Supabase:", delErr);
      await deleteDoc(doc(db, "clienti", cliente.id, "fatture", confirmDelete.id));
      setFatture((prev) => prev.filter((f) => f.id !== confirmDelete.id));
      showToast("Fattura eliminata");
    } catch (e) {
      console.error("Errore eliminazione:", e);
      showToast("Errore nell'eliminazione", "error");
    } finally {
      setConfirmDelete(null);
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────
  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }
  function handleDragOver(e) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={overlayStyle}>
      <div style={{ ...cardStyle, width: "100%", maxWidth: 600, margin: "1rem", maxHeight: "90vh", display: "flex", flexDirection: "column", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "0.5px solid #e0e0e0" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>🧾 Fatture emesse</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{cliente.azienda}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `1.5px dashed ${dragOver ? "#185fa5" : uploading ? "#1d9e75" : "#ccc"}`,
            borderRadius: 10,
            background: dragOver ? "#e6f1fb" : uploading ? "#e1f5ee" : "#fafafa",
            padding: "1.25rem 1rem", textAlign: "center",
            cursor: uploading ? "default" : "pointer",
            transition: "all 0.15s", marginBottom: "1rem",
          }}
        >
          <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: "none" }}
            onChange={(e) => uploadFile(e.target.files?.[0])} />
          {uploading ? (
            <>
              <div style={{ fontSize: 20, marginBottom: 6 }}>⬆️</div>
              <div style={{ fontSize: 13, color: "#1d9e75", fontWeight: 500, marginBottom: 8 }}>Caricamento in corso… {progress}%</div>
              <div style={{ height: 4, background: "#e0e0e0", borderRadius: 99, overflow: "hidden", maxWidth: 280, margin: "0 auto" }}>
                <div style={{ height: "100%", borderRadius: 99, background: "#1d9e75", width: `${progress}%`, transition: "width 0.3s" }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📂</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: dragOver ? "#185fa5" : "#333", marginBottom: 3 }}>
                {dragOver ? "Rilascia qui il PDF" : "Trascina qui le fatture PDF"}
              </div>
              <div style={{ fontSize: 12, color: "#aaa" }}>oppure clicca per scegliere · max 10 MB</div>
            </>
          )}
        </div>

        {/* ── Filtro anno + contatore ── */}
        {!loading && fatture.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
            {/* Pill anni */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                onClick={() => setFiltroAnno("")}
                style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 99, cursor: "pointer",
                  border: `0.5px solid ${!filtroAnno ? "#111" : "#ccc"}`,
                  background: !filtroAnno ? "#111" : "transparent",
                  color: !filtroAnno ? "#fff" : "#888",
                  fontWeight: !filtroAnno ? 500 : 400,
                }}
              >
                Tutti
              </button>
              {anniDisponibili.map((a) => (
                <button
                  key={a}
                  onClick={() => setFiltroAnno(String(a))}
                  style={{
                    fontSize: 12, padding: "4px 12px", borderRadius: 99, cursor: "pointer",
                    border: `0.5px solid ${filtroAnno === String(a) ? "#185fa5" : "#ccc"}`,
                    background: filtroAnno === String(a) ? "#e6f1fb" : "transparent",
                    color: filtroAnno === String(a) ? "#185fa5" : "#888",
                    fontWeight: filtroAnno === String(a) ? 500 : 400,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            {/* Contatore */}
            <span style={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap", flexShrink: 0 }}>
              {filtroAnno
                ? `${fattureFiltrate.length} di ${fatture.length}`
                : `${fatture.length} totale${fatture.length !== 1 ? "i" : ""}`}
            </span>
          </div>
        )}

        {/* Lista fatture */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#aaa", fontSize: 13 }}>Caricamento…</div>
          ) : fattureFiltrate.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#bbb", fontSize: 13 }}>
              {fatture.length === 0
                ? "Nessuna fattura ancora caricata per questo cliente."
                : `Nessuna fattura nel ${filtroAnno}.`}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fattureFiltrate.map((f) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "0.5px solid #e8e8e8", borderRadius: 8, background: "#fafafa" }}>
                  <div style={{ width: 34, height: 34, background: "#fcebeb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nome}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{fmtDate(f.dataCaricamento)} · {fmtBytes(f.dimensione)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => { setAnteprimaUrl(f.url); setAnteprimaNome(f.nome); }}
                      style={{ ...btnPrimary, fontSize: 12 }}
                    >
                      👁 Anteprima
                    </button>
                    <button onClick={() => setConfirmDelete({ id: f.id, nome: f.nome, storagePath: f.storagePath })}
                      style={{ ...btnDanger, fontSize: 12 }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal anteprima PDF inline */}
      {anteprimaUrl && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setAnteprimaUrl(null); }}
          style={{ ...overlayStyle, zIndex: 300, alignItems: "stretch", padding: "1rem" }}
        >
          <div style={{ ...cardStyle, width: "100%", maxWidth: 860, display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
            {/* Header anteprima */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "0.5px solid #e0e0e0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {anteprimaNome}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                <a
                  href={anteprimaUrl}
                  download={anteprimaNome}
                  style={{ ...btnSecondary, fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  ⬇ Scarica
                </a>
                <button
                  onClick={() => setAnteprimaUrl(null)}
                  style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1, padding: "0 4px" }}
                >
                  ×
                </button>
              </div>
            </div>
            {/* Viewer PDF */}
            <iframe
              src={anteprimaUrl}
              title={anteprimaNome}
              style={{ flex: 1, border: "none", minHeight: "70vh", width: "100%", background: "#f5f5f5" }}
            />
          </div>
        </div>
      )}

      {/* Modal eliminazione */}
      {confirmDelete && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }} style={{ ...overlayStyle, zIndex: 300 }}>
          <div style={{ ...cardStyle, maxWidth: 380, margin: "1rem", width: "100%" }}>
            <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
              <h2 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 8px" }}>Elimina fattura</h2>
              <p style={{ fontSize: 13, color: "#555", margin: "0 0 6px" }}>Stai per eliminare:</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#111", margin: "0 0 14px", wordBreak: "break-all" }}>{confirmDelete.nome}</p>
              <p style={{ fontSize: 12, color: "#e24b4a", background: "#fff5f5", border: "0.5px solid #f7c1c1", borderRadius: 8, padding: "7px 12px", margin: "0 0 18px" }}>
                ⚠️ La fattura verrà eliminata definitivamente.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button onClick={() => setConfirmDelete(null)} style={{ ...btnSecondary, minWidth: 90 }}>Annulla</button>
                <button onClick={handleDelete} style={{ ...btnPrimary, background: "#e24b4a", minWidth: 90 }}>Elimina</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#fff", border: "0.5px solid #ccc", borderLeft: toast.type === "error" ? "3px solid #e24b4a" : "3px solid #1d9e75", borderRadius: 8, padding: "10px 16px", fontSize: 13, zIndex: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}