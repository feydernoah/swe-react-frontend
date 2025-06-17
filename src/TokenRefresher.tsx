import Cookies from 'js-cookie';

/**
 * Holt mit dem Refresh Token einen neuen Access Token und setzt beide Cookies neu.
 * @returns Das neue Token-Response-Objekt
 * @throws Error, wenn das Refreshing fehlschlägt
 */
export async function refreshAccessToken() {
  const refreshToken = Cookies.get('refresh_token');
  if (!refreshToken) {
    throw new Error('Kein Refresh Token vorhanden');
  }
  const params = new URLSearchParams();
  params.append('refresh_token', refreshToken);

  const response = await fetch('https://localhost:3000/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!response.ok) {
    throw new Error('Token Refresh fehlgeschlagen');
  }
  const result = await response.json();
  if (result.access_token && result.refresh_token) {
    Cookies.set('access_token', result.access_token, { expires: 0.0208 });
    Cookies.set('refresh_token', result.refresh_token, { expires: 0.0417 });
    const username = Cookies.get('username');
    if (username) {
      Cookies.set('username', username, { expires: 0.0417 });
    }
  }
  return result;
}
