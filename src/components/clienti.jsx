import { useState, useEffect, useRef } from "react";


import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

import ModuloIntervento from "./ModuloIntervento";
import Storico from "./Storico";



const MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const CAP_ITALIA = {
  "acerra": "80011", "acireale": "95024", "acqui terme": "15011",
  "acri": "87041", "adrano": "95031", "adria": "45011",
  "afragola": "80021", "agrigento": "92100", "agropoli": "84043",
  "alba": "12051", "albano laziale": "00041", "albenga": "17031",
  "alessandria": "15100", "alghero": "07041", "alcamo": "91011",
  "altamura": "70022", "amalfi": "84011", "amantea": "87032",
  "ancona": "60100", "andria": "76123", "angri": "84012",
  "aosta": "11100", "aprilia": "04011", "anzio": "00042",
  "arezzo": "52100", "ariano irpino": "83031", "arcore": "20862",
  "ardea": "00040", "arenzano": "16011", "arona": "28041",
  "arpino": "03033", "arzachena": "07021", "arzano": "80022",
  "ascoli piceno": "63100", "assisi": "06081", "asti": "14100",
  "atessa": "66041", "atri": "64032", "avellino": "83100",
  "avezzano": "67051", "aversa": "81031", "bacoli": "80070",
  "bagheria": "90011", "bagnacavallo": "48012", "bagnara calabra": "89011",
  "bagni di lucca": "55022", "bagno a ripoli": "50012",
  "bagno di romagna": "47021", "bari": "70100", "barletta": "76121",
  "barcellona pozzo di gotto": "98051", "baronissi": "84081",
  "bassano del grappa": "36061", "battipaglia": "84091",
  "beinasco": "10092", "belluno": "32100", "benevento": "82100",
  "bergamo": "24100", "biancavilla": "95033", "biella": "13900",
  "bisceglie": "76011", "bisignano": "87043", "bitonto": "70032",
  "bojano": "86021", "bologna": "40100", "bolzano": "39100",
  "borgomanero": "28021", "borgosesia": "13011",
  "boscoreale": "80041", "boscotrecase": "80042",
  "bracciano": "00062", "brescia": "25100", "bresso": "20091",
  "brindisi": "72100", "bronte": "95034", "busto arsizio": "21052",
  "cagliari": "09100", "caivano": "80023", "caltagirone": "95041",
  "caltanissetta": "93100", "campi bisenzio": "50013",
  "campobasso": "86100", "canosa di puglia": "76012", "cantu": "22063",
  "capo d'orlando": "98071", "capoterra": "09012",
  "capua": "81043", "carate brianza": "20841", "carbonia": "09013",
  "cardito": "80024", "carpi": "41012", "carrara": "54033",
  "casale monferrato": "15033", "casagiove": "81022",
  "casalnuovo di napoli": "80013", "casarano": "73042",
  "caserta": "81100", "casoria": "80026",
  "castel volturno": "81030", "castellammare di stabia": "80053",
  "castrovillari": "87012", "catania": "95100", "catanzaro": "88100",
  "cava de' tirreni": "84013", "cecina": "57023",
  "ceglie messapica": "72013", "cerignola": "71042",
  "cerveteri": "00052", "cervia": "48015", "cesano boscone": "20090",
  "cesena": "47521", "cetraro": "87022", "chieti": "66100",
  "chieri": "10023", "chioggia": "30015", "chivasso": "10034",
  "ciampino": "00043", "cinisello balsamo": "20092",
  "città di castello": "06012", "civitanova marche": "62012",
  "civitavecchia": "00053", "como": "22100", "conegliano": "31015",
  "corato": "70033", "corbetta": "20011", "corigliano calabro": "87064",
  "corleone": "90034", "cornaredo": "20010", "corsico": "20094",
  "cortona": "52044", "cosenza": "87100", "cossato": "13836",
  "cremona": "26100", "crotone": "88900", "cuneo": "12100",
  "cuorgne": "10082", "dalmine": "24044", "decimomannu": "09033",
  "desenzano del garda": "25015", "desio": "20832",
  "diamante": "87023", "dolo": "30031", "domodossola": "28845",
  "eboli": "84025", "empoli": "50053", "enna": "94100",
  "erba": "22036", "ercolano": "80056", "erice": "91016",
  "este": "35042", "fabriano": "60044", "faenza": "48018",
  "fano": "61032", "fasano": "72015", "ferrara": "44100",
  "fermo": "63900", "fidenza": "43036", "figline valdarno": "50063",
  "finale ligure": "17024", "firenze": "50100", "fiumicino": "00054",
  "foggia": "71100", "foligno": "06034", "fondi": "04022",
  "forlì": "47100", "formia": "04023", "formigine": "41043",
  "forte dei marmi": "55042", "francavilla al mare": "66023",
  "francavilla fontana": "72021", "frascati": "00044",
  "frattamaggiore": "80027", "frosinone": "03100",
  "gaeta": "04024", "galatina": "73013", "gallarate": "21013",
  "gallipoli": "73014", "garbagnate milanese": "20024",
  "gela": "93012", "gemona del friuli": "33013",
  "genova": "16100", "giarre": "95014", "ginosa": "74013",
  "gioia del colle": "70023", "gioia tauro": "89013",
  "giugliano in campania": "80014", "giulianova": "64021",
  "gorizia": "34170", "gravina in puglia": "70024",
  "grosseto": "58100", "grugliasco": "10095", "gubbio": "06024",
  "guidonia montecelio": "00012", "iglesias": "09016",
  "imola": "40026", "imperia": "18100", "ischia": "80077",
  "ispica": "97014", "isola capo rizzuto": "88841",
  "ivrea": "10015", "jesi": "60035", "l'aquila": "67100",
  "la spezia": "19100", "lagonegro": "85042", "lamezia terme": "88046",
  "lanciano": "66034", "lanusei": "08045", "latina": "04100",
  "lavello": "85024", "lavis": "38015", "lazise": "37017",
  "lecce": "73100", "lecco": "23900", "legnago": "37045",
  "leinì": "10040", "lentini": "96016", "leonforte": "94013",
  "licata": "92027", "limbiate": "20812", "lissone": "20851",
  "livorno": "57100", "lodi": "26900", "lonate pozzolo": "21015",
  "loreto": "60025", "lucca": "55100", "lucera": "71036",
  "lugo": "48022", "macerata": "62100", "maddaloni": "81024",
  "magenta": "20013", "maglie": "73024", "manduria": "74024",
  "manfredonia": "71043", "mantova": "46100",
  "marano di napoli": "80016", "marcianise": "81025",
  "mariano comense": "22066", "marigliano": "80034",
  "marsala": "91025", "martina franca": "74015",
  "mascali": "95016", "mascalucia": "95030", "massa": "54100",
  "massafra": "74016", "matera": "75100", "mazara del vallo": "91026",
  "meda": "20821", "melegnano": "20077", "melfi": "85025",
  "melito di napoli": "80017", "mentana": "00013",
  "mercato san severino": "84085", "mesagne": "72023",
  "messina": "98100", "mestre": "30170", "milano": "20100",
  "milazzo": "98057", "misterbianco": "95045", "modena": "41100",
  "modica": "97015", "mola di bari": "70042", "molfetta": "70056",
  "moncalieri": "10024", "mondovì": "12084", "mondragone": "81034",
  "monfalcone": "34074", "monopoli": "70043", "monreale": "90046",
  "monsummano terme": "51015", "montecatini terme": "51016",
  "montepulciano": "53045", "monterotondo": "00015",
  "montesarchio": "82016", "monza": "20900", "mottola": "74017",
  "muggiò": "20835", "mugnano di napoli": "80018",
  "muro lucano": "85054", "napoli": "80100", "nardò": "73048",
  "nerviano": "20014", "nichelino": "10042", "nicosia": "94014",
  "niscemi": "93015", "nocera inferiore": "84014",
  "nocera superiore": "84015", "noci": "70015",
  "noicattaro": "70016", "nola": "80035", "noto": "96017",
  "novi ligure": "15067", "novara": "28100", "nuoro": "08100",
  "olbia": "07026", "orbassano": "10043", "oristano": "09170",
  "orta nova": "71045", "ostia": "00121", "ottaviano": "80044",
  "pachino": "96018", "padova": "35100", "pagani": "84016",
  "palagonia": "95046", "palermo": "90100",
  "palma di montechiaro": "92020", "palmi": "89015",
  "parabiago": "20015", "parma": "43100", "paternò": "95047",
  "pavia": "27100", "perugia": "06100", "pesaro": "61100",
  "pescara": "65100", "peschiera del garda": "37019",
  "piacenza": "29100", "pietrasanta": "55045", "pinerolo": "10064",
  "pioltello": "20096", "piombino": "57025", "piossasco": "10045",
  "pisa": "56100", "pistoia": "51100", "poggibonsi": "53036",
  "pomezia": "00071", "pompei": "80045", "pontecagnano faiano": "84098",
  "pordenone": "33170", "portici": "80055", "porto torres": "07046",
  "portogruaro": "30026", "positano": "84017", "potenza": "85100",
  "pozzuoli": "80078", "prato": "59100", "putignano": "70017",
  "qualiano": "80019", "quarto": "80010",
  "quartu sant'elena": "09045", "ragusa": "97100",
  "randazzo": "95036", "rapallo": "16035", "ravenna": "48100",
  "recanati": "62019", "reggio calabria": "89100",
  "reggio di calabria": "89100", "reggio emilia": "42100",
  "rende": "87036", "rescaldina": "20027", "rho": "20017",
  "riccione": "47838", "rieti": "02100", "riesi": "93016",
  "rimini": "47900", "rionero in vulture": "85028",
  "riva del garda": "38066", "rivoli": "10098", "roma": "00100",
  "rosolini": "96019", "rossano": "87067", "rovigo": "45100",
  "rubano": "35030", "ruvo di puglia": "70037",
  "sabaudia": "04016", "salerno": "84100", "samarate": "21017",
  "san benedetto del tronto": "63074", "san cataldo": "93017",
  "san donà di piave": "30027", "san felice a cancello": "81027",
  "san giorgio a cremano": "80046", "san giorgio ionico": "74027",
  "san giovanni in fiore": "87055", "san giovanni la punta": "95037",
  "san giovanni rotondo": "71013", "san giuseppe vesuviano": "80047",
  "san nicola la strada": "81020", "san remo": "18038",
  "san severo": "71016", "sanremo": "18038",
  "sant'agata de' goti": "82019", "sant'agata di militello": "98076",
  "sant'anastasia": "80048", "sant'antimo": "80029",
  "sant'antonio abate": "80057", "santa croce camerina": "97013",
  "santa maria a vico": "81028", "santa maria capua vetere": "81055",
  "santhià": "13048", "santo stefano di camastra": "98077",
  "sarno": "84087", "sassari": "07100", "sassuolo": "41049",
  "savona": "17100", "scafati": "84018", "scalea": "87029",
  "scandicci": "50018", "sciacca": "92019", "segrate": "20054",
  "selargius": "09047", "senago": "20030", "seregno": "20831",
  "sessa aurunca": "81037", "sesto san giovanni": "20099",
  "settimo torinese": "10036", "siderno": "89048", "siena": "53100",
  "sinnai": "09048", "siracusa": "96100", "sondrio": "23100",
  "somma lombardo": "21019", "somma vesuviana": "80049",
  "sora": "03039", "sorrento": "80067", "spinea": "30038",
  "spoleto": "06049", "squinzano": "73018", "statte": "74010",
  "sulmona": "67039", "surbo": "73010", "taranto": "74100",
  "tarquinia": "01016", "terni": "05100", "teramo": "64100",
  "terracina": "04019", "terzigno": "80040", "thiene": "36016",
  "tivoli": "00019", "torino": "10100", "torre annunziata": "80058",
  "torre del greco": "80059", "trani": "76125", "trapani": "91100",
  "trento": "38100", "treviso": "31100", "trieste": "34100",
  "triggiano": "70019", "troina": "94018", "udine": "33100",
  "ugento": "73059", "urbino": "61029", "valenza": "15048",
  "valmontone": "00038", "varese": "21100", "vasto": "66054",
  "venaria reale": "10078", "venezia": "30100", "ventimiglia": "18039",
  "verbania": "28900", "vercelli": "13100", "verona": "37100",
  "vernole": "73029", "viareggio": "55049", "vibo valentia": "89900",
  "vicenza": "36100", "vieste": "71019", "vigevano": "27029",
  "vignola": "41058", "villa san giovanni": "89018",
  "villaricca": "80010", "vimercate": "20871",
  "vittoria": "97019", "vittorio veneto": "31029",
  "viterbo": "01100", "voghera": "27058", "volpiano": "10088",
  "zagarolo": "00039", "zafferana etnea": "95019",
  "zola predosa": "40069",
};

