import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';

const Home = () => {
  const { user, logout } = useAuth(); // Acessamos o objeto user e a função logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Bem-vindo, {user?.name}!</h1>
      <p>Este é o seu painel de controle.</p>

      <div style={{ marginTop: '40px' }}>
        <h3>Saldo atual:</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>R$ {user?.balance.toFixed(2)}</p>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '40px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Sair
      </button>
    </div>
  );
};

export default Home;