import { Expense, Income } from './types';

export const EXPENSE_CATEGORIES = [
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Taxa do Bloco',
  'Lazer',
  'Mercado',
  'Transporte',
  'Saúde',
  'Outro',
];

export const INCOME_SOURCES = [
  'IQ Option',
  'Binomo',
  'Corretagem Imobiliária',
  'YouTube',
  'Infoprodutos',
  'Salário',
  'Dividends',
];

export const INCOME_TYPES = [
  'Renda Variável',
  'Renda Passiva',
  'Renda Ativa/Serviço',
];

// Helper to generate dates
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const subDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Mock Expenses
export const MOCK_EXPENSES: Expense[] = [
  { id: '1', date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0], description: 'Aluguel Apto', value: 2500, category: 'Aluguel', status: 'Pago' },
  { id: '2', date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0], description: 'Conta de Luz', value: 350, category: 'Energia', status: 'Pago' },
  { id: '3', date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0], description: 'Jantar Comemorativo', value: 450, category: 'Lazer', status: 'Pago' },
  { id: '4', date: new Date(currentYear, currentMonth, 20).toISOString().split('T')[0], description: 'Mercado Mensal', value: 1200, category: 'Mercado', status: 'Pendente' },
  { id: '5', date: subDays(today, 45).toISOString().split('T')[0], description: 'Uber Viagens', value: 150, category: 'Transporte', status: 'Pago' },
  { id: '6', date: subDays(today, 60).toISOString().split('T')[0], description: 'Manutenção Carro', value: 800, category: 'Transporte', status: 'Pago' },
  { id: '7', date: new Date(currentYear, currentMonth, 2).toISOString().split('T')[0], description: 'Internet Fibra', value: 120, category: 'Internet', status: 'Pago' },
];

// Mock Income
export const MOCK_INCOME: Income[] = [
  { id: '1', date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0], description: 'Venda Apartamento Centro', value: 15000, source: 'Corretagem Imobiliária', type: 'Renda Ativa/Serviço' },
  { id: '2', date: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0], description: 'AdSense Outubro', value: 3200, source: 'YouTube', type: 'Renda Passiva' },
  { id: '3', date: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0], description: 'Day Trade Win', value: 1500, source: 'IQ Option', type: 'Renda Variável' },
  { id: '4', date: subDays(today, 35).toISOString().split('T')[0], description: 'Venda E-book', value: 800, source: 'Infoprodutos', type: 'Renda Passiva' },
  { id: '5', date: subDays(today, 40).toISOString().split('T')[0], description: 'Lucro Opções', value: 2200, source: 'Binomo', type: 'Renda Variável' },
  { id: '6', date: new Date(currentYear, currentMonth, 25).toISOString().split('T')[0], description: 'Consultoria', value: 4000, source: 'Corretagem Imobiliária', type: 'Renda Ativa/Serviço' },
];