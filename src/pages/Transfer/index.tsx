import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import api from '../../services/api';
import type { Transaction } from '../../types';

const Transfer = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Estados para o formulário
  const [transactionType, setTransactionType] = useState<'PIX' | 'TED'>('PIX');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryCpfCnpj, setBeneficiaryCpfCnpj] = useState('');
  const [bank, setBank] = useState('');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [value, setValue] = useState('');
  const [transactionPassword, setTransactionPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para aplicar a máscara de CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    // Remove tudo que não for dígito
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      // Máscara para CPF: 000.000.000-00
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Máscara para CNPJ: 00.000.000/0000-00
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Handler para o campo de CPF/CNPJ
  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBeneficiaryCpfCnpj(e.target.value);
  };

  // EFEITO PARA O AUTOCOMPLETAR
  useEffect(() => {
    const fetchBeneficiary = async () => {
      const cleanCpfCnpj = beneficiaryCpfCnpj.replace(/\D/g, '');

      // Verifica se o CPF/CNPJ tem 11 ou 14 dígitos antes de buscar
      if (cleanCpfCnpj.length === 11 || cleanCpfCnpj.length === 14) {
        try {
          const response = await api.get('/users', {
            params: { cpfCnpj: cleanCpfCnpj },
          });
          const foundUser = response.data[0];

          if (foundUser) {
            setBeneficiaryName(foundUser.name);
            setBank(foundUser.bank || '');
            setAgency(foundUser.agency || '');
            setAccount(foundUser.account || '');
          } else {
            // Limpa os campos se nenhum usuário for encontrado
            setBeneficiaryName('');
            setBank('');
            setAgency('');
            setAccount('');
          }
        } catch (error) {
          console.error('Failed to fetch beneficiary for autocomplete', error);
        }
      }
    };

    fetchBeneficiary();
  }, [beneficiaryCpfCnpj]); // O efeito é re-executado quando o CPF/CNPJ muda

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Evita submissões múltiplas
    if (isLoading) return;

    // Remove a formatação antes de enviar
    const cleanCpfCnpj = beneficiaryCpfCnpj.replace(/\D/g, '');

    // 1. Validações Iniciais
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      setError('Por favor, insira um valor válido para a transferência.');
      return;
    }

    if (user!.balance < numericValue) {
      setError('Saldo insuficiente para a transação.');
      return;
    }

    if (user?.transactionPassword !== transactionPassword) {
      setError('Senha de transação incorreta.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Busca o usuário beneficiário com o valor limpo
      const beneficiaryResponse = await api.get('/users', {
        params: { cpfCnpj: cleanCpfCnpj },
      });
      const beneficiaryUser = beneficiaryResponse.data[0];

      if (!beneficiaryUser) {
        setError('CPF/CNPJ do beneficiário não encontrado.');
        return;
      }

      if (beneficiaryUser.id === user?.id) {
        setError('Não é possível transferir para você mesmo.');
        return;
      }

      // 3. Realiza o Débito e Crédito
      const newSenderBalance = user!.balance - numericValue;
      const newBeneficiaryBalance = beneficiaryUser.balance + numericValue;

      // Realiza o débito na conta do remetente
      await api.patch(`/users/${user?.id}`, { balance: newSenderBalance });

      // Realiza o crédito na conta do beneficiário
      await api.patch(`/users/${beneficiaryUser.id}`, { balance: newBeneficiaryBalance });

      // 4. Cria os registros de transação para ambas as partes
      const senderTransaction: Partial<Transaction> = {
        userId: user?.id,
        type: transactionType,
        date: new Date().toISOString(),
        value: -numericValue,
        beneficiaryName,
        beneficiaryCpfCnpj: cleanCpfCnpj,
        description: `Transferência enviada para ${beneficiaryName}`
      };

      const beneficiaryTransaction: Partial<Transaction> = {
        userId: beneficiaryUser.id,
        type: transactionType,
        date: new Date().toISOString(),
        value: numericValue,
        beneficiaryName: user?.name,
        beneficiaryCpfCnpj: user?.cpfCnpj,
        description: `Transferência recebida de ${user?.name}`
      };

      // Adiciona campos específicos para TED
      if (transactionType === 'TED') {
        senderTransaction.bank = bank;
        senderTransaction.agency = agency;
        senderTransaction.account = account;

        beneficiaryTransaction.bank = beneficiaryUser.bank;
        beneficiaryTransaction.agency = beneficiaryUser.agency;
        beneficiaryTransaction.account = beneficiaryUser.account;
      }

      await api.post('/transactions', senderTransaction);
      await api.post('/transactions', beneficiaryTransaction);

      // 5. Atualiza o saldo do usuário logado no contexto
      const updatedUser = { ...user!, balance: newSenderBalance };
      updateUser(updatedUser);

      // 6. Feedback e Redirecionamento
      alert('Transferência realizada com sucesso!');
      navigate('/');
    } catch (err) {
      console.error('Transfer failed', err);
      setError('Erro ao realizar a transferência. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const isPix = transactionType === 'PIX';

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Nova Transferência</h1>
        <button onClick={() => navigate('/')}>Voltar para a Home</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>Saldo atual:</h3>
        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>R$ {user?.balance?.toFixed(2)}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <button
          onClick={() => setTransactionType('PIX')}
          style={{ padding: '10px', fontWeight: isPix ? 'bold' : 'normal' }}
        >
          PIX
        </button>
        <button
          onClick={() => setTransactionType('TED')}
          style={{ padding: '10px', fontWeight: !isPix ? 'bold' : 'normal' }}
        >
          TED
        </button>
      </div>

      <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        <input
          type="text"
          value={formatCpfCnpj(beneficiaryCpfCnpj)}
          onChange={handleCpfCnpjChange}
          placeholder={isPix ? "Chave PIX (CPF/CNPJ)" : "CPF/CNPJ do favorecido"}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="text"
          value={beneficiaryName}
          onChange={(e) => setBeneficiaryName(e.target.value)}
          placeholder="Nome do favorecido"
          required
          style={{ padding: '10px' }}
        />
        {isPix ? null : (
          <>
            <input
              type="text"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Banco"
              required
              style={{ padding: '10px' }}
            />
            <input
              type="text"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Agência"
              required
              style={{ padding: '10px' }}
            />
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="Conta"
              required
              style={{ padding: '10px' }}
            />
          </>
        )}

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valor a transferir"
          required
          style={{ padding: '10px' }}
        />

        <input
          type="password"
          value={transactionPassword}
          onChange={(e) => setTransactionPassword(e.target.value)}
          placeholder="Senha de transação"
          required
          style={{ padding: '10px' }}
        />

        <button type="submit" disabled={isLoading} style={{ padding: '10px', fontSize: '18px', cursor: 'pointer' }}>
          {isLoading ? 'Realizando...' : 'Realizar Transferência'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default Transfer;