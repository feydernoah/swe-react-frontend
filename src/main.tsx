import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

/**
 * Einstiegspunkt der React-Anwendung.
 *
 * - Initialisiert die React-App und rendert sie in das HTML-Element mit der ID 'root'
 * - Nutzt React.StrictMode, um potenzielle Probleme im Entwicklungsmodus zu erkennen
 * - Importiert globale Styles sowie die zentrale App-Komponente
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
