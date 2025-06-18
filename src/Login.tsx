import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useState } from 'react';

type LoginFormInputs = { username: string; password: string };

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const params = new URLSearchParams();
      params.append('username', data.username);
      params.append('password', data.password);
      const response = await fetch('https://localhost:3000/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      if (response.status === 401) {
        setErrorMessage(
          'Login fehlgeschlagen: Benutzername oder Passwort falsch.',
        );
        return;
      }
      const result = await response.json();
      if (result.access_token) {
        Cookies.set('access_token', result.access_token, { expires: 0.0208 });
        Cookies.set('refresh_token', result.refresh_token, { expires: 0.0417 });
        Cookies.set('username', data.username, { expires: 0.0417 });
      }
      navigate('/');
      window.location.reload();
    } catch (error) {
      setErrorMessage('Fehler beim Login: ' + error);
    }
  };
  return (
    <div
      data-theme="black"
      className="bg-primary flex flex-col items-center justify-center min-h-screen"
    >
      <div className="bg-base-100 rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl text-neutral font-bold mb-4">Login</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full max-w-xs mt-4 items-center"
        >
          <label className="form-control w-full max-w-xs mb-4">
            <span className="label-text text-neutral">E-Mail</span>
            <input
              type="text"
              {...register('username', {
                required: 'Username ist erforderlich',
              })}
              className="input input-bordered input-primary w-full max-w-xs"
            />
            {errors.username && (
              <span className="text-error mt-1">
                {errors.username.message as string}
              </span>
            )}
          </label>
          <label className="form-control w-full max-w-xs mb-4">
            <span className="label-text text-neutral">Passwort</span>
            <input
              type="password"
              {...register('password', {
                required: 'Passwort ist erforderlich',
              })}
              className="input input-bordered input-primary w-full max-w-xs"
            />
            {errors.password && (
              <span className="text-error mt-1">
                {errors.password.message as string}
              </span>
            )}
          </label>
          <button type="submit" className="btn btn-accent">
            Login
          </button>
        </form>
        {errorMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-error text-error-content rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center animate-pop-in">
              <div className="mb-4 text-lg font-semibold">{errorMessage}</div>
              <button
                className="btn btn-accent w-full mt-2"
                onClick={() => setErrorMessage(null)}
                autoFocus
                type="button"
              >
                OK
              </button>
            </div>
          </div>
        )}
        {errorMessage && (
          <div
            className="fixed inset-0 bg-primary opacity-40 z-40"
            onClick={() => setErrorMessage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
