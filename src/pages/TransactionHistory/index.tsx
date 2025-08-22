import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import type { Transaction } from '../../types';
import api from '../../services/api';

// Define um tipo para os valores do filtro de tipo
type FilterType = 'all' | 'deposit' | 'sent' | 'received' | 'PIX' | 'TED';

const TransactionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Filtros, agora com tipos mais precisos
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPeriod, setFilterPeriod] = useState<number | 'custom'>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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
        setTransactions(response.data);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        setError('Não foi possível carregar o histórico de transações.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 1. Filtrar por Tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => {
        if (filterType === 'deposit') return transaction.type === 'DEPÓSITO';
        if (filterType === 'sent') return transaction.value < 0;
        if (filterType === 'received') return transaction.value > 0;
        if (filterType === 'PIX') return transaction.type === 'PIX';
        if (filterType === 'TED') return transaction.type === 'TED';
        return true;
      });
    }

    // 2. Filtrar por Período
    if (typeof filterPeriod === 'number' && filterPeriod > 0) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - filterPeriod);
      filtered = filtered.filter(transaction => new Date(transaction.date) >= pastDate);
    }

    // 3. Filtrar por Período de Data Personalizado
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= start && transactionDate <= end;
      });
    }

    // 4. Filtrar por Valor
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min) && !isNaN(max)) {
      filtered = filtered.filter(transaction => {
        const absValue = Math.abs(transaction.value);
        return absValue >= min && absValue <= max;
      });
    }

    return filtered;
  }, [transactions, filterType, filterPeriod, startDate, endDate, minPrice, maxPrice]);

  const formatValue = (value: number) => {
    const formattedValue = Math.abs(value).toFixed(2).replace('.', ',');
    return value < 0 ? `- R$ ${formattedValue}` : `+ R$ ${formattedValue}`;
  };

  if (isLoading) {
    return <div>Carregando histórico...</div>;
  }

  if (error) {
    return <div>Ocorreu um erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Histórico de Transações</h1>
        <button onClick={() => navigate('/')}>Voltar</button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Filtros</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          {/* Filtro por Tipo */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)} style={{ padding: '8px' }}>
            <option value="all">Todos os Tipos</option>
            <option value="deposit">Depósitos</option>
            <option value="sent">Envios (PIX/TED)</option>
            <option value="received">Recebidos (PIX/TED)</option>
            <option value="PIX">Apenas PIX</option>
            <option value="TED">Apenas TED</option>
          </select>

          {/* Filtro por Período */}
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(parseInt(e.target.value))} style={{ padding: '8px' }}>
            <option value={0}>Todo o Período</option>
            <option value={7}>Últimos 7 dias</option>
            <option value={15}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>

        {/* Filtro por Data (Início/Fim) */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
          <label>Data:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '8px' }}
          />
          <span>a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            style={{ padding: '8px' }}
          />
        </div>

        {/* Filtro por Valor (Início/Fim) */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Valor (R$):</label>
          <input
            type="number"
            placeholder="Mínimo"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ padding: '8px', width: '100px' }}
          />
          <span>a</span>
          <input
            type="number"
            placeholder="Máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ padding: '8px', width: '100px' }}
          />
        </div>
      </div>

      {filteredTransactions.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredTransactions.map((transaction) => (
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
        <p>Nenhuma transação encontrada com os filtros selecionados.</p>
      )}
    </div>
  );
};

export default TransactionHistory;