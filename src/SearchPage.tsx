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

// Helper to render book fields
const renderBookFields = (entries: [string, unknown][]) => {
  return entries.map(([key, value]) => {
    if (key.toLowerCase() === 'schlagwoerter') return null;
    if (key === 'id') {
      return (
        <div key={key}><span className="font-bold capitalize">Id:</span> {String(value)}</div>
      );
    }
    if (key === 'titel') {
      if (typeof value === 'string' || typeof value === 'number') {
        return (
          <div key={key}><span className="font-bold capitalize">Titel:</span> {value}</div>
        );
      } else if (value && typeof value === 'object') {
        const titelObj = value as Record<string, unknown>;
        return [
          typeof titelObj.titel === 'string' && (
            <div key="titelText"><span className="font-bold capitalize">Titel:</span> {titelObj.titel}</div>
          ),
          typeof titelObj.untertitel === 'string' && (
            <div key="untertitelText"><span className="font-bold capitalize">Untertitel:</span> {titelObj.untertitel}</div>
          )
        ].filter(Boolean);
      } else {
        return (
          <div key={key}><span className="font-bold capitalize">Titel:</span> {String(value)}</div>
        );
      }
    }
    return null;
  });
};

// Helper to render other fields
const renderOtherFields = (entries: [string, unknown][]) => {
  return entries.map(([key, value]) => {
    if ([
      'id', 'titel'
    ].includes(key) || key.toLowerCase() === 'schlagwoerter') return null;
    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <div key={key}><span className="font-bold capitalize">{key}:</span> {value}</div>
      );
    }
    if (Array.isArray(value)) {
      return (
        <div key={key} className="flex flex-col">
          <span className="font-bold capitalize">{key}:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {value.map((item, idx) => (
              <span key={idx} className="bg-gray-700 text-white px-2 py-1 rounded text-xs">{typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}</span>
            ))}
          </div>
        </div>
      );
    }
    if (value !== null && typeof value === 'object') {
      return (
        <div key={key} className="flex flex-col">
          <span className="font-bold capitalize">{key}:</span>
          <pre className="text-xs text-gray-300 bg-gray-900 rounded p-2 mt-2 overflow-x-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      );
    }
    return null;
  });
};

