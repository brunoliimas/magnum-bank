// src/components/layout/MainLayout.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logoUrl from '@/assets/magnum.png';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();



    const handleBack = () => {
        navigate(-1);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isHomePage = location.pathname === '/';

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm py-4 px-6 mb-8">
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className='flex gap-2'>
                        <img src={logoUrl} alt="Magnum Bank" className="w-[50px]" />
                        <div className='text-xl/[1] textext-gray-800 '>
                            <h1 className="font-bold">Magnum</h1>
                            <span className="font-light">Bank</span>
                        </div>
                    </div>
                    <div className='flex gap-4 items-center'>
                        <div className='flex flex-col text-gray-800 text-base/[1.2]'>
                            <span>Bem-vindo,</span>
                            <span className='text-red-500 font-bold'>{user?.name}</span>
                        </div>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>
                                {user?.name
                                    ? user.name
                                        .split(' ')
                                        .map(n => n[0])
                                        .join('')
                                        .toUpperCase()
                                    : '??'}
                            </AvatarFallback>
                        </Avatar>
                        {isHomePage ? (
                            <Button onClick={handleLogout} variant="destructive">
                                Sair
                            </Button>
                        ) : (
                            <Button onClick={handleBack} variant="secondary">
                                Voltar
                            </Button>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-grow max-w-7xl mx-auto px-4 w-full">
                {children}
            </main>

            <footer className="w-full text-center text-gray-500 text-sm mt-8 py-4">
                &copy; {new Date().getFullYear()} Magnum Bank. Todos os direitos reservados.
            </footer>
        </div>
    );
};

export default MainLayout;