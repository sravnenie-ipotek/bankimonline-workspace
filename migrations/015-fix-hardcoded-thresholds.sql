-- Migration: Fix Hardcoded Credit Score, LTV, and DTI Thresholds
-- Date: 2025-01-22
-- Purpose: Add missing threshold standards to eliminate hardcoded business logic

-- Add missing credit score thresholds for business logic
INSERT INTO banking_standards (business_path, standard_category, standard_name, standard_value, value_type, description, min_value, max_value) VALUES
-- Credit Score Warning Thresholds
('mortgage', 'credit_score', 'warning_credit_score', 700.00, 'score', 'Credit score below this triggers higher interest rate warning', 650.00, 750.00),
('credit', 'credit_score', 'warning_credit_score', 700.00, 'score', 'Credit score below this triggers higher interest rate warning', 650.00, 750.00),
('mortgage_refinance', 'credit_score', 'warning_credit_score', 700.00, 'score', 'Credit score below this triggers higher interest rate warning', 650.00, 750.00),
('credit_refinance', 'credit_score', 'warning_credit_score', 700.00, 'score', 'Credit score below this triggers higher interest rate warning', 650.00, 750.00),

-- Credit Score Poor Thresholds  
('mortgage', 'credit_score', 'poor_credit_score', 680.00, 'score', 'Credit score below this considered poor credit', 620.00, 700.00),
('credit', 'credit_score', 'poor_credit_score', 680.00, 'score', 'Credit score below this considered poor credit', 620.00, 700.00),
('mortgage_refinance', 'credit_score', 'poor_credit_score', 670.00, 'score', 'Credit score below this considered poor credit', 620.00, 700.00),
('credit_refinance', 'credit_score', 'poor_credit_score', 680.00, 'score', 'Credit score below this considered poor credit', 620.00, 700.00),

-- Credit Score Premium Rate Thresholds
('mortgage', 'credit_score', 'premium_credit_score', 750.00, 'score', 'Credit score for premium rate tiers', 720.00, 800.00),
('credit', 'credit_score', 'premium_credit_score', 750.00, 'score', 'Credit score for premium rate tiers', 720.00, 800.00),
('mortgage_refinance', 'credit_score', 'premium_credit_score', 750.00, 'score', 'Credit score for premium rate tiers', 720.00, 800.00),
('credit_refinance', 'credit_score', 'premium_credit_score', 750.00, 'score', 'Credit score for premium rate tiers', 720.00, 800.00)

ON CONFLICT (business_path, standard_category, standard_name) DO UPDATE SET
standard_value = EXCLUDED.standard_value,
description = EXCLUDED.description,
updated_at = NOW();

-- Add missing LTV thresholds
INSERT INTO banking_standards (business_path, standard_category, standard_name, standard_value, value_type, description, min_value, max_value) VALUES
-- LTV Premium Rate Thresholds
('mortgage', 'ltv', 'premium_ltv_max', 70.00, 'percentage', 'LTV threshold for premium rates', 60.00, 80.00),
('mortgage_refinance', 'ltv', 'premium_ltv_max', 70.00, 'percentage', 'LTV threshold for premium rates', 60.00, 80.00)

ON CONFLICT (business_path, standard_category, standard_name) DO UPDATE SET
standard_value = EXCLUDED.standard_value,
description = EXCLUDED.description,
updated_at = NOW();

-- Add missing DTI thresholds
INSERT INTO banking_standards (business_path, standard_category, standard_name, standard_value, value_type, description, min_value, max_value) VALUES
-- DTI Warning Thresholds
('mortgage', 'dti', 'warning_dti_max', 35.00, 'percentage', 'DTI above this triggers warnings', 28.00, 42.00),
('credit', 'dti', 'warning_dti_max', 35.00, 'percentage', 'DTI above this triggers warnings', 28.00, 42.00),
('mortgage_refinance', 'dti', 'warning_dti_max', 35.00, 'percentage', 'DTI above this triggers warnings', 28.00, 42.00),
('credit_refinance', 'dti', 'warning_dti_max', 35.00, 'percentage', 'DTI above this triggers warnings', 28.00, 42.00),

-- DTI Premium Rate Thresholds
('mortgage', 'dti', 'premium_dti_max', 30.00, 'percentage', 'DTI threshold for premium rates', 25.00, 35.00),
('credit', 'dti', 'premium_dti_max', 30.00, 'percentage', 'DTI threshold for premium rates', 25.00, 35.00),
('mortgage_refinance', 'dti', 'premium_dti_max', 30.00, 'percentage', 'DTI threshold for premium rates', 25.00, 35.00),
('credit_refinance', 'dti', 'premium_dti_max', 30.00, 'percentage', 'DTI threshold for premium rates', 25.00, 35.00)

ON CONFLICT (business_path, standard_category, standard_name) DO UPDATE SET
standard_value = EXCLUDED.standard_value,
description = EXCLUDED.description,
updated_at = NOW();

-- Add quick assessment rate thresholds  
INSERT INTO banking_standards (business_path, standard_category, standard_name, standard_value, value_type, description, min_value, max_value) VALUES
-- Quick Assessment Rate Tiers
('mortgage', 'rates', 'quick_excellent_rate', 3.5, 'percentage', 'Rate for excellent credit in quick assessment', 3.0, 4.0),
('mortgage', 'rates', 'quick_good_rate', 4.0, 'percentage', 'Rate for good credit in quick assessment', 3.5, 4.5),
('mortgage', 'rates', 'quick_fair_rate', 4.5, 'percentage', 'Rate for fair credit in quick assessment', 4.0, 5.0),

('credit', 'rates', 'quick_excellent_rate', 7.5, 'percentage', 'Rate for excellent credit in quick assessment', 6.0, 8.0),
('credit', 'rates', 'quick_good_rate', 8.5, 'percentage', 'Rate for good credit in quick assessment', 7.0, 9.0),
('credit', 'rates', 'quick_fair_rate', 10.0, 'percentage', 'Rate for fair credit in quick assessment', 8.0, 12.0)

ON CONFLICT (business_path, standard_category, standard_name) DO UPDATE SET
standard_value = EXCLUDED.standard_value,
description = EXCLUDED.description,
updated_at = NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_banking_standards_lookup ON banking_standards(business_path, standard_category, standard_name) WHERE is_active = true; 