import { useForm } from 'react-hook-form';
import { useState } from 'react';
import './App.css';
import Cookies from 'js-cookie';

interface Book {
  id: string;
  isbn: string;
  rating: number;
  preis: number;
  art: string;
  rabatt: number;
  lieferbar: boolean;
  datum: string;
  homepage: string;
  schlagwoerter?: string[];
  abbildungen?: Array<{ contentType: string; beschriftung?: string; }>; // optional, as in backend
  titel: string | {
    titel: string;
    untertitel?: string;
  };
  // Add any other fields as needed from backend DTOs
}

interface SearchFormInputs {
  query: string;
  art?: string;
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
const renderOtherFields = (entries: [string, unknown][], onRatingChange?: (bookId: string, newRating: number) => void, bookId?: string) => {
  const username = Cookies.get('username');
  return entries.map(([key, value]) => {
    if ([
      'id', 'titel'
    ].includes(key) || key.toLowerCase() === 'schlagwoerter') return null;
    if (key.toLowerCase() === 'rating' && typeof value === 'number' && bookId) {
      const isAdmin = username === 'admin';
      return (
        <div key={key} className="flex items-center gap-2">
          <span className="font-bold capitalize">Bewertung:</span>
          <StarRating rating={value} onRatingChange={isAdmin ? (r) => onRatingChange && onRatingChange(bookId, r) : undefined} interactive={isAdmin} />
        </div>
      );
    }
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

const StarRating = ({ rating, onRatingChange, interactive }: { rating: number, onRatingChange?: (newRating: number) => void, interactive?: boolean }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onMouseLeave={interactive ? () => setHovered(null) : undefined}
          aria-label={`Set rating to ${star}`}
          disabled={!interactive}
          tabIndex={interactive ? 0 : -1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill={(hovered !== null && interactive ? star <= hovered : star <= rating) ? '#facc15' : '#374151'}
            className="w-6 h-6 transition-colors duration-150"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const SearchPage = () => {
  const { register, handleSubmit } = useForm<SearchFormInputs>();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [lastSearchAll, setLastSearchAll] = useState(false);
  const [lastSearchInput, setLastSearchInput] = useState<SearchFormInputs>({ query: '', art: '' });
  const [bookEtags, setBookEtags] = useState<Record<string, string>>({});

  const onSubmit = async (data: SearchFormInputs, pageOverride?: number, pageSizeOverride?: number) => {
    setLastSearchInput(data);
    setLoading(true);
    setError(null);
    setBooks(null);
    const input = data.query.trim();
    const art = data.art || '';
    const isAllBooks = !input && !art;
    setLastSearchAll(isAllBooks);
    if (isAllBooks && typeof pageOverride !== 'number') setPage(0);
    try {
      let url = 'https://localhost:3000/rest';
      const isbnRegex = /^(97(8|9)[- ]?)?\d{1,5}[- ]?\d{1,7}[- ]?\d{1,7}[- ]?[\dX]$/i;
      const params = new URLSearchParams();
      if (input) {
        if (isbnRegex.test(input)) {
          params.append('isbn', input);
        } else {
          url += `/${encodeURIComponent(input)}`;
        }
      }
      if (art) {
        params.append('art', art);
      }
      if (isAllBooks) {
        const pageParam = (typeof pageOverride === 'number' ? pageOverride : page) + 1;
        const sizeParam = typeof pageSizeOverride === 'number' ? pageSizeOverride : pageSize;
        params.append('page', String(pageParam));
        params.append('size', String(sizeParam));
      }
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }
      const res = await fetch(url);
      const etags: Record<string, string> = {};
      const etag = res.headers.get('etag');
      if (etag && data.query.trim()) {
        etags[data.query.trim()] = etag;
      }
      if (res.status === 304 || res.status === 204) {
        setBooks([]);
        setError(res.status === 304 ? 'Keine neuen Daten (304 Not Modified) und kein Buch im Body.' : 'Kein Buch gefunden (204 No Content).');
        return;
      }
      if (!res.ok) {
        let errorText = 'Fehler beim Laden der Bücher';
        try {
          const errorResult = await res.json();
          errorText = errorResult?.message || errorResult?.error || errorText;
        } catch { /* ignore */ }
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
      if (result && typeof result === 'object' && result.id) {
        const etag = res.headers.get('etag');
        if (etag && result.id) {
          etags[result.id] = etag;
        }
      }
      setBookEtags(prev => ({ ...prev, ...etags }));
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

  const handleRatingChange = async (bookId: string, newRating: number) => {
    const token = Cookies.get('access_token');
    if (!token) {
      setError('Nicht eingeloggt oder keine Berechtigung');
      return;
    }
    // Find the book to update (handle paginated and non-paginated)
    let bookToUpdate: Book | undefined = undefined;
    if (books && books.length > 0) {
      // Check if paginated (books[0].content is an array)
      const firstBook = books[0] as unknown;
      const isPaginated = typeof firstBook === 'object' && firstBook !== null && 'content' in firstBook && Array.isArray((firstBook as { content?: unknown }).content);
      if (isPaginated) {
        const contentBooks = (firstBook as { content: Book[] }).content;
        bookToUpdate = contentBooks.find(b => b.id === bookId);
      } else {
        bookToUpdate = books.find(b => b.id === bookId);
      }
    }
    if (!bookToUpdate) {
      setError('Buch nicht gefunden: ' + bookId);
      return;
    }
    // Build the full book object for PUT (copy all fields, update rating)
    const fullBook: Book = {
      ...bookToUpdate,
      rating: newRating,
    };
    let etag = bookEtags[bookId];
    if (!etag) {
      // Fetch ETag for this book
      try {
        const res = await fetch(`https://localhost:3000/rest/${encodeURIComponent(bookId)}`);
        if (!res.ok) throw new Error('Fehler beim Nachladen des ETags');
        const fetchedEtag = res.headers.get('etag');
        if (fetchedEtag) {
          etag = fetchedEtag;
          setBookEtags(prev => ({ ...prev, [bookId]: fetchedEtag }));
        }
      } catch {
        setError('ETag für das Buch nicht gefunden. Bitte laden Sie die Seite neu.');
        return;
      }
    }
    if (!etag) {
      setError('ETag für das Buch nicht gefunden. Bitte laden Sie die Seite neu.');
      return;
    }
    try {
      const res = await fetch(`https://localhost:3000/rest/${encodeURIComponent(bookId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'If-Match': etag,
        },
        body: JSON.stringify(fullBook)
      });
      if (!res.ok) {
        let errorText = 'Fehler beim Aktualisieren der Bewertung';
        try {
          const errorResult = await res.json();
          if (errorResult && (errorResult.message || errorResult.error)) {
            errorText = errorResult.message || errorResult.error;
          }
        } catch {
          // ignore JSON parse errors
        }
        setError(errorText);
        return;
      }
      setBooks((prev) => {
        if (!prev) return prev;
        // Check if paginated
        const firstBook = prev[0] as unknown;
        const isPaginated = prev.length === 1 && typeof firstBook === 'object' && firstBook !== null && 'content' in firstBook && Array.isArray((firstBook as { content?: unknown }).content);
        if (isPaginated) {
          // Update in content array
          const paginated = firstBook as { content: Book[] };
          const updatedContent = paginated.content.map(b => b.id === bookId ? { ...b, rating: newRating } : b);
          return [{ ...paginated, content: updatedContent }] as unknown as Book[];
        } else {
          // Update in flat array
          return prev.map(b => b.id === bookId ? { ...b, rating: newRating } : b);
        }
      });
      // Update ETag if present in response
      const newEtag = res.headers.get('etag');
      if (newEtag) {
        setBookEtags(prev => ({ ...prev, [bookId]: newEtag }));
      }
    } catch {
      setError('Fehler beim Aktualisieren der Bewertung');
    }
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
                    {renderOtherFields(entries, handleRatingChange, buch.id as string)}
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
                  {renderOtherFields(entries, handleRatingChange, buch.id)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div data-theme="black" className="bg-primary min-h-screen flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit((data) => onSubmit(data, 0, pageSize))} className="bg-base-100 rounded-lg p-8 shadow-lg flex flex-col items-center w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-white">Buchsuche</h2>
        <label className="form-control w-full max-w-xs mb-4 min-h-[92px]">
          <span className="label-text font-semibold">Buch ID oder ISBN</span>
          <input
            id="query"
            type="text"
            {...register('query')}
            className="input input-bordered w-full max-w-xs"
            placeholder="Geben Sie die Buch-ID oder ISBN ein"
          />
        </label>
        <label className="form-control w-full max-w-xs mb-4">
          <span className="label-text font-semibold">Buchtyp</span>
          <select
            id="art"
            {...register('art')}
            className="select select-bordered w-full max-w-xs"
            defaultValue=""
          >
            <option value="">Alle Typen</option>
            <option value="EPUB">EPUB</option>
            <option value="HARDCOVER">HARDCOVER</option>
            <option value="PAPERBACK">PAPERBACK</option>
          </select>
        </label>
        <button
          type="submit"
          className="btn btn-info w-full"
        >
          Suchen
        </button>
        {error && (
          <div className="text-error text-sm text-center">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-info text-sm text-center">
            Lade Bücher...
          </div>
        )}
      </form>
      {renderBooks()}
    </div>
  );
};

export default SearchPage;
