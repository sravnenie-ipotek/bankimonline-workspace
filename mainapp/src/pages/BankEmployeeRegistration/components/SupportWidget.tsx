/**
 * Support Widget Component
 * Provides help and support access during registration
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SupportWidget: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleContactSupport = () => {
    // Open support email or chat
    window.location.href = 'mailto:support@bankimonline.com?subject=Bank Employee Registration Support';
  };

  const handleOpenHelp = () => {
    // Open help documentation
    window.open('/help/bank-employee-registration', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Support Options */}
      {isExpanded && (
        <div className="mb-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 w-64">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-100">
              {t('support.need_help')}
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={handleContactSupport}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{t('support.contact_support')}</span>
              </button>

              <button
                onClick={handleOpenHelp}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('support.view_help')}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                {t('support.response_time')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Support Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-12 h-12 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900"
        aria-label={t('support.toggle_support')}
      >
        {isExpanded ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default SupportWidget; 