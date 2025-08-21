import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/hooks/useAuth';


const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Se o usuário já estiver autenticado, redireciona para a home
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Verifica se o usuário já existe
            const existingUser = await api.get('/users', { params: { email } });
            if (existingUser.data.length > 0) {
                setError('Este e-mail já está cadastrado.');
                return;
            }

            // Cria um novo usuário
            await api.post('/users', {
                email,
                password,
                name,
                balance: 1000, // Saldo inicial
                transactionPassword: "123" // Senha de transação fixa para o teste
            });

            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            navigate('/login');
        } catch (err) {
            console.error('Registration failed', err);
            setError('Houve um erro no cadastro. Tente novamente.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
            <h2>Criar Nova Conta</h2>
            <p>Preencha os dados abaixo para se cadastrar.</p>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome Completo"
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
                    Cadastrar
                </button>
            </form>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            <p style={{ marginTop: '20px' }}>
                Já tem uma conta? <a href="/login">Faça Login</a>
            </p>
        </div>
    );
};

export default Register;