import React from 'react';
import InvestmentTracker from '../components/InvestmentTracker';

const InvestmentsPage: React.FC = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Tracker</h1>
        <p className="text-gray-600">Track and manage your investment portfolio</p>
      </div>
      
      <InvestmentTracker />
    </main>
  );
};

export default InvestmentsPage;
