import React from 'react';
import Analytics from '../components/Analytics';

const AnalyticsPage: React.FC = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
        <p className="text-gray-600">Analyze your spending patterns and financial trends</p>
      </div>
      
      <Analytics />
    </main>
  );
};

export default AnalyticsPage;
