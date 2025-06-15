-- Migration: Add admin columns to clients table
-- Date: 2025-06-12
-- Purpose: Enable admin user management in existing clients table

-- Add role column (default: customer)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';

-- Add is_staff flag (default: false)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE;

-- Add admin metadata columns
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_role ON clients(role);
CREATE INDEX IF NOT EXISTS idx_clients_is_staff ON clients(is_staff);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Insert initial admin user (test@test as requested) - only if not exists
INSERT INTO clients (
    first_name, 
    last_name, 
    email, 
    phone, 
    role, 
    is_staff,
    created_at,
    updated_at
) 
SELECT 
    'Admin',
    'User', 
    'test@test',
    '+972501234567',
    'admin',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM clients WHERE email = 'test@test'
);

-- Update all existing clients to be customers
UPDATE clients 
SET role = 'customer', is_staff = FALSE 
WHERE role IS NULL OR role = '';

-- Add constraints
ALTER TABLE clients 
ADD CONSTRAINT check_role CHECK (role IN ('customer', 'admin', 'manager', 'support'));

COMMENT ON COLUMN clients.role IS 'User role: customer, admin, manager, support';
COMMENT ON COLUMN clients.is_staff IS 'True for staff members (admin access)';
COMMENT ON COLUMN clients.last_login IS 'Timestamp of last login for audit';