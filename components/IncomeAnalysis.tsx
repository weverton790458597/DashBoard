
import React, { useMemo } from 'react';
import { Income } from '../types';
import { formatCurrency, getCategoryDistribution, getTypeEvolution } from '../services/financeHelpers';
import { Edit2, Trash2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface IncomeAnalysisProps {
  income: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export const IncomeAnalysis: React.FC<IncomeAnalysisProps> = ({ income, onEdit, onDelete }) => {
  const sourcePerformance = useMemo(() => getCategoryDistribution(income, 'source'), [income]);
  const typeEvolution = useMemo(() => getTypeEvolution(income), [income]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Source */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Desempenho por Fonte</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcePerformance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {sourcePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolution by Type (Line Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução por Tipo de Renda</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={typeEvolution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Renda Variável" stroke="#F59E0B" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="Renda Passiva" stroke="#10B981" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="Renda Ativa/Serviço" stroke="#3B82F6" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Detalhamento de Entradas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Fonte</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Valor</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {income.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-medium text-gray-800">{item.description}</td>
                  <td className="p-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {item.source}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{item.type}</td>
                  <td className="p-4 text-right font-semibold text-emerald-600">
                    + {formatCurrency(item.value)}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative z-10 cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors relative z-10 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
               {income.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Nenhuma entrada registrada para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
