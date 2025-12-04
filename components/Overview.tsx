
import React, { useMemo, useState } from 'react';
import { Expense, Income, InvestmentAccount } from '../types';
import { formatCurrency, getMonthlyComparison, getCategoryDistribution } from '../services/financeHelpers';
import { StatCard } from './StatCard';
import { Wallet, TrendingUp, TrendingDown, Landmark, Edit2, Check, Plus, Trash2, PieChart as PieChartIcon, Activity, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface OverviewProps {
  income: Income[];
  expenses: Expense[];
  initialBalance: number;
  onUpdateInitialBalance: (value: number) => void;
  investments: InvestmentAccount[];
  onAddInvestment: (name: string, currency: 'BRL' | 'USD') => void;
  onUpdateInvestmentValue: (id: string, value: number) => void;
  onDeleteInvestment: (id: string) => void;
  dollarRate: number;
  onUpdateDollarRate: (rate: number) => void;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const Overview: React.FC<OverviewProps> = ({ 
  income, 
  expenses, 
  initialBalance,
  onUpdateInitialBalance,
  investments,
  onAddInvestment,
  onUpdateInvestmentValue,
  onDeleteInvestment,
  dollarRate,
  onUpdateDollarRate
}) => {
  // States for Initial Balance Editing
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(initialBalance.toString());

  // States for Investment Editing
  const [editingInvId, setEditingInvId] = useState<string | null>(null);
  const [tempInvValue, setTempInvValue] = useState('');
  
  // States for Dollar Rate Editing
  const [isEditingDollar, setIsEditingDollar] = useState(false);
  const [tempDollarRate, setTempDollarRate] = useState(dollarRate.toString());

  // State for adding new investment
  const [isAddingInv, setIsAddingInv] = useState(false);
  const [newInvName, setNewInvName] = useState('');
  const [newInvCurrency, setNewInvCurrency] = useState<'BRL' | 'USD'>('BRL');

  const totalIncome = useMemo(() => income.reduce((acc, curr) => acc + curr.value, 0), [income]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.value, 0), [expenses]);
  
  // Calculate total invested converting USD to BRL
  const totalInvested = useMemo(() => {
    return investments.reduce((acc, curr) => {
        const valueInBrl = curr.currency === 'USD' ? curr.value * dollarRate : curr.value;
        return acc + valueInBrl;
    }, 0);
  }, [investments, dollarRate]);
  
  // Final Balance (Liquid in Bank) = Initial + (Income - Expenses)
  const finalBalance = initialBalance + totalIncome - totalExpenses;

  // Total Net Worth = Liquid + Invested
  const totalNetWorth = finalBalance + totalInvested;

  const monthlyData = useMemo(() => getMonthlyComparison(income, expenses), [income, expenses]);
  const sourceDistribution = useMemo(() => getCategoryDistribution(income, 'source'), [income]);

  // Handler for Initial Balance
  const handleSaveBalance = () => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val)) {
      onUpdateInitialBalance(val);
    }
    setIsEditingBalance(false);
  };

  // Handler for Dollar Rate
  const handleSaveDollar = () => {
    const val = parseFloat(tempDollarRate);
    if (!isNaN(val) && val > 0) {
      onUpdateDollarRate(val);
    }
    setIsEditingDollar(false);
  }

  // Handlers for Investments
  const handleSaveInvValue = (id: string) => {
    const val = parseFloat(tempInvValue);
    if (!isNaN(val)) {
      onUpdateInvestmentValue(id, val);
    }
    setEditingInvId(null);
  };

  const handleAddNewInv = () => {
    if (newInvName.trim()) {
        onAddInvestment(newInvName.trim(), newInvCurrency);
        setNewInvName('');
        setNewInvCurrency('BRL');
        setIsAddingInv(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* SECTION 1: Banking & General KPIs */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-gray-500" />
            Controle Bancário & Fluxo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Editable Initial Balance Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between transition-transform hover:scale-[1.01] relative group">
            <div className="flex justify-between items-start">
                <div>
                <p className="text-sm font-medium text-gray-500">Saldo Inicial (Banco)</p>
                
                {isEditingBalance ? (
                    <div className="flex items-center gap-2 mt-1">
                    <input 
                        type="number" 
                        value={tempBalance}
                        onChange={(e) => setTempBalance(e.target.value)}
                        className="w-full border-b-2 border-blue-500 focus:outline-none text-xl font-bold text-gray-900 bg-transparent"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveBalance()}
                        onBlur={handleSaveBalance}
                    />
                    <button onClick={handleSaveBalance} className="text-emerald-600">
                        <Check className="w-5 h-5" />
                    </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-1 cursor-pointer" onClick={() => { setTempBalance(initialBalance.toString()); setIsEditingBalance(true); }}>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(initialBalance)}</h3>
                    <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
                </div>
                <div className="p-3 rounded-full bg-gray-50 text-gray-600">
                <Wallet className="w-6 h-6" />
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Valor base em conta corrente</p>
            </div>

            <StatCard
            title="Entradas Totais"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            color="green"
            />
            
            <StatCard
            title="Gastos Totais"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            color="red"
            />

            {/* Final Balance Card */}
            <StatCard
            title="Saldo Final (Em Conta)"
            value={formatCurrency(finalBalance)}
            icon={Landmark}
            color={finalBalance >= 0 ? 'blue' : 'red'}
            />
        </div>
      </div>

      {/* SECTION 2: Investments / Brokerage */}
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" />
                Operações & Investimentos
            </h2>
            <div className="flex gap-4 items-center">
                 {/* Dollar Rate Widget */}
                 <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600 font-medium">USD Hoje:</span>
                    {isEditingDollar ? (
                        <div className="flex items-center">
                             <span className="text-gray-900 font-bold mr-1">R$</span>
                             <input 
                                type="number"
                                value={tempDollarRate}
                                onChange={(e) => setTempDollarRate(e.target.value)}
                                className="w-16 border-b border-green-500 font-bold text-gray-900 bg-transparent outline-none p-0"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveDollar()}
                                onBlur={handleSaveDollar}
                             />
                        </div>
                    ) : (
                        <div 
                            className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 rounded px-1"
                            onClick={() => { setTempDollarRate(dollarRate.toString()); setIsEditingDollar(true); }}
                        >
                             <span className="font-bold text-gray-900">R$ {dollarRate.toFixed(2)}</span>
                             <Edit2 className="w-3 h-3 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    Patrimônio Total: <span className="font-bold text-emerald-600">{formatCurrency(totalNetWorth)}</span>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dinheiro em Operação KPI */}
            <div className="bg-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between transition-transform hover:scale-[1.01] lg:col-span-1">
                <div>
                    <p className="text-sm font-medium text-indigo-600">Dinheiro em Operação</p>
                    <h3 className="text-2xl font-bold text-indigo-900 mt-1">{formatCurrency(totalInvested)}</h3>
                    <p className="text-xs text-indigo-400 mt-1">Total convertido (BRL)</p>
                </div>
                <div className="p-3 rounded-full bg-white text-indigo-600">
                    <PieChartIcon className="w-6 h-6" />
                </div>
            </div>

            {/* Dynamic Investment Cards */}
            {investments.map((inv) => {
                const isUSD = inv.currency === 'USD';
                const displayedValue = isUSD ? inv.value * dollarRate : inv.value;

                return (
                    <div key={inv.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative group">
                        
                        {/* Delete Button (visible on hover) */}
                        <button 
                            onClick={() => onDeleteInvestment(inv.id)}
                            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                            title="Excluir Card"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-500 truncate pr-6">{inv.name}</p>
                                {isUSD && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">USD</span>}
                            </div>
                            
                            {editingInvId === inv.id ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 font-bold text-lg">{isUSD ? 'US$' : 'R$'}</span>
                                    <input 
                                        type="number" 
                                        value={tempInvValue}
                                        onChange={(e) => setTempInvValue(e.target.value)}
                                        className="w-full border-b-2 border-indigo-500 focus:outline-none text-xl font-bold text-gray-900 bg-transparent"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveInvValue(inv.id)}
                                        onBlur={() => handleSaveInvValue(inv.id)}
                                        placeholder={isUSD ? "Valor em Dólar" : "Valor em Reais"}
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="flex flex-col gap-0 mt-1 cursor-pointer group/edit" 
                                    onClick={() => { setTempInvValue(inv.value.toString()); setEditingInvId(inv.id); }}
                                >
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(displayedValue)}</h3>
                                        <Edit2 className="w-3 h-3 text-gray-300 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                                    </div>
                                    {isUSD && (
                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                            Original: <span className="text-green-600">US$ {inv.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                Corretora
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* Add New Card Button */}
            {isAddingInv ? (
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col justify-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Nome (Ex: Binance)"
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        autoFocus
                        value={newInvName}
                        onChange={(e) => setNewInvName(e.target.value)}
                    />
                    
                    {/* Currency Selector */}
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button 
                            className={`flex-1 text-xs py-1.5 rounded transition-all font-medium ${newInvCurrency === 'BRL' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:bg-gray-300'}`}
                            onClick={() => setNewInvCurrency('BRL')}
                        >
                            R$ (Real)
                        </button>
                        <button 
                             className={`flex-1 text-xs py-1.5 rounded transition-all font-medium ${newInvCurrency === 'USD' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:bg-gray-300'}`}
                             onClick={() => setNewInvCurrency('USD')}
                        >
                            $ (Dólar)
                        </button>
                    </div>

                    <div className="flex gap-2 mt-1">
                        <button onClick={handleAddNewInv} className="flex-1 bg-gray-900 text-white text-xs py-2 rounded-lg hover:bg-gray-800">
                            Criar
                        </button>
                        <button onClick={() => setIsAddingInv(false)} className="flex-1 bg-white border text-gray-600 text-xs py-2 rounded-lg hover:bg-gray-100">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAddingInv(true)}
                    className="h-full min-h-[140px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Adicionar Operação</span>
                </button>
            )}
        </div>
      </div>

      {/* SECTION 3: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Comparative Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fluxo de Caixa Mensal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(val) => `R$${val/1000}k`}/>
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="income" name="Entradas" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Gastos" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fontes de Renda</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
