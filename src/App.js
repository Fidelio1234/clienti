import { useState } from "react";
import Login from "./components/Login";
import Clienti from "./components/clienti";

export default function App() {
  const [loggato, setLoggato] = useState(false);

  if (!loggato) {
    return <Login onAccesso={() => setLoggato(true)} />;
  }

  return <Clienti />;
}