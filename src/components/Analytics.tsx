import React, { useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, TrendingUp as InvestmentIcon } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics: React.FC = () => {
  const { expenses } = useExpense();
  const [timeRange, setTimeRange] = useState<'1month' | '3months' | '6months' | '12months' | 'all'>('6months');

  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case '12months':
        startDate = subMonths(now, 12);
        break;
      case 'all':
        startDate = new Date(Math.min(...expenses.map(e => new Date(e.date).getTime())));
        break;
    }

    const filteredExpenses = expenses.filter(expense => 
      new Date(expense.date) >= startDate
    );

    // Monthly data
    const months = eachMonthOfInterval({ start: startDate, end: now });
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
      const income = monthExpenses
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const expenses = monthExpenses
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        income,
        expenses,
        net: income - expenses
      };
    });

    // Category data
    const categoryData = filteredExpenses
      .filter(e => e.type === 'expense')
      .reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

    // Top categories
    const topCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Investment analysis
    const investmentExpenses = filteredExpenses.filter(e => e.category === 'Investment' && e.type === 'expense');
    const investmentIncome = filteredExpenses.filter(e => e.category === 'Investment' && e.type === 'income');
    const totalInvested = investmentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestmentReturns = investmentIncome.reduce((sum, e) => sum + e.amount, 0);
    const netInvestment = totalInvestmentReturns - totalInvested;
    const investmentROI = totalInvested > 0 ? ((netInvestment / totalInvested) * 100) : 0;

    // Totals
    const totalIncome = filteredExpenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = filteredExpenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const avgMonthlyIncome = totalIncome / Math.max(months.length, 1);
    const avgMonthlyExpenses = totalExpenses / Math.max(months.length, 1);

    return {
      monthlyData,
      categoryData,
      topCategories,
      totalIncome,
      totalExpenses,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      netWorth: totalIncome - totalExpenses,
      // Investment metrics
      totalInvested,
      totalInvestmentReturns,
      netInvestment,
      investmentROI,
      hasInvestments: investmentExpenses.length > 0 || investmentIncome.length > 0
    };
  }, [expenses, timeRange]);

  const lineChartData = {
    labels: analytics.monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: analytics.monthlyData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: analytics.monthlyData.map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: analytics.topCategories.map(([category]) => category),
    datasets: [
      {
        data: analytics.topCategories.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Financial Analytics</h2>
          </div>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1month' | '3months' | '6months' | '12months' | 'all')}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            aria-label="Select time range"
          >
            <option value="1month">Last 1 Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 sm:p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Income</p>
                <p className="text-2xl sm:text-3xl font-bold">₹{analytics.totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 sm:p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold">₹{analytics.totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-rose-200" />
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-xl text-white shadow-lg ${
            analytics.netWorth >= 0 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  analytics.netWorth >= 0 ? 'text-blue-100' : 'text-orange-100'
                }`}>
                  Net Worth
                </p>
                <p className="text-2xl sm:text-3xl font-bold">${analytics.netWorth.toLocaleString()}</p>
              </div>
              <DollarSign className={`w-6 h-6 sm:w-8 sm:h-8 ${
                analytics.netWorth >= 0 ? 'text-blue-200' : 'text-orange-200'
              }`} />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Monthly Expenses</p>
                <p className="text-2xl sm:text-3xl font-bold">${analytics.avgMonthlyExpenses.toLocaleString()}</p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Investment Summary (if investments exist) */}
        {analytics.hasInvestments && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 sm:p-6 mb-6 border border-emerald-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg">
                <InvestmentIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Investment Summary</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-xl font-bold text-blue-600">${analytics.totalInvested.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Return</p>
                <p className={`text-xl font-bold ${analytics.netInvestment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${analytics.netInvestment.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">ROI</p>
                <p className={`text-xl font-bold ${analytics.investmentROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.investmentROI.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Income vs Expenses</h3>
            <div className="h-64 sm:h-80">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Top Spending Categories</h3>
            <div className="h-64 sm:h-80 flex items-center justify-center">
              {analytics.topCategories.length > 0 ? (
                <Doughnut 
                  data={categoryChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-500">No expense data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Categories Table */}
        {analytics.topCategories.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700">Category</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topCategories.map(([category, amount], index) => (
                    <tr key={category} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-2 sm:px-4 text-gray-900 font-medium">{category}</td>
                      <td className="py-3 px-2 sm:px-4 text-right text-gray-900 font-semibold">
                        ${amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right text-gray-600">
                        {((amount / analytics.totalExpenses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;