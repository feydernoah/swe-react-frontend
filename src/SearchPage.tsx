import { useForm } from 'react-hook-form';
import { useState } from 'react';
import './App.css';

interface Book {
  id: string;
  titel: string;
  // Add more fields as needed, but avoid 'any'.
}

interface SearchFormInputs {
  id: string;
}

const SearchPage = () => {
  const { register, handleSubmit } = useForm<SearchFormInputs>();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: SearchFormInputs) => {
    setLoading(true);
    setError(null);
    setBooks(null);
    try {
      let url = 'https://localhost:3000/rest';
      if (data.id.trim()) {
        url += `/${encodeURIComponent(data.id.trim())}`;
      }
      const res = await fetch(url);
      // 304 Not Modified: Versuche, trotzdem den Body zu lesen, falls einer kommt
      if (res.status === 304) {
        let result = null;
        try {
          result = await res.json();
        } catch {
          /* Body konnte nicht gelesen werden, ignoriere */
        }
        if (result) {
          setBooks(Array.isArray(result) ? result : (typeof result === 'object' ? [result] : []));
          setError(null);
        } else {
          setBooks([]);
          setError('Keine neuen Daten (304 Not Modified) und kein Buch im Body.');
        }
        return;
      }
      if (res.status === 204) {
        setBooks([]);
        setError('Kein Buch gefunden (204 No Content).');
        return;
      }
      if (!res.ok) {
        let errorText = 'Fehler beim Laden der Bücher';
        try {
          const errorResult = await res.json();
          if (errorResult && (errorResult.message || errorResult.error)) {
            errorText = errorResult.message || errorResult.error;
          }
        } catch {
          /* Fehler-Body konnte nicht gelesen werden, ignoriere */
        }
        setBooks([]);
        setError(errorText);
        return;
      }
      const result = await res.json();
      if (result && (result.statusCode || result.error || result.message)) {
        setBooks([]);
        setError(result.message || 'Fehlerhafte Antwort vom Server');
        return;
      }
      setBooks(Array.isArray(result) ? result : (result && typeof result === 'object' ? [result] : []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex-1 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6 text-white">Buchsuche</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4 w-full max-w-md">
        <input
          className="rounded p-2 w-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Buch-ID eingeben (leer = alle Bücher)"
          {...register('id')}
        />
        <button className="login-btn w-full" type="submit" disabled={loading}>
          {loading ? 'Suche...' : 'Suchen'}
        </button>
      </form>
      {error && <div className="text-red-400 mt-4">{error}</div>}
      {books && books.length === 0 && (
        <div className="text-white mt-8">Keine Bücher gefunden oder ungültige Antwort.</div>
      )}
      {books && books.length > 0 && (
        <div className="mt-8 w-full max-w-2xl bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2 text-white">Gefundene Bücher:</h3>
          <ul className="divide-y divide-gray-700">
            {books.map((buch, idx) => (
              <li key={buch.id || idx} className="py-2 text-white">
                {typeof buch.id === 'string' || typeof buch.id === 'number' ? (
                  <>
                    <span className="font-bold">ID:</span> {buch.id}
                  </>
                ) : null}
                {typeof buch.titel === 'string' || typeof buch.titel === 'number' ? (
                  <>
                    <span className="font-bold ml-2">Titel:</span> {buch.titel}
                  </>
                ) : null}
                {/* Render all other fields safely */}
                {Object.entries(buch).map(([key, value]) => {
                  if (key === 'id' || key === 'titel') return null;
                  if (typeof value === 'string' || typeof value === 'number') {
                    return (
                      <span key={key} className="ml-2">
                        <span className="font-bold">{key}:</span> {value}
                      </span>
                    );
                  }
                  if (value !== null && typeof value === 'object') {
                    return (
                      <pre key={key} className="text-xs text-gray-300 bg-gray-900 rounded p-2 mt-2 overflow-x-auto">
                        {key}: {JSON.stringify(value, null, 2)}
                      </pre>
                    );
                  }
                  return null;
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
