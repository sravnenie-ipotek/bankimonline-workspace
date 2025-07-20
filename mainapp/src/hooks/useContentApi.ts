import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ContentItem {
  value: string;
  component_type: string;
  category: string;
  language: string;
  status: string;
}

interface ContentResponse {
  status: string;
  screen_location: string;
  language_code: string;
  content_count: number;
  content: Record<string, ContentItem>;
}

/**
 * Custom hook for fetching content from the content management API
 * with fallback to existing translation system
 */
export const useContentApi = (screenLocation: string) => {
  const { i18n, t } = useTranslation();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const language = i18n.language || 'en';
        // Use relative URL to work with proxy in development
        const apiUrl = `/api/content/${screenLocation}/${language}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ContentResponse = await response.json();
        
        if (data.status === 'success' && data.content) {
          // Transform API response to key-value pairs
          const transformedContent: Record<string, string> = {};
          
          Object.entries(data.content).forEach(([key, item]) => {
            // Extract the final part of the content key (e.g., 'calculate_mortgage' from 'app.home.service.calculate_mortgage')
            const shortKey = key.split('.').pop() || key;
            transformedContent[shortKey] = item.value;
            
            // Also store with full key for more specific lookups
            transformedContent[key] = item.value;
          });
          
          setContent(transformedContent);
        } else {
          throw new Error('Invalid API response format');
        }
        
      } catch (err) {
        console.warn(`Content API error for ${screenLocation}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback: use empty content, let translation system handle it
        setContent({});
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [screenLocation, i18n.language]);

  /**
   * Get content with fallback to translation system
   */
  const getContent = (key: string, fallbackKey?: string): string => {
    // Try to get from API content first (exact match)
    if (content[key]) {
      return content[key];
    }
    
    // Try short key version (from transformedContent[shortKey])
    const shortKey = key.split('.').pop() || key;
    if (content[shortKey]) {
      return content[shortKey];
    }
    
    // Try with specific prefixes based on the key
    const prefixMap: Record<string, string[]> = {
      // Home page content
      'calculate_mortgage': ['app.home.service.calculate_mortgage'],
      'refinance_mortgage': ['app.home.service.refinance_mortgage'],
      'calculate_credit': ['app.home.service.calculate_credit'],
      'refinance_credit': ['app.home.service.refinance_credit'],
      'title_compare': ['app.home.header.title_compare', 'app.home.header.TITLE_COMPARE'],
      'TITLE_COMPARE': ['app.home.header.TITLE_COMPARE', 'app.home.header.title_compare'],
      'compare_in_5minutes': ['app.home.text.compare_in_5minutes', 'app.home.text.compare_in_5mins'],
      'show_offers': ['app.home.button.show_offers'],
      'fill_form': ['app.home.button.fill_form'],
      'how_it_works': ['app.home.text.how_it_works'],
      'mortgage_calculator': ['app.home.text.mortgage_calculator'],
      'fill_form_text': ['app.home.text.fill_form_description'],
      'mortgage_calculator_text': ['app.home.text.calculator_description'],
      'calculator_description': ['app.home.text.calculator_description'],
      'fill_form_description': ['app.home.text.fill_form_description'],
      
      // Mortgage calculation page content
      'mobile_step_1': ['mobile_step_1_fixed', 'app.mortgage.step.mobile_step_1_fixed', 'app.mortgage.step.mobile_step_1'],
      'mobile_step_2': ['mobile_step_2_fixed', 'app.mortgage.step.mobile_step_2_fixed', 'app.mortgage.step.mobile_step_2'],
      'mobile_step_3': ['app.mortgage.step.mobile_step_3'],
      'mobile_step_4': ['app.mortgage.step.mobile_step_4'],
      'video_calculate_mortgage_title': ['video_calculate_mortgage_title_fixed', 'app.mortgage.header.video_calculate_mortgage_title_fixed', 'app.mortgage.header.video_calculate_mortgage_title'],
      'calculate_mortgage_title': ['calculate_mortgage_title_fixed', 'app.mortgage.form.calculate_mortgage_title_fixed', 'app.mortgage.form.calculate_mortgage_title'],
      'calculate_mortgage_price': ['app.mortgage.form.calculate_mortgage_price'],
      'calculate_mortgage_city': ['app.mortgage.form.calculate_mortgage_city'],
      'calculate_mortgage_when': ['app.mortgage.form.calculate_mortgage_when'],
      'calculate_mortgage_when_options_ph': ['app.mortgage.form.calculate_mortgage_when_options_ph'],
      'calculate_mortgage_when_options_1': ['app.mortgage.form.calculate_mortgage_when_options_1'],
      'calculate_mortgage_when_options_2': ['app.mortgage.form.calculate_mortgage_when_options_2'],
      'calculate_mortgage_when_options_3': ['app.mortgage.form.calculate_mortgage_when_options_3'],
      'calculate_mortgage_when_options_4': ['app.mortgage.form.calculate_mortgage_when_options_4'],
      'calculate_mortgage_initial_fee': ['app.mortgage.form.calculate_mortgage_initial_fee'],
      'calculate_mortgage_type': ['app.mortgage.form.calculate_mortgage_type'],
      'calculate_mortgage_type_ph': ['app.mortgage.form.calculate_mortgage_type_ph'],
      'calculate_mortgage_type_options_1': ['app.mortgage.form.calculate_mortgage_type_options_1'],
      'calculate_mortgage_type_options_2': ['app.mortgage.form.calculate_mortgage_type_options_2'],
      'calculate_mortgage_type_options_3': ['app.mortgage.form.calculate_mortgage_type_options_3'],
      'calculate_mortgage_type_options_4': ['app.mortgage.form.calculate_mortgage_type_options_4'],
      'calculate_mortgage_first': ['app.mortgage.form.calculate_mortgage_first'],
      'calculate_mortgage_first_ph': ['app.mortgage.form.calculate_mortgage_first_ph'],
      'calculate_mortgage_first_options_1': ['app.mortgage.form.calculate_mortgage_first_options_1'],
      'calculate_mortgage_first_options_2': ['app.mortgage.form.calculate_mortgage_first_options_2'],
      'calculate_mortgage_first_options_3': ['app.mortgage.form.calculate_mortgage_first_options_3'],
      'calculate_mortgage_property_ownership': ['app.mortgage.form.calculate_mortgage_property_ownership'],
      'calculate_mortgage_property_ownership_ph': ['app.mortgage.form.calculate_mortgage_property_ownership_ph'],
      'calculate_mortgage_property_ownership_option_1': ['app.mortgage.form.calculate_mortgage_property_ownership_option_1'],
      'calculate_mortgage_property_ownership_option_2': ['app.mortgage.form.calculate_mortgage_property_ownership_option_2'],
      'calculate_mortgage_property_ownership_option_3': ['app.mortgage.form.calculate_mortgage_property_ownership_option_3'],
      'calculate_mortgage_period': ['app.mortgage.form.calculate_mortgage_period'],
      'calculate_mortgage_period_units_min': ['app.mortgage.form.calculate_mortgage_period_units_min'],
      'calculate_mortgage_period_units_max': ['app.mortgage.form.calculate_mortgage_period_units_max'],
      'calculate_mortgage_initial_payment': ['app.mortgage.form.calculate_mortgage_initial_payment'],
      
      // Mortgage Step 2 content mappings
      'calculate_mortgage_step2_title': ['app.mortgage.step2.title'],
      'third_persons': ['app.mortgage.step2.privacy_notice'],
      'calculate_mortgage_name_surname': ['app.mortgage.step2.name_surname'],
      'calculate_mortgage_name_surname_ph': ['app.mortgage.step2.name_surname_ph'],
      'calculate_mortgage_birth_date': ['app.mortgage.step2.birth_date'],
      'calculate_mortgage_education': ['app.mortgage.step2.education'],
      'calculate_mortgage_education_ph': ['app.mortgage.step2.education_ph'],
      'calculate_mortgage_education_option_1': ['app.mortgage.step2.education_option_1'],
      'calculate_mortgage_education_option_2': ['app.mortgage.step2.education_option_2'],
      'calculate_mortgage_education_option_3': ['app.mortgage.step2.education_option_3'],
      'calculate_mortgage_education_option_4': ['app.mortgage.step2.education_option_4'],
      'calculate_mortgage_education_option_5': ['app.mortgage.step2.education_option_5'],
      'calculate_mortgage_education_option_6': ['app.mortgage.step2.education_option_6'],
      'calculate_mortgage_education_option_7': ['app.mortgage.step2.education_option_7'],
      'calculate_mortgage_citizenship': ['app.mortgage.step2.citizenship'],
      'calculate_mortgage_citizenship_title': ['app.mortgage.step2.citizenship_title'],
      'calculate_mortgage_citizenship_ph': ['app.mortgage.step2.citizenship_ph'],
      'calculate_mortgage_tax': ['app.mortgage.step2.tax_obligations'],
      'plat': ['app.mortgage.step2.tax_tooltip'],
      'calculate_mortgage_children18': ['app.mortgage.step2.children_under_18'],
      'calculate_mortgage_how_much_childrens': ['app.mortgage.step2.children_count'],
      'calculate_mortgage_is_medinsurance': ['app.mortgage.step2.medical_insurance'],
      'calculate_mortgage_is_foreigner': ['app.mortgage.step2.foreign_resident'],
      'mest': ['app.mortgage.step2.foreign_resident_tooltip'],
      'calculate_mortgage_is_public': ['app.mortgage.step2.public_person'],
      'pub': ['app.mortgage.step2.public_person_tooltip'],
      'calculate_mortgage_borrowers': ['app.mortgage.step2.borrowers_count'],
      'place_borrowers': ['app.mortgage.step2.borrowers_placeholder'],
      'calculate_mortgage_family_status': ['app.mortgage.step2.family_status'],
      'calculate_mortgage_family_status_ph': ['app.mortgage.step2.family_status_ph'],
      'calculate_mortgage_family_status_option_1': ['app.mortgage.step2.family_status_option_1'],
      'calculate_mortgage_family_status_option_2': ['app.mortgage.step2.family_status_option_2'],
      'calculate_mortgage_family_status_option_3': ['app.mortgage.step2.family_status_option_3'],
      'calculate_mortgage_family_status_option_4': ['app.mortgage.step2.family_status_option_4'],
      'calculate_mortgage_family_status_option_5': ['app.mortgage.step2.family_status_option_5'],
      'calculate_mortgage_family_status_option_6': ['app.mortgage.step2.family_status_option_6'],
      'calculate_mortgage_partner_pay_mortgage': ['app.mortgage.step2.partner_mortgage_participation'],
      'calculate_mortgage_add_partner_title': ['app.mortgage.step2.add_partner_title'],
      'calculate_mortgage_add_partner': ['app.mortgage.step2.add_partner'],
      'search': ['app.mortgage.step2.search'],
      'nothing_found': ['app.mortgage.step2.nothing_found'],
      'countries': ['app.mortgage.step2.countries'],
      
      // Mortgage Step 3 content mappings
      'calculate_mortgage_step3_title': ['app.mortgage.step3.title'],
      'calculate_mortgage_main_source': ['app.mortgage.step3.main_source_income'],
      'calculate_mortgage_main_source_ph': ['app.mortgage.step3.main_source_income_ph'],
      'calculate_mortgage_main_source_option_1': ['app.mortgage.step3.main_source_income_option_1'],
      'calculate_mortgage_main_source_option_2': ['app.mortgage.step3.main_source_income_option_2'],
      'calculate_mortgage_main_source_option_3': ['app.mortgage.step3.main_source_income_option_3'],
      'calculate_mortgage_main_source_option_4': ['app.mortgage.step3.main_source_income_option_4'],
      'calculate_mortgage_main_source_option_5': ['app.mortgage.step3.main_source_income_option_5'],
      'calculate_mortgage_main_source_option_6': ['app.mortgage.step3.main_source_income_option_6'],
      'calculate_mortgage_main_source_option_7': ['app.mortgage.step3.main_source_income_option_7'],
      'calculate_mortgage_has_additional': ['app.mortgage.step3.additional_income'],
      'calculate_mortgage_has_additional_ph': ['app.mortgage.step3.additional_income_ph'],
      'calculate_mortgage_has_additional_option_1': ['app.mortgage.step3.additional_income_option_1'],
      'calculate_mortgage_has_additional_option_2': ['app.mortgage.step3.additional_income_option_2'],
      'calculate_mortgage_has_additional_option_3': ['app.mortgage.step3.additional_income_option_3'],
      'calculate_mortgage_has_additional_option_4': ['app.mortgage.step3.additional_income_option_4'],
      'calculate_mortgage_has_additional_option_5': ['app.mortgage.step3.additional_income_option_5'],
      'calculate_mortgage_has_additional_option_6': ['app.mortgage.step3.additional_income_option_6'],
      'calculate_mortgage_has_additional_option_7': ['app.mortgage.step3.additional_income_option_7'],
      'calculate_mortgage_debt_types': ['app.mortgage.step3.obligations'],
      'calculate_mortgage_debt_types_ph': ['app.mortgage.step3.obligations_ph'],
      'calculate_mortgage_debt_types_option_1': ['app.mortgage.step3.obligations_option_1'],
      'calculate_mortgage_debt_types_option_2': ['app.mortgage.step3.obligations_option_2'],
      'calculate_mortgage_debt_types_option_3': ['app.mortgage.step3.obligations_option_3'],
      'calculate_mortgage_debt_types_option_4': ['app.mortgage.step3.obligations_option_4'],
      'calculate_mortgage_debt_types_option_5': ['app.mortgage.step3.obligations_option_5'],
      'calculate_mortgage_monthly_income': ['app.mortgage.step3.monthly_income'],
      'calculate_mortgage_monthly_income_ph': ['app.mortgage.step3.monthly_income_ph'],
      'calculate_mortgage_monthly_income_hint': ['app.mortgage.step3.monthly_income_hint'],
      'calculate_mortgage_sfere': ['app.mortgage.step3.field_activity'],
      'calculate_mortgage_company': ['app.mortgage.step3.company_name'],
      'calculate_mortgage_profession': ['app.mortgage.step3.profession'],
      'calculate_mortgage_profession_ph': ['app.mortgage.step3.profession_ph'],
      'calculate_mortgage_start_date': ['app.mortgage.step3.start_date'],
      'borrower': ['app.mortgage.step3.borrower'],
      'add_borrower': ['app.mortgage.step3.add_borrower'],
      'add_place_to_work': ['app.mortgage.step3.add_workplace'],
      'add_additional_source_of_income': ['app.mortgage.step3.add_additional_income'],
      'add_obligation': ['app.mortgage.step3.add_obligation'],
      'source_of_income': ['app.mortgage.step3.source_of_income'],
      'additional_source_of_income': ['app.mortgage.step3.additional_source_of_income'],
      'obligation': ['app.mortgage.step3.obligation'],
      
      // Other Borrowers content mappings
      'personal_data_borrowers_title': ['app.other_borrowers.step1.title'],
      'who_are_you_for_borrowers': ['app.other_borrowers.step1.who_are_you_label'],
      'who_are_you_for_borrowers_ph': ['app.other_borrowers.step1.who_are_you_ph'],
      'calculate_mortgage_anketa': ['app.other_borrowers.step1.progress_label'],
      'calculate_mortgage_income': ['app.other_borrowers.step2.progress_label'],
      'borrowers_income': ['app.other_borrowers.step2.income_title'],
      
      // Mortgage Step 4 content mappings
      'calculate_mortgage_final': ['app.mortgage.step4.title'],
      'calculate_mortgage_warning': ['app.mortgage.step4.warning'],
      'calculate_mortgage_parameters': ['app.mortgage.step4.parameters_title'],
      'calculate_mortgage_profile_title': ['app.mortgage.step4.profile_title'],
      'calculate_mortgage_filter_title': ['app.mortgage.step4.filter_title'],
      'calculate_mortgage_parameters_initial': ['app.mortgage.step4.parameters_initial'],
      'calculate_mortgage_parameters_cost': ['app.mortgage.step4.parameters_cost'],
      'calculate_mortgage_parameters_period': ['app.mortgage.step4.parameters_period'],
      'calculate_mortgage_parameters_months': ['app.mortgage.step4.parameters_months'],
      'calculate_mortgage_filter_1': ['app.mortgage.step4.filter_option_1'],
      'calculate_mortgage_filter_2': ['app.mortgage.step4.filter_option_2'],
      'calculate_mortgage_filter_3': ['app.mortgage.step4.filter_option_3'],
      'calculate_mortgage_filter_4': ['app.mortgage.step4.filter_option_4'],
      'mortgage_total': ['app.mortgage.step4.mortgage_total'],
      'mortgage_total_return': ['app.mortgage.step4.mortgage_total_return'],
      'mortgage_monthly': ['app.mortgage.step4.mortgage_monthly'],
      'mortgage_select_bank': ['app.mortgage.step4.mortgage_select_bank'],
      
      // Refinance Mortgage Step 1 content mappings
      'sidebar_sub_refinance_mortgage': ['app.refinance.step1.title'],
      'refinance_mortgage_promo_text': ['app.refinance.step1.subtitle'],
      'mortgage_refinance_why': ['app.refinance.step1.why_label'],
      'mortgage_refinance_left': ['app.refinance.step1.balance_label'],
      'mortgage_refinance_price': ['app.refinance.step1.property_value_label'],
      'mortgage_refinance_type': ['app.refinance.step1.property_type_label'],
      'mortgage_refinance_bank': ['app.refinance.step1.current_bank_label'],
      'mortgage_refinance_registered': ['app.refinance.step1.registered_label'],
      'start_date_mortgage_title': ['app.refinance.step1.start_date_label'],
      'enter_mortgage_info': ['app.refinance.step1.mortgage_details_title'],
      'refinance_mortgage_period': ['app.refinance.step1.desired_period_label'],
      'refinance_mortgage_monthly_payment': ['app.refinance.step1.monthly_payment_label'],
      'programm': ['app.refinance.step1.program_header'],
      'balance': ['app.refinance.step1.balance_header'],
      'end_date': ['app.refinance.step1.end_date_header'],
      'bid': ['app.refinance.step1.interest_rate_header'],
      'add_programm': ['app.refinance.step1.add_program_button'],
      'mortgage_refinance_why_option_1': ['app.refinance.step1.why_option_1'],
      'mortgage_refinance_why_option_2': ['app.refinance.step1.why_option_2'],
      'mortgage_refinance_why_option_3': ['app.refinance.step1.why_option_3'],
      'mortgage_refinance_why_option_4': ['app.refinance.step1.why_option_4'],
      'mortgage_refinance_why_option_5': ['app.refinance.step1.why_option_5'],
      'mortgage_refinance_reg_option_1': ['app.refinance.step1.registered_option_1'],
      'mortgage_refinance_reg_option_2': ['app.refinance.step1.registered_option_2'],
      'program_refinance_mortgage_option_1': ['app.refinance.step1.program_option_1'],
      'program_refinance_mortgage_option_2': ['app.refinance.step1.program_option_2'],
      'program_refinance_mortgage_option_3': ['app.refinance.step1.program_option_3'],
      'program_refinance_mortgage_option_4': ['app.refinance.step1.program_option_4'],
      'program_refinance_mortgage_option_5': ['app.refinance.step1.program_option_5'],
      'calculate_mortgage_type_options_5': ['app.refinance.step1.property_option_5'],
      'bank_hapoalim': ['app.refinance.step1.bank_hapoalim'],
      'bank_leumi': ['app.refinance.step1.bank_leumi'],
      'bank_discount': ['app.refinance.step1.bank_discount'],
      'bank_massad': ['app.refinance.step1.bank_massad'],
      
      // SMS Verification Modal mappings
      'sms_modal_title': ['enter_phone_number_login'],
      'sms_modal_subtitle': ['confirm_phone_number_login'],
      'sms_modal_name_placeholder': ['name_placeholder'],
      'sms_modal_phone_placeholder': ['phone_placeholder'],
      'sms_modal_continue_button': ['continue'],
      'sms_modal_agreement_start': ['agreement_text_start'],
      'sms_modal_user_agreement': ['user_agreement'],
      'sms_modal_and_text': ['and'],
      'sms_modal_privacy_policy': ['privacy_policy'],
      'sms_modal_already_client': ['already_client'],
      'sms_modal_login_here': ['login_here'],
      'sms_modal_close': ['close'],
      
      // SMS Code Verification Modal mappings
      'sms_code_modal_title': ['accept_you_profile_for_registration'],
      'sms_code_modal_subtitle': ['sms_phone'],
      'sms_code_not_received': ['not_received_sms'],
      'sms_code_send_again': ['send_sms_code_again'],
      'sms_code_verify_button': ['accept_phone']
    };
    
    // Try specific mappings first
    const mappedKeys = prefixMap[key] || [];
    for (const mappedKey of mappedKeys) {
      if (content[mappedKey]) {
        console.log(`✅ Found content for key: ${key} using mapping: ${mappedKey} -> "${content[mappedKey]}"`);
        return content[mappedKey];
      }
    }
    
    // Try with general prefixes
    const alternativeKeys = [
      `app.home.service.${key}`,
      `app.home.button.${key}`,
      `app.home.header.${key}`,
      `app.home.text.${key}`,
      `app.home.navigation.${key}`,
      `app.mortgage.step.${key}`,
      `app.mortgage.form.${key}`,
      `app.mortgage.header.${key}`,
      `app.mortgage.error.${key}`
    ];
    
    for (const altKey of alternativeKeys) {
      if (content[altKey]) {
        console.log(`✅ Found content for key: ${key} using alternative: ${altKey} -> "${content[altKey]}"`);
        return content[altKey];
      }
    }
    
    // Debug logging
    console.log(`❌ Content lookup failed for key: ${key}`);
    console.log(`Available keys:`, Object.keys(content));
    console.log(`Tried mappings:`, mappedKeys);
    
    // Fallback to translation system
    const translationKey = fallbackKey || key;
    const translatedValue = t(translationKey);
    
    // If translation returns the key itself, it means translation not found
    if (translatedValue === translationKey) {
      console.warn(`No content found for key: ${key}, fallback: ${fallbackKey}`);
      return key; // Return the key as last resort
    }
    
    return translatedValue;
  };

  return {
    content,
    loading,
    error,
    getContent
  };
};

export default useContentApi;