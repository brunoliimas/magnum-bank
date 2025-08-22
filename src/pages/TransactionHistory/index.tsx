import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import type { Transaction } from '../../types';
import api from '../../services/api';

const TransactionHistory = () => {
  const { user } = useAuth();
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
        // Busca TODAS as transações do usuário
        const response = await api.get('/transactions', {
          params: { userId: user.id },
        });

        // Ordena as transações da mais recente para a mais antiga
        const sortedTransactions = response.data.sort(
          (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTransactions(sortedTransactions);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        setError('Não foi possível carregar o histórico de transações.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatValue = (value: number) => {
    const formattedValue = value.toFixed(2).replace('.', ',');
    return value < 0 ? `- R$ ${formattedValue}` : `+ R$ ${formattedValue}`;
  };

  if (isLoading) {
    return <div>Carregando histórico...</div>;
  }

  if (error) {
    return <div>Ocorreu um erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Histórico de Transações</h1>
        <button onClick={() => navigate('/')}>Voltar</button>
      </div>

      {transactions.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {transactions.map((transaction) => (
            <li
              key={transaction.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: transaction.value < 0 ? '#ffebee' : '#e8f5e9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold' }}>{transaction.type}</span>
                <span style={{ color: transaction.value < 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                  {formatValue(transaction.value)}
                </span>
              </div>
              <p style={{ margin: '0 0 5px 0' }}>{transaction.description}</p>
              <div style={{ fontSize: '0.8em', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                {transaction.beneficiaryName && (
                  <span>
                    Favorecido: {transaction.beneficiaryName}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma transação encontrada.</p>
      )}
    </div>
  );
};

export default TransactionHistory;