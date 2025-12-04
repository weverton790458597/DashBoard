import { Expense, Income, MonthlyData, CategoryData, StackedBarData, DashboardFilter } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const filterTransactions = (
  items: (Expense | Income)[],
  filter: DashboardFilter
) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return items.filter((item) => {
    const itemDate = new Date(item.date);
    
    // Date Filtering
    let dateMatch = true;
    if (filter.dateRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      dateMatch = itemDate >= thirtyDaysAgo;
    } else if (filter.dateRange === 'currentMonth') {
      dateMatch = itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    } else if (filter.dateRange === 'year') {
      dateMatch = itemDate.getFullYear() === currentYear;
    }

    // Specific Filters
    let categoryMatch = true;
    if ('category' in item && filter.category) {
      categoryMatch = item.category === filter.category;
    }

    let sourceMatch = true;
    if ('source' in item && filter.source) {
      sourceMatch = item.source === filter.source;
    }

    return dateMatch && categoryMatch && sourceMatch;
  });
};

export const getMonthlyComparison = (income: Income[], expenses: Expense[]): MonthlyData[] => {
  const dataMap = new Map<string, { income: number; expense: number }>();

  const process = (items: (Income | Expense)[], type: 'income' | 'expense') => {
    items.forEach((item) => {
      const date = new Date(item.date);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!dataMap.has(key)) {
        dataMap.set(key, { income: 0, expense: 0 });
      }
      
      const current = dataMap.get(key)!;
      if (type === 'income') {
        current.income += item.value;
      } else {
        current.expense += item.value;
      }
    });
  };

  process(income, 'income');
  process(expenses, 'expense');

  return Array.from(dataMap.entries()).map(([month, vals]) => ({
    month,
    income: vals.income,
    expense: vals.expense,
  })).sort((a, b) => {
     // Simple sort logic: In a real app, use timestamps
     return 0; // Keeping it simple for demo order preservation usually works if data is inserted chronologically or we parse the date string back
  });
};

export const getCategoryDistribution = (items: (Expense | Income)[], field: 'category' | 'source'): CategoryData[] => {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const key = (item as any)[field];
    map.set(key, (map.get(key) || 0) + item.value);
  });

  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
};

export const getStackedExpenseData = (expenses: Expense[]): StackedBarData[] => {
  const map = new Map<string, { [key: string]: number }>();
  const categories = new Set<string>();

  expenses.forEach((exp) => {
    const date = new Date(exp.date);
    const month = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    categories.add(exp.category);

    if (!map.has(month)) {
      map.set(month, {});
    }
    const monthData = map.get(month)!;
    monthData[exp.category] = (monthData[exp.category] || 0) + exp.value;
  });

  return Array.from(map.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));
};

export const getTypeEvolution = (income: Income[]) => {
  const map = new Map<string, { [key: string]: number }>();

  income.forEach((inc) => {
    const date = new Date(inc.date);
    const month = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

    if (!map.has(month)) {
      map.set(month, {});
    }
    const monthData = map.get(month)!;
    monthData[inc.type] = (monthData[inc.type] || 0) + inc.value;
  });

  return Array.from(map.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));
};