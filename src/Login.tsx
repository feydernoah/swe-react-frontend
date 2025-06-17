import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Login.css';

type LoginFormInputs = { username: string; password: string };

const LoginPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
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
      const result = await response.json();
      if (result.access_token) {
        Cookies.set('access_token', result.access_token, { expires: 0.0208 });
        Cookies.set('refresh_token', result.refresh_token, { expires: 0.0417 });
        Cookies.set('username', data.username, { expires: 0.0417 });
      }
      navigate('/');
      window.location.reload();
    } catch (error) {
      alert('Fehler beim Login: ' + error);
    }
  };
  return (

    <div data-theme="black" className="bg-primary flex flex-col items-center justify-center min-h-screen">
      <div className="bg-base-100 rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl text-neutral font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <label className="form-control w-full max-w-xs mb-4">
          <span className="label-text text-neutral">E-Mail</span>
          <input type="text" {...register('username', { required: 'Username ist erforderlich' })} className="input input-bordered input-primary w-full max-w-xs" />
          {errors.username && <span className="text-error mt-1">{errors.username.message as string}</span>}
        </label>
        <label className="form-control w-full max-w-xs mb-4">
          <span className="label-text text-neutral">Passwort</span>
          <input type="password" {...register('password', { required: 'Passwort ist erforderlich' })} className="input input-bordered input-primary w-full max-w-xs" />
          {errors.password && <span className="text-error mt-1">{errors.password.message as string}</span>}
        </label>
        <button type="submit" className="btn btn-accent">Login</button>
      </form>
       </div>
    </div>
  );
};

export default LoginPage;
