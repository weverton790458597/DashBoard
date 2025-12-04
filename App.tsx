
import React, { useState, useMemo } from 'react';
import { LayoutDashboard, TrendingDown, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Expense, Income, DashboardFilter, InvestmentAccount } from './types';
import { MOCK_EXPENSES, MOCK_INCOME, EXPENSE_CATEGORIES, INCOME_SOURCES } from './constants';
import { filterTransactions } from './services/financeHelpers';
import { Overview } from './components/Overview';
import { ExpenseAnalysis } from './components/ExpenseAnalysis';
import { IncomeAnalysis } from './components/IncomeAnalysis';
import { TransactionModal } from './components/TransactionModal';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'income'>('overview');
  
  // Data State
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [income, setIncome] = useState<Income[]>(MOCK_INCOME);
  const [initialBalance, setInitialBalance] = useState<number>(1000); // Default initial balance
  
  // Dollar Rate State (Default 5.80)
  const [dollarRate, setDollarRate] = useState<number>(5.80);

  // Investments / Brokerage Accounts State
  const [investments, setInvestments] = useState<InvestmentAccount[]>([
    { id: '1', name: 'IQ Option', value: 0, currency: 'BRL' },
    { id: '2', name: 'Ebinex', value: 0, currency: 'USD' },
  ]);

  // Dynamic Categories State
  const [expenseCategories, setExpenseCategories] = useState<string[]>(EXPENSE_CATEGORIES);
  const [incomeSources, setIncomeSources] = useState<string[]>(INCOME_SOURCES);

  const [filter, setFilter] = useState<DashboardFilter>({
    dateRange: 'all'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | Income | undefined>(undefined);

  // Filter Data based on selection
  const filteredExpenses = useMemo(() => 
    filterTransactions(expenses, filter) as Expense[], 
  [expenses, filter]);

  const filteredIncome = useMemo(() => 
    filterTransactions(income, filter) as Income[], 
  [income, filter]);

  // CRUD Handlers
  const handleSaveTransaction = (transaction: Partial<Expense & Income>, type: 'income' | 'expense') => {
    if (type === 'expense') {
      const newExpense = transaction as Expense;
      
      // Update Categories if new
      if (!expenseCategories.includes(newExpense.category)) {
        setExpenseCategories([...expenseCategories, newExpense.category]);
      }

      if (newExpense.id) {
        setExpenses((prev) => prev.map(e => e.id === newExpense.id ? newExpense : e));
      } else {
        setExpenses((prev) => [...prev, { ...newExpense, id: crypto.randomUUID() }]);
      }
    } else {
      const newIncome = transaction as Income;
      
      // Update Sources if new
      if (!incomeSources.includes(newIncome.source)) {
        setIncomeSources([...incomeSources, newIncome.source]);
      }

      if (newIncome.id) {
        setIncome((prev) => prev.map(i => i.id === newIncome.id ? newIncome : i));
      } else {
        setIncome((prev) => [...prev, { ...newIncome, id: crypto.randomUUID() }]);
      }
    }
  };

  const handleDelete = (id: string, type: 'income' | 'expense') => {
    // Executa a exclusão diretamente para garantir responsividade da UI
    if (type === 'expense') {
      setExpenses((prev) => prev.filter((e) => String(e.id) !== String(id)));
    } else {
      setIncome((prev) => prev.filter((i) => String(i.id) !== String(id)));
    }
  };

  // Investment Handlers
  const handleAddInvestment = (name: string, currency: 'BRL' | 'USD') => {
    setInvestments(prev => [...prev, { id: crypto.randomUUID(), name, value: 0, currency }]);
  };

  const handleUpdateInvestmentValue = (id: string, value: number) => {
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, value } : inv));
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Expense | Income) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Tab button helper
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-white hover:text-gray-900'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 py-4 sm:py-0 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <LayoutDashboard className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">FinanceFlow</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer transition-colors shadow-sm"
                  value={filter.dateRange}
                  onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as any })}
                >
                  <option value="all">Todo o Período</option>
                  <option value="currentMonth">Mês Atual</option>
                  <option value="30days">Últimos 30 dias</option>
                  <option value="year">Este Ano</option>
                </select>
              </div>

               {/* Add Button */}
               <button 
                onClick={openAddModal}
                className="bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-lg transition-colors flex items-center gap-2 px-4 shadow-sm"
               >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nova Transação</span>
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-xl w-fit">
          <TabButton id="overview" label="Visão Geral" icon={LayoutDashboard} />
          <TabButton id="expenses" label="Análise de Gastos" icon={TrendingDown} />
          <TabButton id="income" label="Análise de Entradas" icon={TrendingUp} />
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <Overview 
              income={filteredIncome} 
              expenses={filteredExpenses} 
              initialBalance={initialBalance}
              onUpdateInitialBalance={setInitialBalance}
              investments={investments}
              onAddInvestment={handleAddInvestment}
              onUpdateInvestmentValue={handleUpdateInvestmentValue}
              onDeleteInvestment={handleDeleteInvestment}
              dollarRate={dollarRate}
              onUpdateDollarRate={setDollarRate}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpenseAnalysis 
              expenses={filteredExpenses} 
              onEdit={openEditModal}
              onDelete={(id) => handleDelete(id, 'expense')}
            />
          )}
          {activeTab === 'income' && (
            <IncomeAnalysis 
              income={filteredIncome} 
              onEdit={openEditModal}
              onDelete={(id) => handleDelete(id, 'income')}
            />
          )}
        </div>
      </main>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingItem}
        existingCategories={expenseCategories}
        existingSources={incomeSources}
      />
    </div>
  );
}

export default App;
