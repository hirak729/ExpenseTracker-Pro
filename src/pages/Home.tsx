import React, { useState } from 'react';
import BudgetTracker from '../components/BudgetTracker';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Home: React.FC = () => {
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Budget Tracker Section */}
      <div className="mb-10">
        <BudgetTracker />
      </div>

      {/* Form and Transaction List */}
      <div className="space-y-6 lg:space-y-8">
        <ExpenseForm 
          editingExpense={editingExpense}
          onCancelEdit={handleCancelEdit}
        />
        <ExpenseList 
          onEditExpense={setEditingExpense}
        />
      </div>
    </main>
  );
};

export default Home;
