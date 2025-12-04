
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Expense, Income } from '../types';
import { INCOME_TYPES } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<Expense & Income>, type: 'income' | 'expense') => void;
  initialData?: Expense | Income;
  existingCategories: string[];
  existingSources: string[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories,
  existingSources,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    value: '',
    categoryOrSource: '',
    statusOrType: '',
    isCustomCategory: false,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isExpense = 'category' in initialData;
        setType(isExpense ? 'expense' : 'income');
        setFormData({
          date: initialData.date,
          description: initialData.description,
          value: initialData.value.toString(),
          categoryOrSource: isExpense ? (initialData as Expense).category : (initialData as Income).source,
          statusOrType: isExpense ? (initialData as Expense).status : (initialData as Income).type,
          isCustomCategory: false,
        });
      } else {
        // Reset for new entry
        setFormData({
          date: new Date().toISOString().split('T')[0],
          description: '',
          value: '',
          categoryOrSource: '',
          statusOrType: 'Pago', // Default
          isCustomCategory: false,
        });
        setType('expense');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(formData.value);
    if (!formData.description || isNaN(value) || !formData.categoryOrSource) return;

    const commonData = {
      id: initialData?.id,
      date: formData.date,
      description: formData.description,
      value: value,
    };

    if (type === 'expense') {
      onSave({
        ...commonData,
        category: formData.categoryOrSource,
        status: formData.statusOrType as 'Pago' | 'Pendente',
      } as Expense, 'expense');
    } else {
      onSave({
        ...commonData,
        source: formData.categoryOrSource,
        type: formData.statusOrType as any,
      } as Income, 'income');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle (only for new) */}
          {!initialData && (
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => { setType('expense'); setFormData({ ...formData, statusOrType: 'Pago' }); }}
              >
                Despesa
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => { setType('income'); setFormData({ ...formData, statusOrType: INCOME_TYPES[0] }); }}
              >
                Entrada
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              placeholder="Ex: Supermercado"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {type === 'expense' ? 'Categoria' : 'Fonte de Renda'}
            </label>
            <div className="flex gap-2">
              {!formData.isCustomCategory ? (
                <select
                  required
                  value={formData.categoryOrSource}
                  onChange={(e) => {
                    if (e.target.value === 'NEW') {
                      setFormData({ ...formData, isCustomCategory: true, categoryOrSource: '' });
                    } else {
                      setFormData({ ...formData, categoryOrSource: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecione...</option>
                  {(type === 'expense' ? existingCategories : existingSources).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="NEW" className="font-bold text-blue-600">+ Adicionar Novo</option>
                </select>
              ) : (
                <div className="flex flex-1 gap-2">
                    <input 
                        type="text"
                        autoFocus
                        placeholder={type === 'expense' ? "Nova Categoria..." : "Nova Fonte..."}
                        value={formData.categoryOrSource}
                        onChange={(e) => setFormData({...formData, categoryOrSource: e.target.value})}
                        className="flex-1 px-3 py-2 border border-blue-300 ring-2 ring-blue-100 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                        type="button" 
                        onClick={() => setFormData({...formData, isCustomCategory: false, categoryOrSource: ''})}
                        className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
                    >
                        Cancelar
                    </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {type === 'expense' ? 'Status' : 'Tipo de Entrada'}
            </label>
            <select
              required
              value={formData.statusOrType}
              onChange={(e) => setFormData({ ...formData, statusOrType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {type === 'expense' ? (
                <>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                </>
              ) : (
                INCOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)
              )}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
