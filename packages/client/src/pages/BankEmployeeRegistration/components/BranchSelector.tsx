/**
 * Branch Selector Component
 * Action 9 from Confluence requirements
 * Loads and displays bank branches based on selected bank
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Branch {
  id: string;
  name_en: string;
  name_he?: string;
  name_ru?: string;
  branch_code?: string;
  city?: string;
}

interface Props {
  bankId: string;
  value: string;
  onChange: (branchId: string) => void;
  disabled?: boolean;
}

const BranchSelector: React.FC<Props> = ({ bankId, value, onChange, disabled = false }) => {
  const { t, i18n } = useTranslation();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (bankId) {
      loadBranches(bankId);
    } else {
      setBranches([]);
      setError(null);
    }
  }, [bankId]);

  const loadBranches = async (selectedBankId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/banks/${selectedBankId}/branches`);
      const result = await response.json();

      if (response.ok) {
        setBranches(result.data || []);
      } else {
        setError(result.message || t('registration.error.branches_load_failed'));
      }
    } catch (err) {
      setError(t('registration.error.network'));
    } finally {
      setIsLoading(false);
    }
  };

  const getBranchName = (branch: Branch): string => {
    const currentLang = i18n.language;
    let name = '';
    
    switch (currentLang) {
      case 'he':
        name = branch.name_he || branch.name_en;
        break;
      case 'ru':
        name = branch.name_ru || branch.name_en;
        break;
      default:
        name = branch.name_en;
    }

    // Add city if available
    if (branch.city) {
      name += ` - ${branch.city}`;
    }

    return name;
  };

  const selectedBranch = branches.find(branch => branch.id === value);
  const displayText = selectedBranch 
    ? getBranchName(selectedBranch) 
    : t('registration.placeholder_branch');

  const handleBranchSelect = (branchId: string) => {
    onChange(branchId);
    setIsOpen(false);
  };

  const handleRetryLoad = () => {
    if (bankId) {
      loadBranches(bankId);
    }
  };

  const isDisabled = disabled || !bankId || isLoading;

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.label_branch')} *
        </label>
        <div className="w-full px-4 py-3 bg-gray-700 border border-red-500 rounded-lg">
          <div className="text-red-400 text-sm mb-2">{error}</div>
          <button
            onClick={handleRetryLoad}
            className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
            disabled={isLoading}
          >
            {isLoading ? t('registration.loading') : t('registration.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {t('registration.label_branch')} *
      </label>
      
      {/* Custom Dropdown Button */}
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-left flex items-center justify-between transition-colors ${
          isDisabled
            ? 'border-gray-600 text-gray-500 cursor-not-allowed'
            : 'border-gray-600 text-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400'
        }`}
      >
        <span className={selectedBranch ? 'text-gray-100' : 'text-gray-400'}>
          {isLoading 
            ? t('registration.loading')
            : !bankId 
            ? t('registration.select_bank_first')
            : displayText
          }
        </span>
        
        {/* Dropdown Arrow */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {branches.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                {t('registration.no_branches_available')}
              </div>
            ) : (
              branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleBranchSelect(branch.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-600 focus:bg-gray-600 focus:outline-none transition-colors ${
                    branch.id === value ? 'bg-gray-600 text-yellow-400' : 'text-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{getBranchName(branch)}</span>
                    {branch.branch_code && (
                      <span className="text-xs text-gray-400 ml-2">({branch.branch_code})</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BranchSelector; 