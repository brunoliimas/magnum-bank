import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import type { Transaction } from '../../types';
import api from '../../services/api';
import { Button } from '@/components/ui/button';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get('/transactions', {
          params: { userId: user.id },
        });

        const sortedTransactions = response.data.sort(
          (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTransactions(sortedTransactions);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        setError('Não foi possível carregar as transações.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTransactionLabel = (transaction: Transaction) => {
    return transaction.value < 0 ? 'Transferência Enviada' : 'Transferência Recebida';
  };

  if (isLoading) {
    return <div>Carregando dados...</div>;
  }

  if (error) {
    return <div>Ocorreu um erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Bem-vindo, {user?.name}!</h1>
        <Button onClick={handleLogout} variant="destructive">Sair</Button>

      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Saldo atual:</h3>
        <p style={{ fontSize: '2.5em', fontWeight: 'bold' }}>R$ {user?.balance?.toFixed(2)}</p>
      </div>

      <div style={{ marginBottom: '40px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3 style={{ marginTop: '0' }}>Dados Bancários</h3>
        <p><strong>Banco:</strong> {user?.bank}</p>
        <p><strong>Agência:</strong> {user?.agency}</p>
        <p><strong>Conta:</strong> {user?.account}</p>
      </div>

      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={() => navigate('/transfer')}
          style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer' }}
        >
          Fazer Transferência
        </button>
        <button
          onClick={() => navigate('/history')}
          style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer' }}
        >
          Ver Histórico
        </button>
      </div>

      <div>
        <h3>Últimas Transações</h3>
        {transactions.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {transactions.slice(0, 5).map((transaction) => (
              <li
                key={transaction.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  padding: '15px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: transaction.value < 0 ? '#ffebee' : '#e8f5e9'
                }}
              >
                <div>
                  <strong>{getTransactionLabel(transaction)}</strong>
                  <br />
                  <span>Tipo: {transaction.type}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: transaction.value < 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                    R$ {transaction.value.toFixed(2)}
                  </span>
                  <br />
                  <span style={{ fontSize: '0.8em', color: '#666' }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma transação encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default Home;