import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import type { User } from '../../types';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [transactionPassword, setTransactionPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Função para aplicar a máscara de CPF/CNPJ
    const formatCpfCnpj = (value: string) => {
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length <= 11) {
            // Máscara para CPF: 000.000.000-00
            return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
            // Máscara para CNPJ: 00.000.000/0000-00
            return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
    };

    const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpfCnpj(e.target.value);
    };

    // Função para gerar uma conta aleatória de 6 dígitos formatada
    const generateRandomAccount = () => {
        const min = 100000;
        const max = 999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        const accountNumber = String(randomNumber).padStart(6, '0');
        return `${accountNumber.substring(0, 5)}-${accountNumber.substring(5)}`;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validações
        const cleanPassword = password.replace(/\D/g, '');
        const cleanTransactionPassword = transactionPassword.replace(/\D/g, '');
        const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');

        if (cleanPassword.length > 6 || cleanPassword.length < 6 || isNaN(Number(cleanPassword))) {
            setError('A senha deve ter exatamente 6 dígitos numéricos.');
            return;
        }

        if (cleanTransactionPassword.length > 4 || cleanTransactionPassword.length < 4 || isNaN(Number(cleanTransactionPassword))) {
            setError('A senha de transação deve ter exatamente 4 dígitos numéricos.');
            return;
        }

        if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
            setError('CPF/CNPJ inválido. Insira 11 ou 14 dígitos.');
            return;
        }

        setIsLoading(true);

        try {
            // Verifica se o email já existe
            const emailCheck = await api.get(`/users?email=${email}`);
            if (emailCheck.data.length > 0) {
                setError('Este e-mail já está em uso.');
                return;
            }

            // Verifica se o CPF/CNPJ já existe
            const cpfCnpjCheck = await api.get(`/users?cpfCnpj=${cleanCpfCnpj}`);
            if (cpfCnpjCheck.data.length > 0) {
                setError('Este CPF/CNPJ já está cadastrado.');
                return;
            }

            const newUser: Omit<User, 'id'> = {
                email,
                password,
                name,
                cpfCnpj: cleanCpfCnpj,
                balance: 0,
                transactionPassword,
                newUser: true,
                bank: 'Magnum Bank',
                agency: '0001',
                account: generateRandomAccount()
            };

            await api.post('/users', newUser);
            alert('Cadastro realizado com sucesso!');
            navigate('/login');
        } catch (error) {
            console.error('Registration failed', error);
            setError('Ocorreu um erro no cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h1>Cadastrar</h1>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome Completo"
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="text"
                    value={formatCpfCnpj(cpfCnpj)}
                    onChange={handleCpfCnpjChange}
                    placeholder="CPF ou CNPJ"
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha de Login (6 dígitos)"
                    maxLength={6}
                    pattern="\d{6}"
                    title="A senha deve ter exatamente 6 dígitos numéricos"
                    required
                    style={{ padding: '10px' }}
                />
                <input
                    type="password"
                    value={transactionPassword}
                    onChange={(e) => setTransactionPassword(e.target.value)}
                    placeholder="Senha de Transação (4 dígitos)"
                    maxLength={4}
                    pattern="\d{4}"
                    title="A senha de transação deve ter exatamente 4 dígitos numéricos"
                    required
                    style={{ padding: '10px' }}
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={isLoading} style={{ padding: '10px', fontSize: '18px', cursor: 'pointer' }}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                Já tem uma conta? <Link to="/login">Faça login</Link>
            </div>
        </div>
    );
};

export default Register;