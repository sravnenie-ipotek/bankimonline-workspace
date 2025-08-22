
// Field mapping utility for API response to frontend format
export const mapApiFieldsToFrontend = (apiData) => {
    // Map property_ownership to propertyOwnership
    if (apiData.property_ownership !== undefined) {
        apiData.propertyOwnership = apiData.property_ownership;
        delete apiData.property_ownership;
    }
    
    // Map other common mismatches
    const fieldMappings = {
        'family_status': 'familyStatus',
        'field_of_activity': 'fieldOfActivity',
        'main_income_source': 'mainIncomeSource',
        'additional_income': 'additionalIncome',
        'monthly_income': 'monthlyIncome',
        'credit_score': 'creditScore'
    };
    
    Object.entries(fieldMappings).forEach(([apiField, frontendField]) => {
        if (apiData[apiField] !== undefined) {
            apiData[frontendField] = apiData[apiField];
            delete apiData[apiField];
        }
    });
    
    return apiData;
};
