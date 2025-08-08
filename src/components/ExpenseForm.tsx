import React, { useState, useEffect } from 'react';
import { Plus, Edit3, X, Sparkles, DollarSign, AlertCircle } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Expense } from '../types/expense';
import toast from 'react-hot-toast';

interface ExpenseFormProps {
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

interface FormErrors {
  amount?: string;
  category?: string;
  description?: string;
  date?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ editingExpense, onCancelEdit }) => {
  const { addExpense, updateExpense, expenses, budgets } = useExpense();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setType(editingExpense.type);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDescription(editingExpense.description);
      setDate(editingExpense.date);
    } else {
      resetForm();
    }
    setErrors({});
  }, [editingExpense]);

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }

    if (!date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        style: {
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '1px solid #f87171',
          color: '#dc2626',
          fontWeight: '600',
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseAmount = parseFloat(amount);
      
      // Check if expense exceeds budget for the category
      if (type === 'expense') {
        const categoryBudget = budgets.find(b => b.category === category);
        if (categoryBudget) {
          const currentSpent = expenses
            .filter(exp => exp.category === category && exp.type === 'expense' && exp.id !== editingExpense?.id)
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          const newTotal = currentSpent + expenseAmount;
          
          if (newTotal > categoryBudget.limit) {
            const overage = newTotal - categoryBudget.limit;
            toast.error(
              `⚠️ Budget Alert! This expense will exceed your ${category} budget by ₹${overage.toFixed(2)}`,
              {
                duration: 6000,
                style: {
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: '1px solid #f87171',
                  color: '#dc2626',
                  fontWeight: '600',
                },
              }
            );
          }
        }
      }

      const expenseData = {
        type,
        amount: expenseAmount,
        category,
        description: description.trim(),
        date
      };

      if (editingExpense) {
        updateExpense(editingExpense.id, expenseData);
        onCancelEdit?.();
        toast.success('💫 Transaction updated successfully!', {
          style: {
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '1px solid #34d399',
            color: '#065f46',
            fontWeight: '600',
          },
        });
      } else {
        addExpense(expenseData);
        resetForm();
        toast.success(`✨ ${type === 'income' ? 'Income' : 'Expense'} added successfully!`, {
          style: {
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            border: '1px solid #60a5fa',
            color: '#1e40af',
            fontWeight: '600',
          },
        });
      }
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

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {editingExpense ? (
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
            )}
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {editingExpense ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
        </div>
        {editingExpense && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Cancel editing"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              💰 Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  type === 'expense'
                    ? 'border-rose-400 bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                }`}
                aria-pressed={type === 'expense'}
              >
                📉 Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  type === 'income'
                    ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 shadow-lg transform scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md'
                }`}
                aria-pressed={type === 'income'}
              >
                📈 Income
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              💵 Amount
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: undefined });
                }}
                className={`pl-12 block w-full rounded-xl border px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm ${
                  errors.amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
                aria-describedby={errors.amount ? 'amount-error' : undefined}
              />
              {errors.amount && (
                <div id="amount-error" className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors({ ...errors, category: undefined });
              }}
              className={`block w-full rounded-xl border px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm ${
                errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <div id="category-error" className="flex items-center mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.category}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              📅 Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors({ ...errors, date: undefined });
              }}
              className={`block w-full rounded-xl border px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm ${
                errors.date ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date && (
              <div id="date-error" className="flex items-center mt-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.date}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            📝 Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: undefined });
            }}
            className={`block w-full rounded-xl border px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm ${
              errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="Brief description of the transaction"
            required
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <div id="description-error" className="flex items-center mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {editingExpense ? 'Updating...' : 'Adding...'}
              </div>
            ) : (
              editingExpense ? 'Update Transaction' : 'Add Transaction'
            )}
          </button>
          {editingExpense && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 sm:flex-none px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;