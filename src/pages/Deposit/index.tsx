import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import api from '../../services/api';

const Deposit = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
            setError('Por favor, insira um valor válido e positivo.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Atualiza o saldo do usuário no db.json
            const newBalance = (user?.balance || 0) + numericValue;
            await api.patch(`/users/${user?.id}`, { balance: newBalance });

            // 2. Cria um registro de transação de depósito
            const depositTransaction = {
                userId: user?.id,
                type: 'DEPÓSITO',
                date: new Date().toISOString(),
                value: numericValue,
                description: 'Depósito inicial na conta'
            };
            await api.post('/transactions', depositTransaction);

            // 3. Atualiza a flag newUser para false
            await api.patch(`/users/${user?.id}`, { newUser: false });

            // 4. Atualiza o saldo e a flag no contexto
            const updatedUser = { ...user!, balance: newBalance, newUser: false };
            updateUser(updatedUser);

            alert('Depósito realizado com sucesso!');
            navigate('/');
        } catch (err) {
            console.error('Deposit failed', err);
            setError('Erro ao realizar o depósito. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
            <h1>Depósito Inicial</h1>
            <p>Bem-vindo, {user?.name}! Para começar, faça um depósito na sua conta.</p>

            <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Valor do depósito"
                    required
                    style={{ padding: '10px' }}
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={isLoading} style={{ padding: '10px', fontSize: '18px', cursor: 'pointer' }}>
                    {isLoading ? 'Depositando...' : 'Depositar'}
                </button>
            </form>
        </div>
    );
};

export default Deposit;