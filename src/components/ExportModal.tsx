import React, { useState } from 'react';
import { Download, X, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { exportToCSV, exportSummaryToCSV } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { expenses } = useExpense();
  const [exportType, setExportType] = useState<'all' | 'summary'>('all');
  const [dateRange, setDateRange] = useState<'all' | '30days' | '90days' | '365days'>('all');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getFilteredExpenses = () => {
    if (dateRange === 'all') return expenses;
    
    const now = new Date();
    const daysAgo = {
      '30days': 30,
      '90days': 90,
      '365days': 365
    }[dateRange];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysAgo);
    
    return expenses.filter(expense => new Date(expense.date) >= cutoffDate);
  };

  const handleExport = async () => {
    if (expenses.length === 0) return;
    
    setIsExporting(true);
    
    try {
      const filteredExpenses = getFilteredExpenses();
      const filename = `expenses_${dateRange}_${Date.now()}`;
      
      if (exportType === 'all') {
        exportToCSV(filteredExpenses, filename);
      } else {
        exportSummaryToCSV(filteredExpenses, `summary_${dateRange}_${Date.now()}`);
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const filteredExpenses = getFilteredExpenses();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="radio"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value as 'all' | 'summary')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">All Transactions</div>
                  <div className="text-sm text-gray-500">Complete transaction history with all details</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="radio"
                  value="summary"
                  checked={exportType === 'summary'}
                  onChange={(e) => setExportType(e.target.value as 'all' | 'summary')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <BarChart3 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Summary Report</div>
                  <div className="text-sm text-gray-500">Totals and category breakdowns</div>
                </div>
              </label>
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              aria-label="Select date range for export"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="365days">Last Year</option>
            </select>
          </div>

          {/* Export Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''} will be exported
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  File will be downloaded as a CSV file with timestamp
                </p>
              </div>
            </div>
          </div>

          {/* Warning for no data */}
          {expenses.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    No data to export
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Add some transactions first to export your data
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleExport}
            disabled={expenses.length === 0 || isExporting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isExporting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </div>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;