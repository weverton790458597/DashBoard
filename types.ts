
export type TransactionType = 'income' | 'expense';

export interface Expense {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  description: string;
  value: number;
  category: string; // e.g., 'Aluguel', 'Lazer'
  status: 'Pago' | 'Pendente';
}

export interface Income {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  description: string;
  value: number;
  source: string; // e.g., 'IQ Option', 'YouTube'
  type: 'Renda Variável' | 'Renda Passiva' | 'Renda Ativa/Serviço';
}

export interface InvestmentAccount {
  id: string;
  name: string;
  value: number; // Valor na moeda original
  currency: 'BRL' | 'USD';
}

export interface DashboardFilter {
  dateRange: 'all' | '30days' | 'currentMonth' | 'year';
  category?: string;
  source?: string;
}

// Chart Data Types
export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface StackedBarData {
  month: string;
  [key: string]: string | number;
}
