/**
 * Bank Selector Component
 * Action 8 from Confluence requirements
 * Loads and displays bank list from backend
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Bank {
  id: string;
  name_en: string;
  name_he?: string;
  name_ru?: string;
  code?: string;
}

interface Props {
  value: string;
  onChange: (bankId: string) => void;
  disabled?: boolean;
}

const BankSelector: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const { t, i18n } = useTranslation();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/banks/list');
      const result = await response.json();

      if (response.ok) {
        setBanks(result.data || []);
      } else {
        setError(result.message || t('registration.error.banks_load_failed'));
      }
    } catch (err) {
      setError(t('registration.error.network'));
    } finally {
      setIsLoading(false);
    }
  };

  const getBankName = (bank: Bank): string => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'he':
        return bank.name_he || bank.name_en;
      case 'ru':
        return bank.name_ru || bank.name_en;
      default:
        return bank.name_en;
    }
  };

  const selectedBank = banks.find(bank => bank.id === value);
  const displayText = selectedBank ? getBankName(selectedBank) : t('registration.placeholder_bank');

  const handleBankSelect = (bankId: string) => {
    onChange(bankId);
    setIsOpen(false);
  };

  const handleRetryLoad = () => {
    loadBanks();
  };

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.label_bank')} *
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
        {t('registration.label_bank')} *
      </label>
      
      {/* Custom Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-left flex items-center justify-between transition-colors ${
          disabled || isLoading
            ? 'border-gray-600 text-gray-500 cursor-not-allowed'
            : 'border-gray-600 text-gray-100 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400'
        }`}
      >
        <span className={selectedBank ? 'text-gray-100' : 'text-gray-400'}>
          {isLoading ? t('registration.loading') : displayText}
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
      {isOpen && !disabled && !isLoading && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {banks.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                {t('registration.no_banks_available')}
              </div>
            ) : (
              banks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => handleBankSelect(bank.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-600 focus:bg-gray-600 focus:outline-none transition-colors ${
                    bank.id === value ? 'bg-gray-600 text-yellow-400' : 'text-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{getBankName(bank)}</span>
                    {bank.code && (
                      <span className="text-xs text-gray-400 ml-2">({bank.code})</span>
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

export default BankSelector; 