/**
 * Bank Employee Registration Component
 * Implements the full registration flow as specified in Confluence requirements
 * Matches Figma design: AP | Сотрудник Банка
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RegistrationStep1 from './components/RegistrationStep1';
import RegistrationStep2 from './components/RegistrationStep2';
import StepNavigation from './components/StepNavigation';
import LanguageSelector from './components/LanguageSelector';
import SupportWidget from './components/SupportWidget';
import './BankEmployeeRegistration.module.scss';

export interface RegistrationFormData {
  // Step 1: Personal Information
  fullName: string;
  position: string;
  corporateEmail: string;
  bankId: string;
  branchId: string;
  bankNumber: string;
  termsAccepted: boolean;

  // Step 2: Service Selection (to be implemented)
  selectedServices: string[];
}

const BankEmployeeRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    position: '',
    corporateEmail: '',
    bankId: '',
    branchId: '',
    bankNumber: '',
    termsAccepted: false,
    selectedServices: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-save form data to localStorage (as per Confluence requirements)
  useEffect(() => {
    const savedData = localStorage.getItem('bankEmployeeRegistration');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (err) {
        console.error('Error parsing saved registration data:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bankEmployeeRegistration', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<RegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleStep1Complete = () => {
    // Validate Step 1 data
    const { fullName, position, corporateEmail, bankId, branchId, bankNumber, termsAccepted } = formData;
    
    if (!fullName || !position || !corporateEmail || !bankId || !branchId || !bankNumber || !termsAccepted) {
      setError(t('registration.error.incomplete_fields'));
      return;
    }

    setCurrentStep(2);
    setError(null);
  };

  const handleStep2Complete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bank-employee/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Clear saved data
        localStorage.removeItem('bankEmployeeRegistration');
        
        // Redirect to success page or login
        navigate('/bank-employee/registration-success', { 
          state: { registrationId: result.data.id }
        });
      } else {
        setError(result.message || t('registration.error.general'));
      }
    } catch (err) {
      setError(t('registration.error.network'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setError(null);
  };

  const handleLoginRedirect = () => {
    navigate('/bank-employee/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 9.949V7h2v19.949C18.16 26.739 22 22.55 22 17V7l-10-5z"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-white">BankimOnline</span>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-2xl w-full space-y-8">
          {/* Registration Form Card */}
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-100 mb-3">
                {t('registration.title')}
              </h1>
              <p className="text-gray-400 text-sm">
                {t('registration.subtitle')}
              </p>
            </div>

            {/* Step Navigation */}
            <StepNavigation currentStep={currentStep} />

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Step Content */}
            {currentStep === 1 ? (
              <RegistrationStep1
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleStep1Complete}
                onLoginRedirect={handleLoginRedirect}
                isLoading={isLoading}
              />
            ) : (
              <RegistrationStep2
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleStep2Complete}
                onBack={handleBackToStep1}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <button
              onClick={handleLoginRedirect}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              {t('registration.already_have_account')}
            </button>
          </div>
        </div>
      </div>

      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

export default BankEmployeeRegistration; 