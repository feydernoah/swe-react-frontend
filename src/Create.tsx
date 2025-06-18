import TopBar from './TopBar';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { refreshAccessToken } from './TokenRefresher';

// Typdefinition für die Formulardaten
type FormData = {
  isbn: string;
  rating: number;
  preis: number;
  titel: string;
  untertitel?: string;
  art?: 'PAPERBACK' | 'HARDCOVER' | 'EPUB';
  rabatt?: number;
  lieferbar?: boolean;
  datum?: string;
  homepage?: string;
  schlagwoerter?: string;
};

/**
 * Diese Komponente ermöglicht es Admin-Benutzern, ein neues Buch anzulegen.
 * 
 * Funktionen:
 * - Anzeige eines Formulars für ISBN, Titel, Untertitel, Preis und Bewertung
 * - Validierung der Eingaben mit react-hook-form
 * - Zugriffsbeschränkung: Nur Benutzer mit dem Namen "admin" dürfen Bücher anlegen
 * - Prüfung und ggf. Erneuerung des Access Tokens über Refresh-Token
 * - Kommunikation mit dem Backend über einen POST-Request
 * - Anzeige von Fehlermeldungen und Bestätigungen über ein Popup
 */
const Create = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { rating: 0 },
  });
  const [message, setMessage] = useState<string | null>(null);

  // Funktion zum Absenden des Formulars
  const onSubmit = async (data: FormData) => {
    let token = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');

    // Token ggf. aktualisieren, wenn abgelaufen
    if (!token) {
      if (refreshToken) {
        try {
          const result = await refreshAccessToken();
          token = result.access_token;
        } catch {
          setMessage('Session abgelaufen. Bitte neu einloggen.');
          return;
        }
      } else {
        setMessage('Session abgelaufen. Bitte neu einloggen.');
        return;
      }
    }

    // Vorbereitung der Datenstruktur für den API-Request
    const payload = {
      isbn: data.isbn,
      rating: Number(data.rating),
      preis: Number(data.preis),
      titel: {
        titel: data.titel,
        untertitel: data.untertitel || undefined,
      },
      art: data.art || undefined,
      rabatt:
        typeof data.rabatt === 'string'
          ? Number(data.rabatt)
          : typeof data.rabatt === 'number'
            ? data.rabatt
            : undefined,
      lieferbar:
        typeof data.lieferbar === 'boolean' ? data.lieferbar : undefined,
      datum: data.datum || undefined,
      homepage: data.homepage || undefined,
      schlagwoerter: data.schlagwoerter
        ? data.schlagwoerter
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    };
    // Daten an das Backend senden
    try {
      const response = await fetch('https://localhost:3001/rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMessage('Buch erfolgreich angelegt!');
      } else {
        try {
          const errorJson = await response.json();
          if (
            errorJson.statusCode === 422 &&
            typeof errorJson.message === 'string' &&
            errorJson.message.includes('existiert bereits')
          ) {
            setMessage('ISBN gibt es bereits');
          } else {
            setMessage(
              'Fehler: ' + (errorJson.message || JSON.stringify(errorJson)),
            );
          }
        } catch {
          const errorText = await response.text();
          setMessage('Fehler: ' + errorText);
        }
      }
    } catch (error: unknown) {
      let errorMsg = 'Unbekannter Fehler';
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      setMessage('Fehler: ' + errorMsg);
    }
  };

  // Wenn Benutzer nicht "admin" ist → Zugriff verweigert
  if (username !== 'admin') {
    return (
      <div data-theme="black" className="bg-primary min-h-screen">
        <TopBar hasToken={hasToken} username={username} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
          <p>Nur Admins können Bücher anlegen.</p>
        </div>
      </div>
    );
  } else {
    // Admin: Formular anzeigen
    return (
      <div data-theme="black" className="bg-primary min-h-screen flex flex-col">
        <TopBar hasToken={hasToken} username={username} />
        <div className="flex flex-1 items-center justify-center px-2 sm:px-0">
          <div className="bg-base-100 rounded-lg p-6 shadow-lg w-full max-w-md flex flex-col items-center">
            <h1 className="text-xl font-bold mb-3 text-neutral">
              Buch anlegen
            </h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-3 items-center text-sm sm:flex-row sm:flex-wrap sm:justify-center sm:items-end"
            >
              <div className="flex flex-col gap-3 w-full sm:flex-row sm:flex-wrap sm:gap-3 sm:justify-center">
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    ISBN*
                  </span>
                  <input
                    {...register('isbn', { required: 'ISBN ist erforderlich' })}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                  <span className="text-error mt-1 min-h-[20px] block text-xs">
                    {errors.isbn ? (errors.isbn.message as string) : '\u00A0'}
                  </span>
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Rating* (1-5)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    {...register('rating', {
                      required: 'Rating ist erforderlich',
                      min: { value: 1, message: 'Mindestens 1' },
                      max: { value: 5, message: 'Höchstens 5' },
                      valueAsNumber: true,
                    })}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                  {errors.rating && (
                    <span className="text-error mt-1 text-xs">
                      {errors.rating.message as string}
                    </span>
                  )}
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Preis*
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    {...register('preis', {
                      required: 'Preis ist erforderlich',
                      min: 0,
                    })}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                  {errors.preis && (
                    <span className="text-error mt-1 text-xs">
                      {errors.preis.message as string}
                    </span>
                  )}
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Titel*
                  </span>
                  <input
                    {...register('titel', {
                      required: 'Titel ist erforderlich',
                    })}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                  {errors.titel && (
                    <span className="text-error mt-1 text-xs">
                      {errors.titel.message as string}
                    </span>
                  )}
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Untertitel
                  </span>
                  <input
                    {...register('untertitel')}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">Art</span>
                  <select
                    {...register('art')}
                    className="select select-bordered w-full max-w-xs select-sm"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="PAPERBACK">PAPERBACK</option>
                    <option value="HARDCOVER">HARDCOVER</option>
                    <option value="EPUB">EPUB</option>
                  </select>
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Rabatt
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    {...register('rabatt', {
                      min: {
                        value: 0,
                        message: 'Rabatt darf nicht negativ sein',
                      },
                    })}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                  {errors.rabatt && (
                    <span className="text-error mt-1 text-xs">
                      {errors.rabatt.message as string}
                    </span>
                  )}
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Lieferbar
                  </span>
                  <input
                    type="checkbox"
                    {...register('lieferbar')}
                    className="checkbox checkbox-accent checkbox-sm"
                  />
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Datum
                  </span>
                  <input
                    type="date"
                    {...register('datum')}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Homepage
                  </span>
                  <input
                    type="url"
                    {...register('homepage')}
                    className="input input-bordered w-full max-w-xs input-sm"
                  />
                </label>
                <label className="form-control w-full max-w-xs text-sm sm:w-64">
                  <span className="label-text font-semibold text-sm">
                    Schlagwörter (kommagetrennt)
                  </span>
                  <textarea
                    {...register('schlagwoerter')}
                    className="textarea textarea-bordered w-full max-w-xs textarea-sm"
                    rows={2}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-accent w-full btn-sm sm:w-40"
              >
                Anlegen
              </button>
            </form>
            {message && (
              <div>
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-error text-error-content rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center animate-pop-in">
                    <div className="mb-4 text-lg font-semibold">{message}</div>
                    <button
                      className="btn btn-accent w-full mt-2"
                      onClick={() => setMessage(null)}
                      autoFocus
                      type="button"
                    >
                      OK
                    </button>
                  </div>
                </div>
                <div
                  className="fixed inset-0 bg-primary opacity-40 z-40"
                  onClick={() => setMessage(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default Create;
