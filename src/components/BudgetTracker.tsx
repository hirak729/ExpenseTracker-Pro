import React, { useState } from 'react';
import { Target, Plus, Edit, Trash2, AlertTriangle, CheckCircle, TrendingUp, DollarSign, X } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { EXPENSE_CATEGORIES } from '../types/expense';
import toast from 'react-hot-toast';

const BudgetTracker: React.FC = () => {
  const { budgets, setBudget, expenses } = useExpense();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !budgetAmount) return;

    setIsSubmitting(true);

    try {
      const budgetLimit = parseFloat(budgetAmount);
      
      // Calculate total income
      const totalIncome = expenses
        .filter(exp => exp.type === 'income')
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      // Calculate total existing budgets (excluding the one being edited)
      const existingBudgets = budgets
        .filter(b => b.category !== editingBudget)
        .reduce((sum, b) => sum + b.limit, 0);
      
      const totalBudgetAfterChange = existingBudgets + budgetLimit;
      
      // Check if total budgets exceed income
      if (totalBudgetAfterChange > totalIncome) {
        const overage = totalBudgetAfterChange - totalIncome;
        toast.error(
          `🚨 Budget Alert! Total budgets (₹${totalBudgetAfterChange.toFixed(2)}) exceed your income (₹${totalIncome.toFixed(2)}) by ₹${overage.toFixed(2)}`,
          {
            duration: 8000,
            style: {
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '2px solid #f87171',
              color: '#dc2626',
              fontWeight: '700',
              fontSize: '14px',
            },
          }
        );
        return;
      }
      
      setBudget(selectedCategory, parseFloat(budgetAmount));
      
      toast.success(
        `✅ Budget ${editingBudget ? 'updated' : 'set'} for ${selectedCategory}: ₹${budgetLimit.toFixed(2)}`,
        {
          style: {
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #34d399',
            color: '#065f46',
            fontWeight: '600',
          },
        }
      );
      
      resetForm();
    } catch (error) {
      toast.error('An error occurred. Please try again.', {
        style: {
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '1px solid #f87171',
          color: '#dc2626',
          fontWeight: '600',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setBudgetAmount('');
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (category: string, currentLimit: number) => {
    setSelectedCategory(category);
    setBudgetAmount(currentLimit.toString());
    setEditingBudget(category);
    setShowForm(true);
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: 'over', color: 'red', icon: AlertTriangle };
    if (percentage >= 80) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(category =>
    !budgets.some(budget => budget.category === category)
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl border border-gray-200/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Budget Tracker</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={availableCategories.length === 0}
            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            aria-label="Set new budget"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6 border border-blue-200/50 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBudget ? 'Edit Budget' : 'Set New Budget'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  required
                  aria-label="Select category"
                >
                  <option value="">Select Category</option>
                  {editingBudget ? (
                    <option value={editingBudget}>{editingBudget}</option>
                  ) : (
                    availableCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))
                  )}
                </select>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Budget limit"
                    className="pl-12 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    required
                    aria-label="Budget amount"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingBudget ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    `${editingBudget ? 'Update' : 'Add'} Budget`
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budget List */}
        {budgets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets set yet</h3>
            <p className="text-gray-500 mb-4">Start by setting a budget for your expense categories</p>
            {availableCategories.length === 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> All expense categories already have budgets set. You can edit existing budgets or add more categories.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => {
              const { status, color, icon: StatusIcon } = getBudgetStatus(budget.spent, budget.limit);
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
              const remaining = Math.max(budget.limit - budget.spent, 0);

              return (
                <div key={budget.category} className="bg-gradient-to-r from-white to-gray-50/30 border border-gray-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                      <div className={`p-1 rounded-full ${
                        status === 'over' ? 'bg-red-100' : 
                        status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <StatusIcon className={`w-4 h-4 ${
                          status === 'over' ? 'text-red-600' : 
                          status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(budget.category, budget.limit)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Edit budget"
                        aria-label={`Edit ${budget.category} budget`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Spent: ₹{budget.spent.toFixed(2)}</span>
                      <span>Limit: ₹{budget.limit.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === 'over' ? 'bg-red-500' : 
                          status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span className={remaining < 0 ? 'text-red-600 font-semibold' : ''}>
                        {remaining >= 0 ? `₹${remaining.toFixed(2)} left` : `₹${Math.abs(remaining).toFixed(2)} over`}
                      </span>
                    </div>
                  </div>

                  {/* Status Message */}
                  {status === 'over' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Budget exceeded by ₹{Math.abs(remaining).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {status === 'warning' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⚠️ Budget is {percentage.toFixed(1)}% used - consider reducing spending
                      </p>
                    </div>
                  )}
                  {status === 'good' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 font-medium">
                        ✅ Good progress! ₹{remaining.toFixed(2)} remaining
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;