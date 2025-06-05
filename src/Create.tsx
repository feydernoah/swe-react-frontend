import TopBar from './TopBar';
import Cookies from 'js-cookie';

const Create = () => {
  const hasToken = !!Cookies.get('access_token');
  const username = Cookies.get('username');

if(username !== 'admin') {
    return (
      <div className="app-bg min-h-screen">
        <TopBar hasToken={hasToken} username={username} />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
          <p>Nur Admins können Bücher anlegen.</p>
        </div>
      </div>
    );
  }else{
  
  return (
    <div className="app-bg min-h-screen">
      <TopBar hasToken={hasToken} username={username} />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Buch anlegen</h1>
        {/* Hier kann das Formular oder weitere Inhalte zum Anlegen stehen */}
        <p>Hier kannst du ein neues Buch anlegen.</p>
      </div>
    </div>
  );
};
}
export default Create;
