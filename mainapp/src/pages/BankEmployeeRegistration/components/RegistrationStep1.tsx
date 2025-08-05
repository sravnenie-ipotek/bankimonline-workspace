/**
 * Registration Step 1: Personal Information
 * Implements Actions 5-15 from Confluence requirements
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RegistrationFormData } from '../BankEmployeeRegistration';
import BankSelector from './BankSelector';
import BranchSelector from './BranchSelector';
import BankNumberInput from './BankNumberInput';
import TermsAgreement from './TermsAgreement';

interface Props {
  formData: RegistrationFormData;
  updateFormData: (updates: Partial<RegistrationFormData>) => void;
  onComplete: () => void;
  onLoginRedirect: () => void;
  isLoading: boolean;
}

const RegistrationStep1: React.FC<Props> = ({
  formData,
  updateFormData,
  onComplete,
  onLoginRedirect,
  isLoading
}) => {
  const { t, i18n } = useTranslation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation functions based on Confluence requirements
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return t('registration.validation.name_required');
    }

    // Language-specific validation
    const currentLang = i18n.language;
    const nameRegex = {
      'he': /^[\u0590-\u05FFa-zA-Z\s\-']+$/, // Hebrew + Latin
      'ru': /^[а-яёА-ЯЁa-zA-Z\s\-']+$/u, // Cyrillic + Latin
      'en': /^[a-zA-Z\s\-']+$/ // Latin only
    };

    const regex = nameRegex[currentLang as keyof typeof nameRegex] || nameRegex.en;
    
    if (!regex.test(name)) {
      return t('registration.validation.name_invalid_chars');
    }

    if (name.length < 2 || name.length > 50) {
      return t('registration.validation.name_length');
    }

    return null;
  };

  const validatePosition = (position: string): string | null => {
    if (!position.trim()) {
      return t('registration.validation.position_required');
    }

    if (position.length < 2 || position.length > 100) {
      return t('registration.validation.position_length');
    }

    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return t('registration.validation.email_required');
    }

    // Corporate email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return t('registration.validation.email_invalid');
    }

    // Check for common personal email domains
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (personalDomains.includes(domain)) {
      return t('registration.validation.email_corporate_required');
    }

    return null;
  };

  const validateField = (fieldName: string, value: string) => {
    let error: string | null = null;

    switch (fieldName) {
      case 'fullName':
        error = validateName(value);
        break;
      case 'position':
        error = validatePosition(value);
        break;
      case 'corporateEmail':
        error = validateEmail(value);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    updateFormData({ [fieldName]: value });
    
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName as keyof RegistrationFormData] as string);
  };

  const isFormValid = () => {
    const requiredFields = ['fullName', 'position', 'corporateEmail', 'bankId', 'branchId', 'bankNumber'];
    const hasAllFields = requiredFields.every(field => 
      formData[field as keyof RegistrationFormData]
    );
    const hasNoErrors = Object.values(fieldErrors).every(error => !error);
    
    return hasAllFields && hasNoErrors && formData.termsAccepted;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allFields = ['fullName', 'position', 'corporateEmail'];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      newTouched[field] = true;
      validateField(field, formData[field as keyof RegistrationFormData] as string);
    });
    setTouched(prev => ({ ...prev, ...newTouched }));

    if (isFormValid()) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name Input - Action 5 */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
            {t('registration.label_name')} *
          </label>
          <div className="relative">
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              onBlur={() => handleFieldBlur('fullName')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.fullName && touched.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:border-yellow-400 focus:ring-yellow-400'
              }`}
              placeholder={t('registration.placeholder_name')}
              disabled={isLoading}
            />
            {fieldErrors.fullName && touched.fullName && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.fullName}</p>
            )}
          </div>
        </div>

        {/* Position Input - Action 6 */}
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">
            {t('registration.label_position')} *
          </label>
          <div className="relative">
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => handleFieldChange('position', e.target.value)}
              onBlur={() => handleFieldBlur('position')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.position && touched.position
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600 focus:border-yellow-400 focus:ring-yellow-400'
              }`}
              placeholder={t('registration.placeholder_position')}
              disabled={isLoading}
            />
            {fieldErrors.position && touched.position && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.position}</p>
            )}
          </div>
        </div>
      </div>

      {/* Corporate Email Input - Action 7 */}
      <div>
        <label htmlFor="corporateEmail" className="block text-sm font-medium text-gray-300 mb-2">
          {t('registration.label_email')} *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            id="corporateEmail"
            value={formData.corporateEmail}
            onChange={(e) => handleFieldChange('corporateEmail', e.target.value)}
            onBlur={() => handleFieldBlur('corporateEmail')}
            className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.corporateEmail && touched.corporateEmail
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-600 focus:border-yellow-400 focus:ring-yellow-400'
            }`}
            placeholder={t('registration.placeholder_email')}
            disabled={isLoading}
          />
          {fieldErrors.corporateEmail && touched.corporateEmail && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.corporateEmail}</p>
          )}
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-t border-gray-700"></div>

      {/* Bank Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Selection - Action 8 */}
        <BankSelector
          value={formData.bankId}
          onChange={(bankId) => {
            updateFormData({ bankId, branchId: '' }); // Reset branch when bank changes
          }}
          disabled={isLoading}
        />

        {/* Branch Selection - Action 9 */}
        <BranchSelector
          bankId={formData.bankId}
          value={formData.branchId}
          onChange={(branchId) => updateFormData({ branchId })}
          disabled={isLoading || !formData.bankId}
        />
      </div>

      {/* Bank Number Input - Action 10 */}
      <BankNumberInput
        value={formData.bankNumber}
        onChange={(bankNumber) => updateFormData({ bankNumber })}
        disabled={isLoading}
      />

      {/* Terms Agreement - Actions 14 & 15 */}
      <TermsAgreement
        checked={formData.termsAccepted}
        onChange={(termsAccepted) => updateFormData({ termsAccepted })}
        disabled={isLoading}
      />

      {/* Action Buttons */}
      <div className="flex flex-col space-y-4">
        {/* Continue Button - Action 11 */}
        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            isFormValid() && !isLoading
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
              {t('registration.loading')}
            </div>
          ) : (
            t('registration.button_continue')
          )}
        </button>

        {/* Separator Line */}
        <div className="border-t border-gray-700"></div>

        {/* Login Link - Action 12 */}
        <div className="text-center">
          <button
            type="button"
            onClick={onLoginRedirect}
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            disabled={isLoading}
          >
            {t('registration.link_login')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RegistrationStep1; 