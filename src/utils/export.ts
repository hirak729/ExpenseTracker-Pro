import { Expense } from '../types/expense';

export const exportToCSV = (expenses: Expense[], filename: string = 'expenses') => {
  // Define CSV headers
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  
  // Convert expenses to CSV rows
  const rows = expenses.map(expense => [
    expense.date,
    expense.type,
    expense.category,
    `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes in description
    expense.amount.toFixed(2)
  ]);
  
  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportSummaryToCSV = (expenses: Expense[], filename: string = 'expense_summary') => {
  // Calculate summary data
  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalExpenses = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const categoryTotals = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  const summaryRows = [
    ['Summary'],
    ['Total Income', totalIncome.toFixed(2)],
    ['Total Expenses', totalExpenses.toFixed(2)],
    ['Net Worth', (totalIncome - totalExpenses).toFixed(2)],
    [''],
    ['Category Breakdown'],
    ...Object.entries(categoryTotals).map(([category, amount]) => [
      category,
      amount.toFixed(2)
    ])
  ];
  
  const csvContent = summaryRows
    .map(row => row.join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};