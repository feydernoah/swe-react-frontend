import TopBar from './TopBar';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { refreshAccessToken } from './TokenRefresher';


type FormData = {
  isbn: string;
  rating: number;
  preis: number;
  titel: string;
  untertitel?: string;
};

const Create = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [message, setMessage] = useState<string | null>(null);


  const onSubmit = async (data: FormData) => {
    // Vor dem Request: Access Token prüfen und ggf. refreshen
    let token = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
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
    
    const payload = {
      isbn: data.isbn,
      rating: Number(data.rating),
      preis: Number(data.preis),
      titel: {
        titel: data.titel,
        untertitel: data.untertitel || undefined,
      },
    };
    try {
      const response = await fetch('https://localhost:3000/rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
            setMessage('Fehler: ' + (errorJson.message || JSON.stringify(errorJson)));
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

  if (username !== 'admin') {
    return (
      <div className="app-bg min-h-screen">
        <TopBar hasToken={hasToken} username={username} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
          <p>Nur Admins können Bücher anlegen.</p>
        </div>
      </div>
    );
  } else {
    return (
      <div data-theme="black" className="bg-primary min-h-screen">
        <TopBar hasToken={hasToken} username={username} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Buch anlegen</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="block font-semibold">ISBN*</label>
              <input {...register('isbn', { required: 'ISBN ist erforderlich' })} className="border rounded px-2 py-1 w-full" />
              {errors.isbn && <span className="text-red-500 text-sm">{errors.isbn.message as string}</span>}
            </div>
            <div>
              <label className="block font-semibold">Rating* (0-5)</label>
              <input type="number" min={0} max={5} step={1} {...register('rating', {
                required: 'Rating ist erforderlich',
                min: { value: 0, message: 'Rating muss mindestens 0 sein' },
                max: { value: 5, message: 'Rating darf höchstens 5 sein' },
              })} className="border rounded px-2 py-1 w-full" />
              {errors.rating && <span className="text-red-500 text-sm">{errors.rating.message as string}</span>}
            </div>
            <div>
              <label className="block font-semibold">Preis*</label>
              <input type="number" step="0.01" {...register('preis', { required: 'Preis ist erforderlich', min: 0 })} className="border rounded px-2 py-1 w-full" />
              {errors.preis && <span className="text-red-500 text-sm">{errors.preis.message as string}</span>}
            </div>
            <div>
              <label className="block font-semibold">Titel*</label>
              <input {...register('titel', { required: 'Titel ist erforderlich' })} className="border rounded px-2 py-1 w-full" />
              {errors.titel && <span className="text-red-500 text-sm">{errors.titel.message as string}</span>}
            </div>
            <div>
              <label className="block font-semibold">Untertitel</label>
              <input {...register('untertitel')} className="border rounded px-2 py-1 w-full" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Anlegen</button>
          </form>
          {message && (
            <div>
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-red-600 text-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center animate-pop-in">
                  <div className="mb-4 text-lg font-semibold">{message}</div>
                  <button
                    className="mt-2 px-4 py-2 bg-white text-red-700 rounded hover:bg-gray-100 font-bold"
                    onClick={() => setMessage(null)}
                    autoFocus
                    type="button"
                  >
                    OK
                  </button>
                </div>
              </div>
              <div className="fixed inset-0 bg-black opacity-40 z-40" onClick={() => setMessage(null)} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Create;
