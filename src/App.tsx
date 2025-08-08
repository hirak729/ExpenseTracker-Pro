import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ExportModal from './components/ExportModal';
import Home from './pages/Home';
import AnalyticsPage from './pages/Analytics';
import InvestmentsPage from './pages/Investments';

const App: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <ThemeProvider>
      <ExpenseProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-colors duration-300">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                },
              }}
            />
            <Header onExport={handleExport} />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/investments" element={<InvestmentsPage />} />
            </Routes>

            <ExportModal 
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
            />
          </div>
        </Router>
      </ExpenseProvider>
    </ThemeProvider>
  );
};

export default App;