const SearchPage = () => {
  const { register, handleSubmit } = useForm<SearchFormInputs>();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [lastSearchAll, setLastSearchAll] = useState(false);
  const [lastSearchInput, setLastSearchInput] = useState<SearchFormInputs>({ id: '' });

  const onSubmit = async (data: SearchFormInputs, pageOverride?: number, pageSizeOverride?: number) => {
    setLastSearchInput(data); // Save last search input
    setLoading(true);
    setError(null);
    setBooks(null);
    const isAllBooks = !data.id.trim();
    setLastSearchAll(isAllBooks);
    if (isAllBooks && typeof pageOverride !== 'number') setPage(0); // Reset page if new all-books search
    try {
      let url = 'https://localhost:3000/rest';
      if (data.id.trim()) {
        url += `/${encodeURIComponent(data.id.trim())}`;
      }
      if (isAllBooks) {
        // Use 1-based page index for backend
        const pageParam = (typeof pageOverride === 'number' ? pageOverride : page) + 1;
        const sizeParam = typeof pageSizeOverride === 'number' ? pageSizeOverride : pageSize;
        url += `?page=${pageParam}&size=${sizeParam}`;
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

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onSubmit(lastSearchInput, newPage, pageSize);
  };

  // Handler for page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(0);
    onSubmit(lastSearchInput, 0, newSize);
  };

  // Render list of books (paginated or not)
  const renderBooks = () => {
    if (!books) return null;
    if (books.length === 0) {
      return <div className="text-white mt-8">Keine Bücher gefunden oder ungültige Antwort.</div>;
    }
    // Paginated response
    const maybePaginated = books.length === 1 && books[0] && typeof books[0] === 'object' && 'content' in books[0] && Array.isArray((books[0] as unknown as Record<string, unknown>).content);
    if (maybePaginated) {
      const paginated = books[0] as unknown as Record<string, unknown>;
      const contentBooks = paginated.content as Array<Record<string, unknown>>;
      const pageInfo = paginated.page as Record<string, unknown> | undefined;
      return (
        <div className="mt-8 w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Gefundene Bücher:</h3>
          <ul className="divide-y divide-gray-700">
            {contentBooks.map((buch, idx) => {
              const entries = Object.entries(buch);
              const schlagwoerter = (entries.find(([key]) => key.toLowerCase() === 'schlagwoerter')?.[1]) as string[] | undefined;
              return (
                <li key={buch.id as string || idx} className="py-4 text-white">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 items-center mb-2">
                    {renderBookFields(entries)}
                  </div>
                  {Array.isArray(schlagwoerter) && schlagwoerter.length > 0 && (
                    <div className="mb-2">
                      <div className="font-bold mb-1">Schlagwörter:</div>
                      <div className="flex flex-wrap gap-2">
                        {schlagwoerter.map((wort, i) => (
                          <span key={wort + '-' + i} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-blue-400">{wort}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                    {renderOtherFields(entries)}
                  </div>
                </li>
              );
            })}
          </ul>
          {pageInfo && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-sm gap-2">
              <span>Seite: {typeof pageInfo.number === 'number' ? (pageInfo.number + 1) : ''} / {pageInfo.totalPages as number} &nbsp; (insgesamt {pageInfo.totalElements as number} Bücher)</span>
              <div className="flex gap-2 mt-2 sm:mt-0 items-center">
                <button
                  className="px-3 py-1 rounded bg-blue-700 text-white disabled:opacity-50"
                  disabled={typeof pageInfo.number !== 'number' || pageInfo.number <= 0}
                  onClick={() => handlePageChange((pageInfo.number as number) - 1)}
                >
                  Zurück
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-700 text-white disabled:opacity-50"
                  disabled={typeof pageInfo.number !== 'number' || (pageInfo.number as number) >= (pageInfo.totalPages as number) - 1}
                  onClick={() => handlePageChange((pageInfo.number as number) + 1)}
                >
                  Weiter
                </button>
                {lastSearchAll && (
                  <div className="flex items-center gap-2 ml-4">
                    <label htmlFor="pageSizeBottom" className="text-white">Pro Seite:</label>
                    <select
                      id="pageSizeBottom"
                      className="rounded p-2 bg-white text-black"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    >
                      {[5, 10, 20, 50].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    // Default: render books as before
    return (
      <div className="mt-8 w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-4 text-white border-b border-gray-600 pb-2">Gefundene Bücher:</h3>
        <ul className="divide-y divide-gray-700">
          {books.map((buch, idx) => {
            const entries = Object.entries(buch);
            const schlagwoerter = (entries.find(([key]) => key.toLowerCase() === 'schlagwoerter')?.[1]) as string[] | undefined;
            return (
              <li key={buch.id || idx} className="py-4 text-white">
                <div className="flex flex-wrap gap-x-8 gap-y-2 items-center mb-2">
                  {renderBookFields(entries)}
                </div>
                {Array.isArray(schlagwoerter) && schlagwoerter.length > 0 && (
                  <div className="mb-2">
                    <div className="font-bold mb-1">Schlagwörter:</div>
                    <div className="flex flex-wrap gap-2">
                      {schlagwoerter.map((wort, i) => (
                        <span key={wort + '-' + i} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-blue-400">{wort}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                  {renderOtherFields(entries)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="app-bg flex-1 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6 text-white">Buchsuche</h2>
      <form onSubmit={handleSubmit((data) => onSubmit(data, 0, pageSize))} className="flex flex-col items-center gap-4 w-full max-w-md">
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
      {renderBooks()}
    </div>
  );
};

export default SearchPage;
