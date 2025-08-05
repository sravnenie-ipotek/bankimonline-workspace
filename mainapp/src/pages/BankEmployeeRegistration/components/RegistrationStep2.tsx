/**
 * Registration Step 2: Service Selection
 * Step 2 from Confluence requirements (to be fully implemented)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { RegistrationFormData } from '../BankEmployeeRegistration';

interface Props {
  formData: RegistrationFormData;
  updateFormData: (updates: Partial<RegistrationFormData>) => void;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const RegistrationStep2: React.FC<Props> = ({
  formData,
  updateFormData,
  onComplete,
  onBack,
  isLoading
}) => {
  const { t } = useTranslation();

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = formData.selectedServices || [];
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    updateFormData({ selectedServices: updatedServices });
  };

  const availableServices = [
    { id: 'mortgage', name: t('services.mortgage'), description: t('services.mortgage_description') },
    { id: 'credit', name: t('services.credit'), description: t('services.credit_description') },
    { id: 'investment', name: t('services.investment'), description: t('services.investment_description') }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 2 Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">
          {t('registration.step2_title')}
        </h2>
        <p className="text-gray-400 text-sm">
          {t('registration.step2_description')}
        </p>
      </div>

      {/* Service Selection */}
      <div className="space-y-4">
        {availableServices.map((service) => (
          <div
            key={service.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              formData.selectedServices?.includes(service.id)
                ? 'border-yellow-400 bg-yellow-400/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onClick={() => handleServiceToggle(service.id)}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.selectedServices?.includes(service.id) || false}
                onChange={() => handleServiceToggle(service.id)}
                className="mt-1 h-4 w-4 text-yellow-400 border-gray-600 rounded focus:ring-yellow-400 focus:ring-offset-gray-800"
              />
              <div className="flex-1">
                <h3 className="text-gray-100 font-medium">{service.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('registration.button_back')}
        </button>

        <button
          type="submit"
          disabled={isLoading || !formData.selectedServices?.length}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            !isLoading && formData.selectedServices?.length
              ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('registration.registering')}
            </div>
          ) : (
            t('registration.button_complete')
          )}
        </button>
      </div>
    </form>
  );
};

export default RegistrationStep2; 