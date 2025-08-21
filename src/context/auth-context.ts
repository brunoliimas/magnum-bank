import { createContext } from 'react';
import type { AuthContextType } from './AuthContext'; // Importamos o tipo de dado

// Criamos o contexto e o exportamos
export const AuthContext = createContext<AuthContextType | undefined>(undefined);