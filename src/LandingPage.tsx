import TopBar from './TopBar';
import Cookies from 'js-cookie';

/**
 * LandingPage-Komponente
 *
 * Stellt die Startseite der Anwendung dar.
 * 
 * Funktionen:
 * - Zeigt die TopBar mit Login-Status und Benutzername an.
 * - Präsentiert ein Bannerbild und ein alternatives Bild im Vergleichsmodus (diff).
 * - Nutzt das DaisyUI-Diff-Feature für einen visuellen Effekt.
 * - Passt das Layout an das Dark Theme an.
 */
const LandingPage = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');
  return (
    <div data-theme="black" className="bg-primary min-h-screen">
      <TopBar hasToken={hasToken} username={username} />
      <figure className="diff aspect-16/9" tabIndex={0}>
        <div className="diff-item-1" role="img" tabIndex={0}>
          <img src="/file.svg" alt="Banner" />
        </div>
        <div className="diff-item-2" role="img">
          <img src="SWE.svg" alt="daisy" />
        </div>
        <div className="diff-resizer"></div>
      </figure>
    </div>
  );
};

export default LandingPage;
