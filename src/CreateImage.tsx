import TopBar from './TopBar';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';

interface ImageFormData {
  isbn: string;
  image: FileList;
}

/**
 * Diese Komponente ermöglicht es Administratoren, ein Bild für ein bestehendes Buch hochzuladen.
 *
 * Funktionen:
 * - Formular mit ISBN und Bildauswahl
 * - Automatische Bildvorschau vor dem Upload
 * - Validierung der Eingaben mit react-hook-form
 * - Zugriff nur für Benutzer mit dem Benutzernamen "admin"
 * - Ermittlung der Buch-ID anhand der ISBN
 * - Bild-Upload über einen multipart/form-data POST-Request
 * - Anzeigen von Bestätigungs- und Fehlermeldungen
 */
const CreateImage = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
  } = useForm<ImageFormData>();
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Generiert eine Vorschau für das gewählte Bild
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setValue('image', files as FileList, { shouldValidate: true });
    trigger('image');
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setPreviewUrl(null);
    }
  };

  // Verarbeitet das Formular: ISBN prüfen, ID abrufen, Bild hochladen
  const onSubmit = async (data: ImageFormData) => {
    setMessage(null);
    setLoading(true);
    // Buch-id anhand der ISBN ermitteln
    let id: string | null = null;
    try {
      const res = await fetch(
        `https://localhost:3001/rest?isbn=${encodeURIComponent(data.isbn)}`,
      );
      const result = await res.json();
      if (
        result &&
        Array.isArray(result.content) &&
        result.content.length > 0 &&
        result.content[0].id
      ) {
        id = result.content[0].id;
      } else {
        throw new Error('Buch nicht gefunden');
      }
    } catch {
      setMessage('Buch mit dieser ISBN nicht gefunden!');
      setLoading(false);
      return;
    }
    // Bild-Datei validieren
    if (!data.image || data.image.length === 0) {
      setMessage('Bitte ein Bild auswählen.');
      setLoading(false);
      return;
    }

    // Upload des Bildes
    const formData = new FormData();
    formData.append('file', data.image[0]);
    const token = Cookies.get('access_token');
    try {
      const response = await fetch(`https://localhost:3001/rest/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        setMessage('Bild erfolgreich hochgeladen!');
        reset();
        setPreviewUrl(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
      } else {
        const errorText = await response.text();
        setMessage('Fehler beim Hochladen: ' + errorText);
      }
    } catch (error: unknown) {
      setMessage(
        'Fehler: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler'),
      );
    }
    setLoading(false);
  };

  if (username !== 'admin') {
    return (
      <div data-theme="black" className="bg-primary min-h-screen">
        <TopBar hasToken={hasToken} username={username} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
          <p>Nur Admins können Bilder anlegen.</p>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="black" className="bg-primary min-h-screen flex flex-col">
      <TopBar hasToken={hasToken} username={username} />
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-base-100 rounded-lg p-8 shadow-lg">
          <div className="p-8 w-full max-w-4xl flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Bild zu Buch hochladen</h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 w-full max-w-md flex flex-col"
              encType="multipart/form-data"
            >
              <label className="form-control w-full max-w-xs mb-4 min-h-[92px]">
                <span className="label-text font-semibold">ISBN*</span>
                <input
                  {...register('isbn', { required: 'ISBN ist erforderlich' })}
                  className="input input-bordered w-full max-w-xs"
                />
                <span className="text-error mt-1 min-h-[20px] block">
                  {errors.isbn ? (errors.isbn.message as string) : '\u00A0'}
                </span>
              </label>
              <div className="w-full" />
              <label className="form-control w-full max-w-xs mb-4">
                <span className="label-text font-semibold">Bild*</span>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image', { required: 'Bild ist erforderlich' })}
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full max-w-xs"
                  ref={imageInputRef}
                />
                {errors.image && (
                  <span className="text-error mt-1">
                    {errors.image.message as string}
                  </span>
                )}
              </label>
              {previewUrl && (
                <div className="flex justify-center items-center my-4">
                  <img
                    src={previewUrl}
                    alt="Vorschau"
                    className="rounded shadow border object-cover"
                    style={{ width: '180px', height: '180px' }}
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn btn-accent w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Hochladen...' : 'Bild hochladen'}
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
    </div>
  );
};

export default CreateImage;
