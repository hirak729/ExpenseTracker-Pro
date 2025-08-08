import React from 'react';
import { DollarSign, Download, Sparkles, Home, BarChart3, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useExpense } from '../contexts/ExpenseContext';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExport }) => {
  const { expenses } = useExpense();
  
  const totalIncome = expenses
    .filter(expense => expense.type === 'income')
    .reduce((total, expense) => total + expense.amount, 0);
  
  const totalExpenses = expenses
    .filter(expense => expense.type === 'expense')
    .reduce((total, expense) => total + expense.amount, 0);
  
  const balance = totalIncome - totalExpenses;

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <div className="relative p-3 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                <DollarSign className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse">
                  <Sparkles className="w-3 h-3 text-yellow-600 absolute top-0.5 left-0.5" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  ExpenseTracker Pro
                </h1>
                <p className="text-gray-300 text-sm sm:text-base">Smart financial management at your fingertips</p>
              </div>
            </Link>
          </div>
          
          {/* Navigation and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <NavLink to="/" icon={Home} label="Home" />
              <NavLink to="/analytics" icon={BarChart3} label="Analytics" />
              <NavLink to="/investments" icon={PieChart} label="Investments" />
            </nav>
            <ThemeToggle />
          </div>

          {/* Financial Summary and Export Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center w-full sm:w-auto">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-xl border border-emerald-400/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-xs sm:text-sm font-medium text-emerald-200">Income</div>
                <div className="text-lg sm:text-xl font-bold text-white">₹{totalIncome.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 backdrop-blur-sm px-3 sm:px-4 py-3 rounded-xl border border-rose-400/30 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-xs sm:text-sm font-medium text-rose-200">Expenses</div>
                <div className="text-lg sm:text-xl font-bold text-white">₹{totalExpenses.toFixed(2)}</div>
              </div>
              <div className={`backdrop-blur-sm px-3 sm:px-4 py-3 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 ${
                balance >= 0 
                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30' 
                  : 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-400/30'
              }`}>
                <div className={`text-xs sm:text-sm font-medium ${
                  balance >= 0 ? 'text-blue-200' : 'text-orange-200'
                }`}>
                  Balance
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">
                  ₹{balance.toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Export Button */}
            <button
              onClick={onExport}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Export financial data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-white text-slate-900 shadow-lg'
          : 'text-white hover:bg-white/20'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export default Header;