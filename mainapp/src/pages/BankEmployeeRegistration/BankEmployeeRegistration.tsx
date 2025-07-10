/**
 * Bank Employee Registration Component
 * Single-page registration form for individual bank employees
 * Uses similar logic to bank partner registration but for employee workflow
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styles from './BankEmployeeRegistration.module.scss';
import { SharedHeader } from '@components/layout/SharedHeader';

// Custom error component that always reserves space
const CustomErrorMessage = ({ name, errors, touched }: { name: string; errors: any; touched: any }) => {
  return (
    <div className={styles.errorMessage}>
      {touched[name] && errors[name] ? errors[name] : ''}
    </div>
  );
};

export const BankEmployeeRegistration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  
  // State for API data
  const [banks, setBanks] = useState<Array<{id: number, name_en: string, name_he: string, name_ru: string}>>([]);
  const [branches, setBranches] = useState<Array<{id: number, name_en: string, name_he: string, name_ru: string, bank_id: number}>>([]);
  const [cities, setCities] = useState<Array<{id: number, name_en: string, name_he: string, name_ru: string}>>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Create validation schema with translations
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, t('bank_worker_validation_name_min'))
      .required(t('bank_worker_validation_name_required')),
    position: Yup.string()
      .min(2, t('bank_worker_validation_position_min'))
      .required(t('bank_worker_validation_position_required')),
    email: Yup.string()
      .email(t('bank_worker_validation_email_invalid'))
      .required(t('bank_worker_validation_email_required')),
    bankId: Yup.number().required(t('bank_worker_validation_bank_required')),
    branchId: Yup.number().required(t('bank_worker_validation_branch_required')),
    bankNumber: Yup.string()
      .min(3, t('bank_worker_validation_bank_number_min'))
      .required(t('bank_worker_validation_bank_number_required')),
    acceptTerms: Yup.boolean()
      .oneOf([true], t('bank_worker_validation_terms_required'))
      .required(t('bank_worker_validation_terms_required'))
  });

  // Fetch banks from API
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoadingBanks(true);
        const response = await fetch(`/api/banks/list?lang=${i18n.language}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setBanks(data.data);
        } else {
          console.error('Failed to fetch banks:', data.message || 'Unknown error');
          setBanks([]);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        setBanks([]);
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, [i18n.language]);

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        const response = await fetch(`/api/get-cities?lang=${i18n.language}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setCities(data.data);
        } else {
          console.error('Failed to fetch cities:', data.message || 'Unknown error');
          setCities([]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [i18n.language]);

  // Fetch branches when bank is selected
  useEffect(() => {
    const fetchBranches = async (bankId: number) => {
      try {
        setIsLoadingBranches(true);
        const response = await fetch(`/api/banks/${bankId}/branches`);
        const data = await response.json();

        if (data.status === 'success' && data.data) {
          setBranches(data.data);
      } else {
          console.error('Failed to fetch branches:', data.message || 'Unknown error');
          setBranches([]);
      }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
    } finally {
        setIsLoadingBranches(false);
    }
  };

    if (selectedBankId) {
      fetchBranches(selectedBankId);
    }
  }, [selectedBankId]);

  // Get bank/branch names based on current language
  const getBankName = (bank: any) => {
    const lang = i18n.language;
    return bank[`name_${lang}`] || bank.name_en || bank.name || `Bank ${bank.id}`;
  };

  const getBranchName = (branch: any) => {
    const lang = i18n.language;
    return branch[`name_${lang}`] || branch.name_en || branch.name || `Branch ${branch.id}`;
  };

  const getCityName = (city: any) => {
    const lang = i18n.language;
    return city[`name_${lang}`] || city.name_en || city.name || `City ${city.id}`;
  };

  // Filter banks, branches, and cities based on search
  const filteredBanks = banks.filter(bank => 
    getBankName(bank).toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

  const filteredBranches = branches.filter(branch => 
    getBranchName(branch).toLowerCase().includes(branchSearchTerm.toLowerCase())
  );

  const filteredCities = cities.filter(city => 
    getCityName(city).toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  const initialValues = {
    fullName: '',
    position: '',
    email: '',
    bankId: '',
    branchId: '',
    bankNumber: '',
    acceptTerms: false
  };

  const handleSubmit = (values: any) => {
    console.log('Demo form submitted:', values);
    alert(`${t('bank_worker_demo_description')}\n\nIn the real system, after successful registration, you would be redirected to:\n/bank-worker/status/[registration-id]\n\nThis page would show your registration status and next steps.`);
  };

  const selectedBank = banks.find(bank => bank.id === selectedBankId);
  const selectedBranch = branches.find(branch => branch.id === selectedBranchId);
  const selectedCity = cities.find(city => city.id === selectedCityId);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(`.${styles.dropdown}`)) {
        setShowBankDropdown(false);
        setShowBranchDropdown(false);
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      {/* Header - Using SharedHeader component with navigation confirmation */}
      <SharedHeader 
        confirmNavigation={true}
        confirmationMessage="Are you sure you want to leave the registration process? Your progress will be lost."
      />

      {/* Page Background */}
      <div className={styles.pageBackground}>
        {/* Sign up form */}
        <div className={styles.signUpForm}>
          {/* Title */}
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>{t('bank_worker_registration')}</h1>
            <p className={styles.subtitle}>{t('bank_worker_register_subtitle')}</p>
          </div>

          {/* Stepper Navigation */}
          <div className={styles.stepperNavigation}>
            <div className={styles.navigation}>
              {/* Active Step */}
              <div className={styles.navItemStepper}>
                <div className={styles.shape}>
                  <span className={styles.stepNumber}>1</span>
                </div>
                <span className={styles.stepText}>{t('bank_worker_basic_info')}</span>
              </div>
              
              {/* Arrow */}
              <div className={styles.chevronRight}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.33"/>
                </svg>
              </div>

              {/* Inactive Step */}
              <div className={`${styles.navItemStepper} ${styles.inactive}`}>
                <div className={styles.shape}>
                  <span className={styles.stepNumber}>2</span>
                </div>
                <span className={styles.stepText}>{t('bank_worker_service_selection')}</span>
              </div>
            </div>
          </div>

          {/* Container with forms */}
          <div className={styles.containerWithForms}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form>
                  {/* 1st row */}
                  <div className={styles.firstRow}>
                    {/* Full Name Input */}
                    <div className={styles.inputField}>
                      <label className={styles.label}>{t('bank_worker_full_name')}</label>
                      <div className={styles.input}>
                        <div className={styles.content}>
                          <Field
                            type="text"
                            name="fullName"
                            placeholder={t('bank_worker_full_name_placeholder')}
                            className={styles.inputText}
                          />
                        </div>
                      </div>
                      <CustomErrorMessage name="fullName" errors={errors} touched={touched} />
                    </div>

                    {/* Position Input */}
                    <div className={styles.inputField}>
                      <label className={styles.label}>{t('bank_worker_position')}</label>
                      <div className={styles.input}>
                        <div className={styles.content}>
                          <Field
                            type="text"
                            name="position"
                            placeholder={t('bank_worker_position_placeholder')}
                            className={styles.inputText}
                          />
                        </div>
                      </div>
                      <CustomErrorMessage name="position" errors={errors} touched={touched} />
                    </div>
                  </div>

                  {/* Line separator */}
                  <div className={styles.line}></div>

                  {/* 2nd row */}
                  <div className={styles.secondRow}>
                    {/* Email Input */}
                    <div className={styles.inputField}>
                      <label className={styles.label}>{t('bank_worker_bank_email')}</label>
                      <div className={styles.input}>
                        <div className={styles.content}>
                          {/* Email icon */}
                          <div className={styles.envelope}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2.5 3.5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1" fill="none"/>
                              <path d="m2.5 4.5 5.5 4 5.5-4" stroke="currentColor" strokeWidth="1"/>
                            </svg>
                          </div>
                          <Field
                            type="email"
                            name="email"
                            placeholder={t('bank_worker_bank_email_placeholder')}
                            className={styles.inputText}
                          />
                        </div>
                      </div>
                      <CustomErrorMessage name="email" errors={errors} touched={touched} />
        </div>

                    {/* Bank Dropdown */}
                    <div className={styles.inputField}>
                      <label className={styles.label}>{t('bank_worker_bank')}</label>
                      <div className={styles.dropdown}>
                        <div 
                          className={styles.input}
                          onClick={() => !isLoadingBanks && setShowBankDropdown(!showBankDropdown)}
                        >
                          <div className={styles.content}>
                            <span className={styles.selectedText}>
                              {isLoadingBanks 
                                ? t('bank_worker_loading_banks')
                                : selectedBank 
                                  ? getBankName(selectedBank)
                                  : t('bank_worker_select_bank')
                              }
                            </span>
                            <div className={styles.chevronUp}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.33"/>
                              </svg>
                            </div>
                          </div>
            </div>

                        {/* Dropdown Menu */}
                        {showBankDropdown && !isLoadingBanks && (
                          <div className={styles.dropdownMenu}>
                            <div className={styles.dropdownMenuContainer}>
                              <div className={styles.dropdownMenuContent}>
                                {/* Search */}
                                <div className={styles.searchSection}>
                                  <div className={styles.searchInputField}>
                                    <div className={styles.searchInput}>
                                      <div className={styles.searchContent}>
                                        <div className={styles.searchIcon}>
                                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
                                            <path d="m13 13-3-3" stroke="currentColor" strokeWidth="1"/>
                                          </svg>
                                        </div>
                                        <input
                                          type="text"
                                          placeholder={t('bank_worker_search_banks')}
                                          value={bankSearchTerm}
                                          onChange={(e) => setBankSearchTerm(e.target.value)}
                                          className={styles.searchInputText}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Bank Options */}
                                {filteredBanks.map((bank) => (
                                  <div
                                    key={bank.id}
                                    className={styles.navLink}
                                    onClick={() => {
                                      setSelectedBankId(bank.id);
                                      setFieldValue('bankId', bank.id);
                                      setShowBankDropdown(false);
                                      setBankSearchTerm('');
                                      // Reset branch selection
                                      setSelectedBranchId(null);
                                      setFieldValue('branchId', '');
                                    }}
                                  >
                                    <div className={styles.title}>
                                      <span className={styles.text}>{getBankName(bank)}</span>
                                    </div>
                                    {selectedBankId === bank.id && (
                                      <div className={styles.check}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                          <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
              </div>
            )}
                      </div>
                      <CustomErrorMessage name="bankId" errors={errors} touched={touched} />
                    </div>
                  </div>

                  {/* 3rd row */}
                  <div className={styles.thirdRow}>
                    {/* City Dropdown */}
                    <div className={styles.inputField}>
                      <label className={styles.label}>{t('bank_worker_city')}</label>
                      <div className={styles.dropdown}>
                        <div 
                          className={styles.input}
                          onClick={() => setShowCityDropdown(!showCityDropdown)}
                        >
                          <div className={styles.content}>
                            <span className={styles.selectedText}>
                              {selectedCity ? getCityName(selectedCity) : t('bank_worker_select_city')}
                            </span>
                            <div className={styles.chevronUp}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.33"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* City Dropdown Menu */}
                        {showCityDropdown && (
                          <div className={styles.dropdownMenu}>
                            <div className={styles.dropdownMenuContainer}>
                              <div className={styles.dropdownMenuContent}>
                                {/* Search */}
                                <div className={styles.searchSection}>
                                  <div className={styles.searchInputField}>
                                    <div className={styles.searchInput}>
                                      <div className={styles.searchContent}>
                                        <div className={styles.searchIcon}>
                                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
                                            <path d="m13 13-3-3" stroke="currentColor" strokeWidth="1"/>
                                          </svg>
                                        </div>
                                        <input
                                          type="text"
                                          placeholder={t('bank_worker_search_cities')}
                                          value={citySearchTerm}
                                          onChange={(e) => setCitySearchTerm(e.target.value)}
                                          className={styles.searchInputText}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* City Options */}
                                {filteredCities.map((city) => (
                                  <div
                                    key={city.id}
                                    className={styles.navLink}
                                    onClick={() => {
                                      setSelectedCityId(city.id);
                                      setFieldValue('cityId', city.id);
                                      setShowCityDropdown(false);
                                      setCitySearchTerm('');
                                    }}
                                  >
                                    <div className={styles.title}>
                                      <span className={styles.text}>{getCityName(city)}</span>
                                    </div>
                                    {selectedCityId === city.id && (
                                      <div className={styles.check}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                          <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <CustomErrorMessage name="cityId" errors={errors} touched={touched} />
                    </div>

                    {/* Bank Number Input */}
                    <div className={styles.inputField}>
                      <label className={styles.label}>{t('bank_worker_bank_number')}</label>
                      <div className={styles.input}>
                        <div className={styles.content}>
                          <Field
                            type="text"
                            name="bankNumber"
                            placeholder={t('bank_worker_bank_number_placeholder')}
                            className={styles.inputText}
                          />
                        </div>
                      </div>
                      <CustomErrorMessage name="bankNumber" errors={errors} touched={touched} />
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className={styles.checkboxContainer}>
                    <div className={styles.checkboxRow}>
                      <Field
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        className={styles.checkbox}
                      />
                      <div className={styles.labelAndHelperText}>
                        <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
                          {i18n.language === 'he' ? (
                            <>
                              אני מסכים <span className={styles.termsLink}>לכללי הפלטפורמה</span>
                            </>
                          ) : (
                            t('bank_worker_accept_terms')
                          )}
                        </label>
                      </div>
                    </div>
                    <CustomErrorMessage name="acceptTerms" errors={errors} touched={touched} />
          </div>

                  {/* Submit Button */}
                  <button type="submit" className={styles.submitButton}>
                    <span className={styles.buttonText}>{t('bank_worker_continue')}</span>
            </button>

                  {/* Line separator */}
                  <div className={styles.line}></div>

                  {/* Login Link */}
                  <div className={styles.loginLink}>
                    <span>{t('bank_worker_already_account')}</span>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

    </div>
  );
};