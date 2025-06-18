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
  rating?: number;
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
      // Rabatt as percentage (works for both string and number)
      if (key.toLowerCase() === 'rabatt') {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (!isNaN(num)) {
          const percent = (num * 100).toFixed(1).replace(/\.0$/, '');
          return (
            <div key={key}><span className="font-bold capitalize">Rabatt:</span> {percent}%</div>
          );
        }
      }
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
              <span key={idx} className="bg-neutral text-primary-content px-2 py-1 rounded text-xs">{typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}</span>
            ))}
          </div>
        </div>
      );
    }
    if (value !== null && typeof value === 'object') {
      return (
        <div key={key} className="flex flex-col">
          <span className="font-bold capitalize">{key}:</span>
          <pre className="text-xs text-info-content bg-base-200 rounded p-2 mt-2 overflow-x-auto">
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

// Helper to render book image
const BookImage = ({ bookId, title }: { bookId: string, title?: string }) => {
  const imgSrc = `https://localhost:3000/rest/file/${encodeURIComponent(bookId)}`;
  const [error, setError] = useState(false);
  return (
    <div className="w-28 h-36 flex items-center justify-center bg-base-200 rounded shadow border border-base-300 overflow-hidden mr-4">
      {!error ? (
        <img
          src={imgSrc}
          alt={title ? `Cover von ${title}` : 'Buchcover'}
          className="object-cover w-full h-full"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-neutral-content">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6" />
          </svg>
          <span className="text-xs">Kein Bild</span>
        </div>
      )}
    </div>
  );
};

const SearchPage = () => {
  const { register, handleSubmit, setValue, watch, getValues } = useForm<SearchFormInputs>({
    defaultValues: { rating: undefined }
  });
  const [books, setBooks] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [lastSearchAll, setLastSearchAll] = useState(false);
  const [lastSearchInput, setLastSearchInput] = useState<SearchFormInputs>({ query: '', art: '' });
  const [bookEtags, setBookEtags] = useState<Record<string, string>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedRating = watch('rating');

  const onSubmit = async (data: SearchFormInputs, pageOverride?: number, pageSizeOverride?: number) => {
    // Use getValues to get the latest rating value
    const formValues = getValues();
    // Accept both string and number for rating
    let rating: number | undefined = undefined;
    if (
      formValues.rating !== undefined &&
      formValues.rating !== null &&
      !(typeof formValues.rating === 'string' && formValues.rating === '')
    ) {
      rating = typeof formValues.rating === 'string' ? Number(formValues.rating) : formValues.rating;
    }
    setLastSearchInput({ ...data, rating });
    setLoading(true);
    setError(null);
    setBooks(null);
    const input = data.query.trim();
    const art = data.art || '';
    const isAllBooks = !input && !art && !rating;
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
      if (typeof rating === 'number' && !isNaN(rating)) {
        params.append('rating', String(rating));
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
        } catch {//
        }
        setError(errorText);
        return;
      }
      setBooks((prev) => {
        if (!prev) return prev;
        // Handle paginated and non-paginated
        const isPaginated = prev.length === 1 && prev[0] && typeof prev[0] === 'object' && 'content' in prev[0] && Array.isArray((prev[0] as unknown as { content?: unknown }).content);
        if (isPaginated) {
          const paginated = prev[0] as unknown as { content: Array<Record<string, unknown>>; [key: string]: unknown };
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

  // Add delete handler
  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm('Soll das Buch wirklich gelöscht werden?')) return;
    const token = Cookies.get('access_token');
    if (!token) {
      setError('Nicht eingeloggt oder keine Berechtigung');
      return;
    }
    try {
      const res = await fetch(`https://localhost:3000/rest/${encodeURIComponent(bookId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok && res.status !== 204) {
        setError('Fehler beim Löschen des Buchs');
        return;
      }
      setBooks((prev) => {
        if (!prev) return prev;
        // Handle paginated and non-paginated
        const isPaginated = prev.length === 1 && prev[0] && typeof prev[0] === 'object' && 'content' in prev[0] && Array.isArray((prev[0] as unknown as { content?: unknown }).content);
        if (isPaginated) {
          const paginated = prev[0] as unknown as { content: Array<Record<string, unknown>>; [key: string]: unknown };
          const updatedContent = paginated.content.filter((b) => (typeof b.id === 'string' ? b.id : String(b.id)) !== bookId);
          return [{ ...paginated, content: updatedContent }] as unknown as Book[];
        } else {
          return prev.filter(b => b.id !== bookId);
        }
      });
    } catch {
      setError('Fehler beim Löschen des Buchs');
    }
  };

  // Render list of books (paginated or not)
  const renderBooks = () => {
    if (!books) return null;
    if (books.length === 0) {
      return <div className="text-primary-content mt-8">Keine Bücher gefunden oder ungültige Antwort.</div>;
    }
    const username = Cookies.get('username');
    const isAdmin = username === 'admin';
    // Paginated response
    const maybePaginated = books.length === 1 && books[0] && typeof books[0] === 'object' && 'content' in books[0] && Array.isArray((books[0] as unknown as Record<string, unknown>).content);
    if (maybePaginated) {
      const paginated = books[0] as unknown as Record<string, unknown>;
      const contentBooks = paginated.content as Array<Record<string, unknown>>;
      const pageInfo = paginated.page as Record<string, unknown> | undefined;
      return (
        <div className="mt-8 w-full max-w-2xl bg-base-100 rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-primary-content border-b border-base-300 pb-2">Gefundene Bücher:</h3>
          <ul className="divide-y divide-base-300">
            {contentBooks.map((buch, idx) => {
              const entries = Object.entries(buch);
              const schlagwoerter = (entries.find(([key]) => key.toLowerCase() === 'schlagwoerter')?.[1]) as string[] | undefined;
              return (
                <li key={typeof buch.id === 'string' ? buch.id : idx} className="py-4 text-primary-content flex items-start relative">
                  {isAdmin && (
                    <button
                      title="Buch löschen"
                      onClick={() => handleDeleteBook(typeof buch.id === 'string' ? buch.id : String(buch.id))}
                      className="absolute top-0 right-0 p-2 rounded-full transition-colors hover:bg-error group"
                    >
                      <svg className="w-6 h-6 text-neutral-content group-hover:text-error-content transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <BookImage
                    bookId={typeof buch.id === 'string' ? buch.id : String(buch.id)}
                    title={(() => {
                      const t = buch.titel;
                      if (typeof t === 'string') return t;
                      if (t && typeof t === 'object' && 'titel' in t && typeof t.titel === 'string') return t.titel;
                      return undefined;
                    })()}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-x-8 gap-y-2 items-center mb-2">
                      {renderBookFields(entries)}
                    </div>
                    {Array.isArray(schlagwoerter) && schlagwoerter.length > 0 && (
                      <div className="mb-2">
                        <div className="font-bold mb-1">Schlagwörter:</div>
                        <div className="flex flex-wrap gap-2">
                          {schlagwoerter.map((wort, i) => (
                            <span key={wort + '-' + i} className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-accent/50">{wort}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                      {renderOtherFields(entries, handleRatingChange, buch.id as string)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {pageInfo && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-neutral-content text-sm gap-2">
              <span>Seite: {typeof pageInfo.number === 'number' ? (pageInfo.number + 1) : ''} / {pageInfo.totalPages as number} &nbsp; (insgesamt {pageInfo.totalElements as number} Bücher)</span>
              <div className="flex gap-2 mt-2 sm:mt-0 items-center">
                <button
                  className="px-3 py-1 rounded bg-info text-info-content disabled:opacity-50"
                  disabled={typeof pageInfo.number !== 'number' || pageInfo.number <= 0}
                  onClick={() => handlePageChange((pageInfo.number as number) - 1)}
                >
                  Zurück
                </button>
                <button
                  className="px-3 py-1 rounded bg-info text-info-content disabled:opacity-50"
                  disabled={typeof pageInfo.number !== 'number' || (pageInfo.number as number) >= (pageInfo.totalPages as number) - 1}
                  onClick={() => handlePageChange((pageInfo.number as number) + 1)}
                >
                  Weiter
                </button>
                {lastSearchAll && (
                  <div className="flex items-center gap-2 ml-4">
                    <label htmlFor="pageSizeBottom" className="text-primary-content">Pro Seite:</label>
                    <select
                      id="pageSizeBottom"
                      className="rounded p-2 bg-base-100 text-primary-content"
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
      <div className="mt-8 w-full max-w-2xl bg-primary rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-4 text-primary-content border-b border-base-300 pb-2">Gefundene Bücher:</h3>
        <ul className="divide-y divide-base-300">
          {books.map((buch, idx) => {
            const entries = Object.entries(buch);
            const schlagwoerter = (entries.find(([key]) => key.toLowerCase() === 'schlagwoerter')?.[1]) as string[] | undefined;
            return (
              <li key={buch.id || idx} className="py-4 text-primary-content flex items-start relative">
                {isAdmin && (
                  <button
                    title="Buch löschen"
                    onClick={() => handleDeleteBook(buch.id)}
                    className="absolute top-0 right-0 p-2 rounded-full transition-colors hover:bg-error group"
                  >
                    <svg className="w-6 h-6 text-neutral-content group-hover:text-error-content transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <BookImage
                  bookId={buch.id}
                  title={(() => {
                    const t = buch.titel;
                    if (typeof t === 'string') return t;
                    if (t && typeof t === 'object' && 'titel' in t && typeof t.titel === 'string') return t.titel;
                    return undefined;
                  })()}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 items-center mb-2">
                    {renderBookFields(entries)}
                  </div>
                  {Array.isArray(schlagwoerter) && schlagwoerter.length > 0 && (
                    <div className="mb-2">
                      <div className="font-bold mb-1">Schlagwörter:</div>
                      <div className="flex flex-wrap gap-2">
                        {schlagwoerter.map((wort, i) => (
                          <span key={wort + '-' + i} className="bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-accent/50">{wort}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                    {renderOtherFields(entries, handleRatingChange, buch.id)}
                  </div>
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
        <h2 className="text-3xl font-bold mb-6 text-primary-content">Buchsuche</h2>
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
        <div className="w-full max-w-xs mb-4">
          <button
            type="button"
            className="flex items-center gap-2 text-info font-semibold focus:outline-none"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="filters-panel"
          >
            <span className="text-primary-content">Filter</span>
            <svg className={`w-5 h-5 transition-transform text-primary-content ${filtersOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          {filtersOpen && (
            <div id="filters-panel" className="mt-4 p-4 rounded bg-primary flex flex-col gap-4 animate-fade-in">
              <label className="form-control w-full">
                <span className="label-text font-semibold">Buchtyp</span>
                <select
                  id="art"
                  {...register('art')}
                  className="select select-bordered w-full"
                  defaultValue=""
                >
                  <option value="">Alle Typen</option>
                  <option value="EPUB">EPUB</option>
                  <option value="HARDCOVER">HARDCOVER</option>
                  <option value="PAPERBACK">PAPERBACK</option>
                </select>
              </label>
              <div className="form-control w-full">
                <span className="label-text font-semibold mb-2">Bewertung (mindestens)</span>
                <div className="flex flex-col gap-2 items-start">
                  {[1,2,3,4,5].map((star) => (
                    <label key={star} className="flex flex-row items-center cursor-pointer gap-2">
                      <input
                        type="radio"
                        value={star}
                        {...register('rating')}
                        checked={selectedRating === star}
                        onChange={() => setValue('rating', star)}
                        className="form-radio h-4 w-4 text-info border-base-300 focus:ring focus:ring-info"
                      />
                      <StarRating rating={star} interactive={false} />
                    </label>
                  ))}
                  <label className="flex flex-row items-center cursor-pointer gap-2 mt-2">
                    <input
                      type="radio"
                      value=""
                      {...register('rating')}
                      checked={selectedRating === undefined}
                      onChange={() => setValue('rating', undefined)}
                      className="form-radio h-4 w-4 text-info border-base-300 focus:ring focus:ring-info"
                    />
                    <span className="text-xs text-neutral-content">Alle</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-accent w-full"
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
