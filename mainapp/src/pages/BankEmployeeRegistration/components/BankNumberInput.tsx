/**
 * Bank Number Input Component
 * Action 10 from Confluence requirements
 * Provides Israeli bank number selection
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface BankNumber {
  bank_number: string;
  bank_name_en: string;
  bank_name_he?: string;
}

interface Props {
  value: string;
  onChange: (bankNumber: string) => void;
  disabled?: boolean;
}

const BankNumberInput: React.FC<Props> = ({ value, onChange, disabled = false }) => {
  const { t, i18n } = useTranslation();
  const [bankNumbers, setBankNumbers] = useState<BankNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBankNumbers();
  }, []);

  const loadBankNumbers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bank-numbers/israel');
      const result = await response.json();

      if (response.ok) {
        setBankNumbers(result.data || []);
      } else {
        setError(result.message || t('registration.error.bank_numbers_load_failed'));
      }
    } catch (err) {
      setError(t('registration.error.network'));
    } finally {
      setIsLoading(false);
    }
  };

  const getBankName = (bankNumber: BankNumber): string => {
    const currentLang = i18n.language;
    return currentLang === 'he' && bankNumber.bank_name_he 
      ? bankNumber.bank_name_he 
      : bankNumber.bank_name_en;
  };

  const filteredBankNumbers = bankNumbers.filter(bankNumber => {
    const searchLower = searchTerm.toLowerCase();
    return (
      bankNumber.bank_number.includes(searchTerm) ||
      bankNumber.bank_name_en.toLowerCase().includes(searchLower) ||
      (bankNumber.bank_name_he && bankNumber.bank_name_he.includes(searchTerm))
    );
  });

  const selectedBankNumber = bankNumbers.find(bn => bn.bank_number === value);
  const displayText = selectedBankNumber 
    ? `${selectedBankNumber.bank_number} - ${getBankName(selectedBankNumber)}`
    : value || t('registration.placeholder_bank_number');

  const handleBankNumberSelect = (bankNumber: string) => {
    onChange(bankNumber);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setSearchTerm(inputValue);
    
    if (!isOpen && inputValue) {
      setIsOpen(true);
    }
  };

  const handleRetryLoad = () => {
    loadBankNumbers();
  };

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.label_bank_number')} *
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
        {t('registration.label_bank_number')} *
      </label>
      
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm || value}
          onChange={handleInputChange}
          onFocus={() => !disabled && !isLoading && setIsOpen(true)}
          disabled={disabled || isLoading}
          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
            disabled || isLoading
              ? 'border-gray-600 text-gray-500 cursor-not-allowed'
              : 'border-gray-600 focus:border-yellow-400 focus:ring-yellow-400'
          }`}
          placeholder={isLoading ? t('registration.loading') : t('registration.placeholder_bank_number')}
        />
        
        {/* Dropdown Arrow */}
        <button
          type="button"
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className="absolute inset-y-0 right-0 px-3 flex items-center"
        >
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
      </div>

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
            {filteredBankNumbers.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-sm">
                {searchTerm 
                  ? t('registration.no_matching_bank_numbers') 
                  : t('registration.no_bank_numbers_available')
                }
              </div>
            ) : (
              filteredBankNumbers.map((bankNumber) => (
                <button
                  key={bankNumber.bank_number}
                  type="button"
                  onClick={() => handleBankNumberSelect(bankNumber.bank_number)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-600 focus:bg-gray-600 focus:outline-none transition-colors ${
                    bankNumber.bank_number === value ? 'bg-gray-600 text-yellow-400' : 'text-gray-100'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{bankNumber.bank_number}</span>
                      <span className="text-xs text-gray-400">
                        {t('registration.bank_code')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-300 mt-1">
                      {getBankName(bankNumber)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Help Text */}
      <p className="mt-2 text-xs text-gray-400">
        {t('registration.bank_number_help')}
      </p>
    </div>
  );
};

export default BankNumberInput; 