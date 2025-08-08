import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Expense, Budget, ExpenseContextType } from '../types/expense';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

type ExpenseAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_BUDGET'; payload: { category: string; limit: number } }
  | { type: 'SET_BUDGETS'; payload: Budget[] };

interface ExpenseState {
  expenses: Expense[];
  budgets: Budget[];
}

const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload.expense : expense
        )
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_BUDGET':
      const existingBudgetIndex = state.budgets.findIndex(b => b.category === action.payload.category);
      if (existingBudgetIndex >= 0) {
        const newBudgets = [...state.budgets];
        newBudgets[existingBudgetIndex] = {
          ...newBudgets[existingBudgetIndex],
          limit: action.payload.limit
        };
        return { ...state, budgets: newBudgets };
      } else {
        return {
          ...state,
          budgets: [...state.budgets, { category: action.payload.category, limit: action.payload.limit, spent: 0 }]
        };
      }
    default:
      return state;
  }
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, {
    expenses: [],
    budgets: []
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedBudgets = localStorage.getItem('budgets');
    
    if (savedExpenses) {
      dispatch({ type: 'SET_EXPENSES', payload: JSON.parse(savedExpenses) });
    }
    if (savedBudgets) {
      dispatch({ type: 'SET_BUDGETS', payload: JSON.parse(savedBudgets) });
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
  }, [state.expenses]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(state.budgets));
  }, [state.budgets]);

  // Update budget spent amounts when expenses change
  useEffect(() => {
    const updatedBudgets = state.budgets.map(budget => {
      const spent = state.expenses
        .filter(expense => expense.category === budget.category && expense.type === 'expense')
        .reduce((total, expense) => total + expense.amount, 0);
      return { ...budget, spent };
    });
    
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(state.budgets)) {
      dispatch({ type: 'SET_BUDGETS', payload: updatedBudgets });
    }
  }, [state.expenses, state.budgets]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...expenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };

  const updateExpense = (id: string, expenseData: Omit<Expense, 'id'>) => {
    const expense: Expense = { ...expenseData, id };
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, expense } });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const setBudget = (category: string, limit: number) => {
    dispatch({ type: 'SET_BUDGET', payload: { category, limit } });
  };

  const value: ExpenseContextType = {
    expenses: state.expenses,
    budgets: state.budgets,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};