export interface User {
    id: number;
    email: string;
    password?: string; // Opcional, pois não queremos enviar a senha de volta para o frontend
    transactionPassword?: string;
    name: string;
    cpfCnpj: string;
    balance: number;
    newUser?: boolean;
    bank?: string;
    agency?: string;
    account?: string;
}

export interface Transaction {
    id: number;
    userId: number;
    type: 'PIX' | 'TED'; // Usamos um tipo literal para restringir as opções
    date: string;
    value: number;
    beneficiaryName: string;
    beneficiaryCpfCnpj: string;
    key?: string; // PIX
    bank?: string; // TED
    agency?: string; // TED
    account?: string; // TED
    currentBalance: number;
    description?: string;
}