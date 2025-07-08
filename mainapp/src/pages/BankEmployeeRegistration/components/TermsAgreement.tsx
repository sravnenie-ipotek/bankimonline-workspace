/**
 * Terms Agreement Component
 * Actions 14 & 15 from Confluence requirements
 * Handles terms of service acceptance checkbox and link
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const TermsAgreement: React.FC<Props> = ({ checked, onChange, disabled = false }) => {
  const { t } = useTranslation();

  const handleTermsLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open terms in new window/tab
    window.open('/terms', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="border-t border-gray-700 pt-6">
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="flex items-center h-5">
          <input
            id="terms-agreement"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={`h-4 w-4 rounded border-2 bg-gray-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              disabled
                ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                : checked
                ? 'border-yellow-400 bg-yellow-400 text-gray-900 focus:ring-yellow-400'
                : 'border-gray-600 text-yellow-400 focus:ring-yellow-400 hover:border-yellow-400'
            }`}
          />
        </div>

        {/* Terms Text and Link */}
        <div className="min-w-0 flex-1">
          <label
            htmlFor="terms-agreement"
            className={`text-sm leading-5 transition-colors ${
              disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 cursor-pointer'
            }`}
          >
            {/* Terms Text - Action 14 */}
            <span>{t('registration.terms_text')} </span>
            
            {/* Terms Link - Action 15 */}
            <button
              type="button"
              onClick={handleTermsLinkClick}
              disabled={disabled}
              className={`underline transition-colors ${
                disabled
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-yellow-400 hover:text-yellow-300 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:ring-offset-1 focus:ring-offset-gray-800 rounded'
              }`}
            >
              {t('registration.terms_link')}
            </button>
          </label>

          {/* Additional Information */}
          <div className="mt-2">
            <p className="text-xs text-gray-500">
              {t('registration.terms_required_note')}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Indicator for Required Field */}
      {!checked && (
        <div className="mt-3 flex items-center space-x-2">
          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span className="text-xs text-gray-500">
            {t('registration.terms_acceptance_required')}
          </span>
        </div>
      )}
    </div>
  );
};

export default TermsAgreement; 