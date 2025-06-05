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
        Cookies.set('access_token', result.access_token, { expires: 7 });
      }
      navigate('/');
      window.location.reload();
    } catch (error) {
      alert('Fehler beim Login: ' + error);
    }
  };
  return (
    <div className="login-bg">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <label className="login-label">
          E-Mail
          <input type="Username" {...register('username', { required: 'Username ist erforderlich' })} className="login-input" />
          {errors.username && <span className="login-error">{errors.username.message as string}</span>}
        </label>
        <label className="login-label">
          Passwort
          <input type="password" {...register('password', { required: 'Passwort ist erforderlich' })} className="login-input" />
          {errors.password && <span className="login-error">{errors.password.message as string}</span>}
        </label>
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
