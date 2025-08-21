import { useState } from 'react';
import api from '../services/api';
import type { User} from '../types';
import { AuthContext } from './auth-context';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}


interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const isAuthenticated = !!user;

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.get('/users', { params: { email, password } });
            const foundUser = response.data[0];

            if (foundUser) {
                setUser(foundUser);
                // Em uma aplicação real, aqui você receberia e armazenaria o JWT.
                // Para o nosso mock, o simples fato de ter o user já é suficiente.
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