function parseData(iso) {
  if (!iso) return null;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split("-").map(Number);
      return { giorno: d, mese: m - 1, anno: y };
    }
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return null;
    return {
      giorno: dt.getUTCDate(),
      mese: dt.getUTCMonth(),
      anno: dt.getUTCFullYear(),
    };
  } catch (e) {
    return null;
  }
}

function fmtDate(iso) {
  const p = parseData(iso);
  if (!p) return "—";
  const giorno = String(p.giorno).padStart(2, "0");
  const mese = MESI[p.mese];
  return `${giorno} ${mese} ${p.anno}`;
}

function esc(s) { return s || ""; }

export default function Clienti() {
  const [clienti, setClienti] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState("lista");
  const [search, setSearch] = useState("");
  const [filterMese, setFilterMese] = useState("");
  const [filterAnno, setFilterAnno] = useState("");
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [deleteModal, setDeleteModal] = useState({ open: false, idx: -1, nome: "" });
  const [capLoading, setCapLoading] = useState(false);
  const [editCapLoading, setEditCapLoading] = useState(false);
  const [moduloCliente, setModuloCliente] = useState(null); // ← QUI, dentro il componente
  const [storicoCliente, setStoricoCliente] = useState(null);

  const capTimerRef = useRef(null);
  const editCapTimerRef = useRef(null);
  const [pivaVerificate, setPivaVerificate] = useState(new Set());

  useEffect(() => {
    async function caricaVerifiche() {
      try {
        const snap = await getDocs(collection(db, "storico_interventi"));
        const piva = new Set();
        snap.docs.forEach(d => {
          const data = d.data();
          console.log("tipoIntervento:", data.tipoIntervento, "piva:", data.pivaCliente);
          const tipo = (data.tipoIntervento || "").toLowerCase();
          if (tipo.includes("verifica periodica") || tipo.includes("attivazione e verifica")) {
            if (data.pivaCliente) piva.add(data.pivaCliente);
          }
        });
        setPivaVerificate(piva);
      } catch (e) {
        console.error("Errore carica verifiche:", e);
      }
    }
    caricaVerifiche();
  }, []);


  const emptyForm = {
    azienda: "", piva: "", indirizzo: "", citta: "",provincia: "",
    cap: "", modello: "", matricola: "", link: "", note: "",
    dataInserimento: new Date().toISOString().split("T")[0],
  };

  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);



  useEffect(() => {
    async function caricaClienti() {
      try {
        const q = query(collection(db, "clienti"), orderBy("dataInserimento", "desc"));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setClienti(lista);
        setFiltered(lista);
      } catch (e) {
        console.error("Errore caricamento clienti:", e);
        setClienti([]);
      }
    }
    caricaClienti();
  }, []);




  useEffect(() => {
    let result = [...clienti];
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((c) =>
        [c.azienda, c.piva, c.citta, c.modello, c.matricola, c.note].some((v) =>
          (v || "").toLowerCase().includes(s)
        )
      );
    }
    if (filterAnno) {
      result = result.filter((c) => {
        const p = parseData(c.dataInserimento);
        if (!p) return false;
        return p.anno === parseInt(filterAnno, 10);
      });
    }
    if (filterMese) {
      result = result.filter((c) => {
        const p = parseData(c.dataInserimento);
        if (!p) return false;
        return p.mese + 1 === parseInt(filterMese, 10);
      });
    }
    setFiltered(result);
  }, [search, filterMese, filterAnno, clienti]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function fetchCap(citta, isEdit = false) {
    if (!citta || citta.trim().length < 2) return;
    isEdit ? setEditCapLoading(true) : setCapLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    try {
      const input = citta.trim().toLowerCase();
      let cap = CAP_ITALIA[input];
      let nomeTrovato = cap ? citta.trim() : "";
      if (!cap) {
        const chiave = Object.keys(CAP_ITALIA).find((k) => k.startsWith(input));
        if (chiave) { cap = CAP_ITALIA[chiave]; nomeTrovato = chiave.charAt(0).toUpperCase() + chiave.slice(1); }
      }
      if (!cap) {
        const chiave = Object.keys(CAP_ITALIA).find((k) => k.includes(input));
        if (chiave) { cap = CAP_ITALIA[chiave]; nomeTrovato = chiave.charAt(0).toUpperCase() + chiave.slice(1); }
      }
      if (cap) {
        if (isEdit) { setEditForm((prev) => ({ ...prev, cap, citta: nomeTrovato || prev.citta })); }
        else { setForm((prev) => ({ ...prev, cap, citta: nomeTrovato || prev.citta })); }
        showToast(`CAP trovato: ${cap}`);
      } else {
        showToast("Città non trovata, inserisci il CAP manualmente", "error");
      }
    } catch (e) {
      showToast("Errore nella ricerca del CAP", "error");
    } finally {
      isEdit ? setEditCapLoading(false) : setCapLoading(false);
    }
  }

  function handleCittaChange(val, isEdit = false) {
    if (isEdit) {
      setEditForm((prev) => ({ ...prev, citta: val, cap: "" }));
      if (editCapTimerRef.current) clearTimeout(editCapTimerRef.current);
      if (val.trim().length >= 2) {
        editCapTimerRef.current = setTimeout(() => fetchCap(val, true), 800);
      }
    } else {
      setForm((prev) => ({ ...prev, citta: val, cap: "" }));
      if (capTimerRef.current) clearTimeout(capTimerRef.current);
      if (val.trim().length >= 2) {
        capTimerRef.current = setTimeout(() => fetchCap(val, false), 800);
      }
    }
  }

  function pivaValida(piva) { return /^\d{11}$/.test(piva.trim()); }

  function pivaEsiste(piva, excludeIdx = -1) {
    return clienti.some((c, i) => i !== excludeIdx && c.piva.trim() === piva.trim());
  }





  async function handleAdd() {
    if (!form.azienda.trim()) { showToast("Inserisci il nome azienda", "error"); return; }
    if (!form.piva.trim()) { showToast("Inserisci la partita IVA", "error"); return; }
    if (!pivaValida(form.piva)) { showToast("La partita IVA deve contenere esattamente 11 cifre numeriche", "error"); return; }
    if (pivaEsiste(form.piva)) { showToast("Partita IVA già presente!", "error"); return; }
    try {
      const nuovo = {
        ...form,
        dataInserimento: form.dataInserimento ? form.dataInserimento + "T12:00:00.000Z" : new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "clienti"), nuovo);
      setClienti((prev) => [{ id: docRef.id, ...nuovo }, ...prev]);
      setForm({ ...emptyForm, dataInserimento: new Date().toISOString().split("T")[0] });
      setTab("lista");
      showToast("Cliente salvato con successo");
    } catch (e) {
      console.error("Errore salvataggio cliente:", e);
      showToast("Errore nel salvataggio", "error");
    }
  }



  async function handleDelete() {
    try {
      const clienteId = clienti[deleteModal.idx].id;
      await deleteDoc(doc(db, "clienti", clienteId));
      setClienti((prev) => prev.filter((_, i) => i !== deleteModal.idx));
      setDeleteModal({ open: false, idx: -1, nome: "" });
      showToast("Cliente eliminato", "error");
    } catch (e) {
      console.error("Errore eliminazione cliente:", e);
      showToast("Errore nell'eliminazione", "error");
    }
  }




  function openEdit(idx) {
    setEditIdx(idx);
    const c = clienti[idx];
    setEditForm({
      ...c,
      dataInserimento: c.dataInserimento ? c.dataInserimento.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  }







  async function handleSaveEdit() {
    if (!editForm.azienda.trim()) { showToast("Inserisci il nome azienda", "error"); return; }
    if (!editForm.piva.trim()) { showToast("Inserisci la partita IVA", "error"); return; }
    if (!pivaValida(editForm.piva)) { showToast("La partita IVA deve contenere esattamente 11 cifre numeriche", "error"); return; }
    if (pivaEsiste(editForm.piva, editIdx)) { showToast("Partita IVA già presente!", "error"); return; }
    try {
      const aggiornato = {
        ...editForm,
        dataInserimento: editForm.dataInserimento ? editForm.dataInserimento + "T12:00:00.000Z" : new Date().toISOString(),
      };
      const clienteId = clienti[editIdx].id;
      await updateDoc(doc(db, "clienti", clienteId), aggiornato);
      setClienti((prev) => prev.map((c, i) => (i === editIdx ? { id: clienteId, ...aggiornato } : c)));
      setModalOpen(false);
      setEditIdx(-1);
      showToast("Modifiche salvate");
    } catch (e) {
      console.error("Errore modifica cliente:", e);
      showToast("Errore nel salvataggio", "error");
    }
  }






  const anniDisponibili = [
    ...new Set([
      new Date().getFullYear(),
      ...clienti.filter((c) => c.dataInserimento).map((c) => parseData(c.dataInserimento)?.anno).filter(Boolean),
    ]),
  ].sort((a, b) => b - a);

  const filtriAttivi = search || filterMese || filterAnno;

  return (
    <div style={{ padding: "1.5rem 0", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <div style={{ width: 38, height: 38, borderRadius: 8, background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👥</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Clienti</h1>
          <span style={{ fontSize: 13, color: "#888" }}>Gestione anagrafica clienti</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "0.5px solid #e0e0e0", marginBottom: "1.5rem" }}>
        {["lista", "nuovo"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 16px", fontSize: 14, cursor: "pointer", border: "none", background: "none",
            color: tab === t ? "#111" : "#888",
            borderBottom: tab === t ? "2px solid #111" : "2px solid transparent",
            fontWeight: tab === t ? 500 : 400, marginBottom: -1,
          }}>
            {t === "lista" ? "Elenco clienti" : "+ Nuovo cliente"}
          </button>
        ))}
      </div>

      {/* Tab Lista */}
      {tab === "lista" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
            <span style={{ background: "#f5f5f5", border: "0.5px solid #e0e0e0", borderRadius: 99, padding: "2px 10px", fontSize: 12, color: "#666" }}>
              {filtered.length} / {clienti.length} client{clienti.length === 1 ? "e" : "i"}
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select value={filterMese} onChange={(e) => setFilterMese(e.target.value)} style={selectStyle}>
                <option value="">Tutti i mesi</option>
                {MESI.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              <select value={filterAnno} onChange={(e) => setFilterAnno(e.target.value)} style={selectStyle}>
                <option value="">Tutti gli anni</option>
                {anniDisponibili.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
              {filtriAttivi && (
                <button onClick={() => { setFilterMese(""); setFilterAnno(""); setSearch(""); }} style={{ ...btnSecondary, fontSize: 12, padding: "6px 12px" }}>
                  ✕ Reset
                </button>
              )}
              <input
                type="text" placeholder="Cerca per nome, P.IVA, città..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: 34, padding: "0 10px", border: "0.5px solid #ccc", borderRadius: 8, fontSize: 13, width: 240, background: "#fafafa" }}
              />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Azienda", "P. IVA", "Indirizzo", "CAP", "Città","Provincia", "Modello cassa", "Matricola", "Link", "Note", "Inserito il", ""].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 10px", fontSize: 11,
                      fontWeight: 500, color: "#888", textTransform: "uppercase",
                      letterSpacing: "0.04em", borderBottom: "0.5px solid #e0e0e0", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: "center", padding: "2.5rem", color: "#aaa", fontSize: 14 }}>
                      {clienti.length ? "Nessun risultato trovato." : "Nessun cliente inserito. Clicca \"+ Nuovo cliente\" per iniziare."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const realIdx = clienti.indexOf(c);
                    return (
                      <tr key={realIdx} style={{
  
  background: pivaVerificate.has(c.piva) ? "#edfaf4" : "transparent",
  borderBottom: "2px solid black",
}}>
                        <td style={{ padding: "9px 10px", fontWeight: 500 }}>{esc(c.azienda)}</td>
                        <td style={{ padding: "9px 10px", fontWeight: 500 }}>{esc(c.piva)}</td>
                        <td style={{ padding: "9px 10px", color: c.indirizzo ? "#111" : "#ccc" }}>{esc(c.indirizzo) || "—"}</td>
                        <td style={{ padding: "9px 10px", color: c.cap ? "#111" : "#ccc" }}>{esc(c.cap) || "—"}</td>
                        <td style={{ padding: "9px 10px", color: c.citta ? "#111" : "#ccc" }}>{esc(c.citta) || "—"}</td>
                        <td style={{ padding:"9px 10px", color:c.provincia?"#111":"#ccc" }}>{esc(c.provincia)||"—"}</td>
                        <td style={{ padding: "9px 10px", color: c.modello ? "#111" : "#ccc" }}>{esc(c.modello) || "—"}</td>
                        <td style={{ padding: "9px 10px", color: c.matricola ? "#111" : "#ccc" }}>{esc(c.matricola) || "—"}</td>
                        <td style={{ padding: "9px 10px" }}>
                          {c.link
                            ? <a href={c.link} target="_blank" rel="noreferrer" style={{ color: "#185fa5", fontSize: 12 }}>Apri link</a>
                            : <span style={{ color: "#ccc", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: "9px 10px", color: c.note ? "#111" : "#ccc", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {esc(c.note) || "—"}
                        </td>
                        <td style={{ padding: "9px 10px", fontWeight: 500, whiteSpace: "nowrap" }}>
                          {fmtDate(c.dataInserimento)}
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          {/* ← Tutti i bottoni in un unico div */}
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <button onClick={() => openEdit(realIdx)} style={btnIconStyle()}>✏️ Modifica</button>
                            <button onClick={() => setDeleteModal({ open: true, idx: realIdx, nome: c.azienda })} style={btnIconStyle()}>
                              🗑️ Elimina
                            </button>
                            <button
                              onClick={() => setModuloCliente(c)}
                              title="Apri modulo intervento"
                              style={btnIconStyle()}
                            >
                              📄 Modulo
                            </button>
                            <button
                              onClick={() => setStoricoCliente(c)}
                              title="Storico interventi"
                              style={btnIconStyle()}
                            >
                              📋 Storico
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Nuovo */}
      {tab === "nuovo" && (
        <div style={cardStyle}>
          <div style={formTitleStyle}>Nuovo cliente</div>
          <FormGrid
            form={form} setForm={setForm}
            onCittaChange={(val) => handleCittaChange(val, false)}
            onFetchCap={() => fetchCap(form.citta, false)}
            capLoading={capLoading}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid #e0e0e0" }}>
            <button onClick={() => { setForm({ ...emptyForm, dataInserimento: new Date().toISOString().split("T")[0] }); setTab("lista"); }} style={btnSecondary}>Annulla</button>
            <button onClick={handleAdd} style={btnPrimary}>Salva cliente</button>
          </div>
        </div>
      )}

      {/* Modal Modifica */}
      {modalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }} style={overlayStyle}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: 560, margin: "1rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ ...formTitleStyle, display: "flex", alignItems: "center", gap: 8 }}>
              Modifica cliente
              <span style={{ fontSize: 11, background: "#faeeda", color: "#854f0b", padding: "2px 8px", borderRadius: 99 }}>in modifica</span>
            </div>
            <FormGrid
              form={editForm} setForm={setEditForm}
              onCittaChange={(val) => handleCittaChange(val, true)}
              onFetchCap={() => fetchCap(editForm.citta, true)}
              capLoading={editCapLoading}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem", paddingTop: "1rem", borderTop: "0.5px solid #e0e0e0" }}>
              <button onClick={() => setModalOpen(false)} style={btnSecondary}>Annulla</button>
              <button onClick={handleSaveEdit} style={btnPrimary}>Salva modifiche</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminazione */}
      {deleteModal.open && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal({ open: false, idx: -1, nome: "" }); }} style={overlayStyle}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: 420, margin: "1rem" }}>
            <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h2 style={{ fontSize: 17, fontWeight: 500, margin: "0 0 8px" }}>Elimina cliente</h2>
              <p style={{ fontSize: 14, color: "#555", margin: "0 0 4px" }}>Stai per eliminare:</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#111", margin: "0 0 16px" }}>{deleteModal.nome}</p>
              <p style={{ fontSize: 13, color: "#e24b4a", background: "#fff5f5", border: "0.5px solid #f7c1c1", borderRadius: 8, padding: "8px 12px", margin: "0 0 20px" }}>
                ⚠️ Questa operazione è irreversibile. Il cliente verrà eliminato definitivamente.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button onClick={() => setDeleteModal({ open: false, idx: -1, nome: "" })} style={{ ...btnSecondary, minWidth: 100 }}>Annulla</button>
                <button onClick={handleDelete} style={{ ...btnPrimary, background: "#e24b4a", minWidth: 100 }}>Elimina</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modulo Intervento — appare SOLO quando si clicca 📄 */}
      {moduloCliente && (
        <ModuloIntervento
          cliente={moduloCliente}
          onClose={() => setModuloCliente(null)}
        />
      )}

      {/* Storico Interventi — appare quando si clicca 📋 */}
      {storicoCliente && (
        <Storico
          cliente={storicoCliente}
          onClose={() => setStoricoCliente(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, background: "#fff",
          border: "0.5px solid #ccc",
          borderLeft: toast.type === "error" ? "3px solid #e24b4a" : "3px solid #1d9e75",
          borderRadius: 8, padding: "10px 16px", fontSize: 13,
          zIndex: 999, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function FormGrid({ form, setForm, onCittaChange, onFetchCap, capLoading }) {
  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const pivaError = form.piva && (!/^\d+$/.test(form.piva) || form.piva.length !== 11);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <FieldLabel>Nome azienda *</FieldLabel>
        <input style={inputStyle} placeholder="Es. Rossi S.r.l." value={form.azienda} onChange={update("azienda")} />
      </div>
      <div>
        <FieldLabel>Partita IVA *</FieldLabel>
        <input
          style={{ ...inputStyle, borderColor: pivaError ? "#e24b4a" : "#ccc" }}
          placeholder="Es. 12345678901" maxLength={11} value={form.piva}
          onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); setForm((prev) => ({ ...prev, piva: val })); }}
        />
        {pivaError && <span style={{ fontSize: 11, color: "#e24b4a", marginTop: 3, display: "block" }}>{`Deve contenere esattamente 11 cifre (${form.piva.length}/11)`}</span>}
        {form.piva && !pivaError && <span style={{ fontSize: 11, color: "#1d9e75", marginTop: 3, display: "block" }}>✓ Partita IVA valida (11/11)</span>}
      </div>
      <div>
        <FieldLabel>Data inserimento</FieldLabel>
        <input style={inputStyle} type="date" value={form.dataInserimento} onChange={update("dataInserimento")} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <FieldLabel>Indirizzo</FieldLabel>
        <input style={inputStyle} placeholder="Via, numero civico..." value={form.indirizzo} onChange={update("indirizzo")} />
      </div>
      <div>
        <FieldLabel>Città</FieldLabel>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              style={{ ...inputStyle, paddingRight: capLoading ? 30 : 10 }}
              placeholder="Es. Lecce, Roma..." value={form.citta}
              onChange={(e) => onCittaChange(e.target.value)}
            />
            {capLoading && <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#888" }}>⏳</span>}
          </div>
          <button onClick={onFetchCap} title="Cerca CAP manualmente"
            style={{ height: 36, padding: "0 10px", border: "0.5px solid #ccc", borderRadius: 8, background: "#f0f7ff", cursor: "pointer", fontSize: 13, color: "#185fa5", whiteSpace: "nowrap" }}>
            📍 CAP
          </button>
        </div>
        <span style={{ fontSize: 11, color: "#aaa", marginTop: 3, display: "block" }}>Il CAP viene cercato automaticamente mentre scrivi</span>
      </div>
      <div>
        <FieldLabel>CAP</FieldLabel>
        <input style={inputStyle} placeholder="Es. 73100" maxLength={5} value={form.cap}
          onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); setForm((prev) => ({ ...prev, cap: val })); }} />
      </div>
      <div>
  <FieldLabel>Provincia</FieldLabel>
  <input
    style={inputStyle}
    placeholder="Es. LE"
    maxLength={2}
    value={form.provincia || ""}
    onChange={(e) => setForm((prev) => ({ ...prev, provincia: e.target.value.toUpperCase() }))}
  />
</div>
      <div>
        <FieldLabel>Modello cassa</FieldLabel>
        <input style={inputStyle} placeholder="Es. Epson FP-90III" value={form.modello} onChange={update("modello")} />
      </div>
      <div>
        <FieldLabel>Matricola</FieldLabel>
        <input style={inputStyle} placeholder="Es. XXXXXXXX" value={form.matricola} onChange={update("matricola")} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <FieldLabel>Link (URL)</FieldLabel>
        <input style={inputStyle} type="url" placeholder="https://..." value={form.link} onChange={update("link")} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <FieldLabel>Note</FieldLabel>
        <textarea
          style={{ ...inputStyle, height: 80, padding: "8px 10px", resize: "vertical", lineHeight: 1.5 }}
          placeholder="Eventuali note sul cliente..." value={form.note} onChange={update("note")} />
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, color: "#888", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 5 }}>
      {children}
    </div>
  );
}

const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" };
const cardStyle = { background: "#fff", border: "0.5px solid #e0e0e0", borderRadius: 12, padding: "1.25rem" };
const formTitleStyle = { fontSize: 15, fontWeight: 500, marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "0.5px solid #e0e0e0" };
const inputStyle = { height: 36, padding: "0 10px", border: "0.5px solid #ccc", borderRadius: 8, background: "#fafafa", fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "sans-serif" };
const selectStyle = { height: 34, padding: "0 10px", border: "0.5px solid #ccc", borderRadius: 8, background: "#fafafa", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", color: "#111" };
const btnPrimary = { padding: "8px 18px", borderRadius: 8, fontSize: 14, cursor: "pointer", background: "#111", color: "#fff", border: "none", fontWeight: 500 };
const btnSecondary = { padding: "8px 18px", borderRadius: 8, fontSize: 14, cursor: "pointer", background: "transparent", color: "#888", border: "0.5px solid #ccc" };
function btnIconStyle() {
  return { background: "none", border: "0.5px solid transparent", cursor: "pointer", color: "#888", fontSize: 12, padding: "4px 8px", borderRadius: 8, fontFamily: "sans-serif" };
}
