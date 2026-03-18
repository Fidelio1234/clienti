import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import ModuloIntervento from "./ModuloIntervento";



function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" })
    + " " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

// ===== RIGA DETTAGLIO CAMPO =====
function RigaDettaglio({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12, padding: "2px 0", borderBottom: "0.5px solid #f5f5f5" }}>
      <span style={{ color: "#888", minWidth: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#111", fontWeight: 400 }}>{value}</span>
    </div>
  );
}

// ===== PANNELLO DETTAGLIO INTERVENTO =====
function DettaglioIntervento({ intervento, onRiapri, onElimina }) {
  const d = intervento.dati;

  return (
    <div style={{ padding: "1rem 1.5rem", background: "#fafafa", borderTop: "0.5px solid #e0e0e0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem 2rem", marginBottom: "1rem" }}>

        {/* Colonna sinistra */}
        <div>
          <SezDettaglio>Dati Cliente</SezDettaglio>
          <RigaDettaglio label="Azienda" value={intervento.aziendaCliente} />
          <RigaDettaglio label="P.IVA" value={intervento.pivaCliente} />
          <RigaDettaglio label="Cod. Fiscale" value={d.codFiscale} />
          <RigaDettaglio label="Sede legale" value={d.sedeCliente} />
          <RigaDettaglio label="CAP" value={d.capSede} />
          <RigaDettaglio label="Comune" value={d.comuneSede} />
          <RigaDettaglio label="Provincia" value={d.provSede} />
          <RigaDettaglio label="PEC" value={d.pec} />
          <RigaDettaglio label="Rif. SDI" value={d.rifSDI} />

          <SezDettaglio>Registratore Telematico</SezDettaglio>
          <RigaDettaglio label="Marca" value={d.marcaRT} />
          <RigaDettaglio label="Modello" value={d.modelloRT} />
          <RigaDettaglio label="Matricola" value={d.matricolaRT} />
          <RigaDettaglio label="Ultimo firmware" value={d.ultimoFirmware} />
          <RigaDettaglio label="Ubicazione" value={d.ubicazioneFissa ? "Sede fissa" : "Area pubblica"} />
        </div>

        {/* Colonna destra */}
        <div>
          <SezDettaglio>Intervento</SezDettaglio>
          <RigaDettaglio label="Richiesta N." value={d.richiestaNum} />
          <RigaDettaglio label="Data richiesta" value={fmtDate(d.dataRichiesta)} />
          <RigaDettaglio label="Ora" value={d.ora} />
          <RigaDettaglio label="Tipo intervento" value={d.interventoRichiesto} />
          <RigaDettaglio label="Descrizione" value={d.descrizioneIntervento} />
          <RigaDettaglio label="Luogo esecuzione" value={
            d.luogoIntervento === "cliente" ? "Presso il cliente"
            : d.luogoIntervento === "laboratorio" ? "Presso il laboratorio"
            : "Intervento da remoto"
          } />
          <RigaDettaglio label="Riferimento commerciale" value={
            d.riferimentiCommerciali === "pagamento" ? "A pagamento"
            : d.riferimentiCommerciali === "garanzia" ? "In garanzia"
            : "Cliente in abbonamento"
          } />
          {d.riferimentiCommerciali === "garanzia" && <RigaDettaglio label="Rif. fattura garanzia" value={d.rifFatturaGaranzia} />}
          {d.riferimentiCommerciali === "abbonamento" && <RigaDettaglio label="Scadenza abbonamento" value={fmtDate(d.scadenzaAbbonamento)} />}

          <SezDettaglio>Costi</SezDettaglio>
          <RigaDettaglio label="Diritto di chiamata" value={d.dirittoDiChiamata ? `€ ${d.dirittoDiChiamata}` : null} />
          <RigaDettaglio label="Ore di lavoro" value={d.orelavoro && d.costoOrario ? `${d.orelavoro}h × € ${d.costoOrario}/h` : d.orelavoro ? `${d.orelavoro}h` : null} />
          <RigaDettaglio label="Verificazione periodica" value={d.verificazionePeriodica ? "Sì" : "No"} />
          <RigaDettaglio label="Totale intervento" value={d.totaleIntervento ? `€ ${d.totaleIntervento} + IVA` : null} />

          <SezDettaglio>Esito</SezDettaglio>
          <RigaDettaglio label="Esito intervento" value={d.esito === "positivo" ? "✅ Positivo" : "❌ Negativo"} />
          <RigaDettaglio label="Pagamento corrispettivo" value={d.pagamento ? "✅ Sì" : "❌ No"} />
          {!d.pagamento && <RigaDettaglio label="Motivazione mancato pagamento" value={d.motivazioneMancatoPagamento} />}
        </div>
      </div>

      {/* Ricambi */}
      {d.ricambi?.some(r => r.articolo) && (
        <div style={{ marginBottom: "1rem" }}>
          <SezDettaglio>Ricambi / Accessori</SezDettaglio>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {["Articolo", "Q.tà", "Prezzo"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "4px 8px", border: "0.5px solid #e0e0e0", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.ricambi.filter(r => r.articolo).map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 8px", border: "0.5px solid #e0e0e0" }}>{r.articolo}</td>
                  <td style={{ padding: "4px 8px", border: "0.5px solid #e0e0e0" }}>{r.qta}</td>
                  <td style={{ padding: "4px 8px", border: "0.5px solid #e0e0e0" }}>{r.prezzo ? `€ ${r.prezzo}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verificazione Periodica */}
      {d.vp && (
        <div style={{ marginBottom: "1rem" }}>
          <SezDettaglio>Verificazione Periodica</SezDettaglio>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 2rem" }}>
            <div>
              <RigaDettaglio label="Data VP" value={fmtDate(d.vp.dataVP)} />
              <RigaDettaglio label="Esito VP" value={d.vp.esitoVP === "positivo" ? "✅ Positivo" : "❌ Negativo"} />
              <RigaDettaglio label="Scadenza VP" value={fmtDate(d.vp.scadenzaVP)} />
            </div>
            <div>
              <RigaDettaglio label="Doc. gestionale chiusura" value={d.vp.docChiusura} />
              <RigaDettaglio label="Versione firmware RT" value={d.vp.versioneFirmwareRT} />
              <RigaDettaglio label="Versione installata" value={d.vp.versioneInstallata} />
            </div>
          </div>
        </div>
      )}

      {/* Azioni */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: "0.75rem", borderTop: "0.5px solid #e0e0e0" }}>
        <button onClick={() => onElimina(intervento.id)} style={btnDanger}>🗑 Elimina</button>
        <button onClick={() => onRiapri(intervento)} style={btnPrimary}>🖨 Stampa / PDF</button>
      </div>
    </div>
  );
}

function SezDettaglio({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#888", letterSpacing: "0.05em", marginTop: 10, marginBottom: 4, paddingBottom: 2, borderBottom: "1px solid #e0e0e0" }}>
      {children}
    </div>
  );
}

// ===== COMPONENTE PRINCIPALE =====
export default function Storico({ cliente, onClose }) {
  const [interventi, setInterventi] = useState([]);
  const [espanso, setEspanso] = useState(null); // id dell'intervento espanso
  const [riaperto, setRiaperto] = useState(null); // intervento da riaprire in sola lettura
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);




  useEffect(() => {
    async function caricaStorico() {
      try {
        const q = query(
          collection(db, "storico_interventi"),
          where("pivaCliente", "==", cliente?.piva || ""),
          orderBy("dataSalvataggio", "desc")
        );
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setInterventi(lista);
      } catch (e) {
        console.error("Errore caricamento storico:", e);
        setInterventi([]);
      }
    }
    caricaStorico();
  }, [cliente]);




  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }






  async function eliminaIntervento(id) {
    try {
      await deleteDoc(doc(db, "storico_interventi", id));
      setInterventi(prev => prev.filter(i => i.id !== id));
      setEspanso(null);
      setDeleteModal({ open: false, id: null });
      showToast("Intervento eliminato");
    } catch (e) {
      console.error("Errore eliminazione:", e);
      showToast("Errore nell'eliminazione", "error");
    }
  }




  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "1rem" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 820, margin: "1rem auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "0.5px solid #e0e0e0", borderRadius: "12px 12px 0 0" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>📋 Storico Interventi</div>
              <div style={{ fontSize: 12, color: "#888" }}>{cliente?.azienda}{cliente?.citta ? " — " + cliente.citta : ""}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ background: "#f0f0f0", borderRadius: 99, padding: "2px 10px", fontSize: 12, color: "#555" }}>
                {interventi.length} intervento{interventi.length !== 1 ? "i" : ""}
              </span>
              <button onClick={onClose} style={btnSecondary}>✕ Chiudi</button>
            </div>
          </div>

          {/* Lista */}
          <div style={{ padding: "1rem 1.5rem", maxHeight: "75vh", overflowY: "auto" }}>
            {interventi.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
                <div>Nessun intervento salvato per questo cliente.</div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#bbb" }}>Apri un modulo intervento e clicca "Salva storico".</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {interventi.map(intervento => {
                  const aperto = espanso === intervento.id;
                  return (
                    <div key={intervento.id} style={{ border: "0.5px solid #e0e0e0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                      {/* Riga riassuntiva — cliccabile */}
                      <div
                        onClick={() => setEspanso(aperto ? null : intervento.id)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", background: aperto ? "#f5f9ff" : "#fff", transition: "background 0.15s" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: aperto ? "#dbeafe" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                            🔧
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>
                              {intervento.tipoIntervento || "Intervento generico"}
                            </div>
                            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                              Salvato il {fmtDateTime(intervento.dataSalvataggio)}
                              {intervento.dati?.richiestaNum ? ` · Richiesta N. ${intervento.dati.richiestaNum}` : ""}
                              {intervento.dati?.totaleIntervento ? ` · € ${intervento.dati.totaleIntervento}` : ""}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* Badge esito */}
                          {intervento.dati?.esito && (
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 99,
                              background: intervento.dati.esito === "positivo" ? "#e6f7f1" : "#fff0f0",
                              color: intervento.dati.esito === "positivo" ? "#1d9e75" : "#e24b4a",
                              border: `0.5px solid ${intervento.dati.esito === "positivo" ? "#a3e4ce" : "#f7c1c1"}`,
                              fontWeight: 500,
                            }}>
                              {intervento.dati.esito === "positivo" ? "✓ Positivo" : "✗ Negativo"}
                            </span>
                          )}
                          <span style={{ fontSize: 16, color: "#aaa", transform: aperto ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                            ▾
                          </span>
                        </div>
                      </div>

                      {/* Dettaglio espandibile */}
                      {aperto && (
                        <DettaglioIntervento
                          intervento={intervento}
                          onRiapri={(i) => setRiaperto(i)}
                          onElimina={(id) => setDeleteModal({ open: true, id })}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal conferma eliminazione */}
      {deleteModal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", maxWidth: 380, width: "100%", margin: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Elimina intervento</div>
            <p style={{ fontSize: 13, color: "#e24b4a", background: "#fff5f5", border: "0.5px solid #f7c1c1", borderRadius: 8, padding: "8px 12px", margin: "0 0 20px" }}>
              ⚠️ Questa operazione è irreversibile.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => setDeleteModal({ open: false, id: null })} style={btnSecondary}>Annulla</button>
              <button onClick={() => eliminaIntervento(deleteModal.id)} style={{ ...btnPrimary, background: "#e24b4a" }}>Elimina</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, background: "#fff",
          border: "0.5px solid #ccc",
          borderLeft: toast.type === "error" ? "3px solid #e24b4a" : "3px solid #1d9e75",
          borderRadius: 8, padding: "10px 16px", fontSize: 13,
          zIndex: 400, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ModuloIntervento in sola lettura */}
      {riaperto && (
        <ModuloIntervento
          cliente={{ piva: riaperto.pivaCliente, azienda: riaperto.aziendaCliente }}
          datiIniziali={riaperto.dati}
          solaLettura
          onClose={() => setRiaperto(null)}
        />
      )}
    </>
  );
}

const btnPrimary = { padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "#111", color: "#fff", border: "none", fontWeight: 500 };
const btnSecondary = { padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "transparent", color: "#888", border: "0.5px solid #ccc" };
const btnDanger = { padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", background: "transparent", color: "#e24b4a", border: "0.5px solid #f7c1c1" };
