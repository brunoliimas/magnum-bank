import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Certifique-se de que `user` também é pego do contexto

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        const loggedInUserResponse = await api.get(`/users?email=${email}`);
        const loggedInUser = loggedInUserResponse.data[0];

        if (loggedInUser && loggedInUser.newUser) {
          navigate('/deposit');
        } else {
          navigate('/');
        }
      } else {
        setError('Email ou senha inválidos.');
      }
    } catch (err) {
      console.error('Login failed', err);
      setError('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          style={{ padding: '10px' }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={isLoading} style={{ padding: '10px', fontSize: '18px', cursor: 'pointer' }}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        Ainda não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </div>
    </div>
  );
};

export default Login;