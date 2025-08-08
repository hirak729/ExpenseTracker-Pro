import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const InvestmentTracker: React.FC = () => {
  const { expenses } = useExpense();

  const investmentData = useMemo(() => {
    const investmentExpenses = expenses.filter(exp => exp.category === 'Investment');
    const investmentIncome = expenses.filter(exp => exp.type === 'income' && exp.category === 'Investment');

    // Calculate totals
    const totalInvested = investmentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalReturns = investmentIncome.reduce((sum, exp) => sum + exp.amount, 0);
    const netInvestment = totalReturns - totalInvested;
    const roi = totalInvested > 0 ? ((netInvestment / totalInvested) * 100) : 0;

    // Monthly investment data
    const now = new Date();
    const startDate = subMonths(now, 6);
    const months = eachMonthOfInterval({ start: startDate, end: now });
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthInvestments = investmentExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
      const monthReturns = investmentIncome.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
      const invested = monthInvestments.reduce((sum, exp) => sum + exp.amount, 0);
      const returns = monthReturns.reduce((sum, exp) => sum + exp.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        invested,
        returns,
        net: returns - invested
      };
    });

    // Recent transactions
    const recentTransactions = [...investmentExpenses, ...investmentIncome]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalInvested,
      totalReturns,
      netInvestment,
      roi,
      monthlyData,
      recentTransactions,
      hasData: investmentExpenses.length > 0 || investmentIncome.length > 0
    };
  }, [expenses]);

  const getROIColor = (roi: number) => {
    if (roi > 0) return 'text-green-600';
    if (roi < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getROIIcon = (roi: number) => {
    if (roi > 0) return <ArrowUpRight className="w-4 h-4" />;
    if (roi < 0) return <ArrowDownRight className="w-4 h-4" />;
    return <DollarSign className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Investment Tracker</h2>
        </div>

        {!investmentData.hasData ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No investment data yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your investments by adding transactions</p>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-sm text-emerald-800">
                💡 <strong>Tip:</strong> Add investment expenses (purchases) and income (returns) to track your portfolio performance.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Investment Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Invested</p>
                    <p className="text-2xl sm:text-3xl font-bold">₹{investmentData.totalInvested.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 sm:p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Returns</p>
                    <p className="text-2xl sm:text-3xl font-bold">₹{investmentData.totalReturns.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-200" />
                </div>
              </div>
              
              <div className={`p-4 sm:p-6 rounded-xl text-white shadow-lg ${
                investmentData.netInvestment >= 0 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      investmentData.netInvestment >= 0 ? 'text-green-100' : 'text-red-100'
                    }`}>
                      Net Return
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">₹{investmentData.netInvestment.toLocaleString()}</p>
                  </div>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    investmentData.netInvestment >= 0 ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {getROIIcon(investmentData.netInvestment)}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">ROI</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${getROIColor(investmentData.roi)}`}>
                      {investmentData.roi.toFixed(2)}%
                    </p>
                  </div>
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Monthly Investment Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Monthly Investment Activity</h3>
              <div className="space-y-4">
                {investmentData.monthlyData.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{month.month}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Invested</p>
                        <p className="font-semibold text-blue-600">₹{month.invested.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Returns</p>
                        <p className="font-semibold text-emerald-600">₹{month.returns.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Net</p>
                        <p className={`font-semibold ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{month.net.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Investment Transactions</h3>
              <div className="space-y-3">
                {investmentData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvestmentTracker; 