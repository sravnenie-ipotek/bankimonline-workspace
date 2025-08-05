-- Migration: Add Application Contexts for Multi-Panel Content Management
-- Description: Create application_contexts table and add app_context_id to content_items
-- Risk Level: LOW - Adding new table and optional column with default values

-- Step 1: Create application_contexts table
CREATE TABLE IF NOT EXISTS application_contexts (
    id SERIAL PRIMARY KEY,
    context_code VARCHAR(50) UNIQUE NOT NULL,
    context_name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert the 4 application contexts (use INSERT OR IGNORE pattern)
INSERT INTO application_contexts (context_code, context_name, description, display_order) 
SELECT 'public', 'Public Website', 'Pre-registration content for anonymous users (До регистрации)', 1
WHERE NOT EXISTS (SELECT 1 FROM application_contexts WHERE context_code = 'public');

INSERT INTO application_contexts (context_code, context_name, description, display_order) 
SELECT 'user_portal', 'User Dashboard', 'Personal cabinet for authenticated users (Личный кабинет)', 2
WHERE NOT EXISTS (SELECT 1 FROM application_contexts WHERE context_code = 'user_portal');

INSERT INTO application_contexts (context_code, context_name, description, display_order) 
SELECT 'cms', 'Content Management', 'Admin panel for website content management (Админ панель для сайтов)', 3
WHERE NOT EXISTS (SELECT 1 FROM application_contexts WHERE context_code = 'cms');

INSERT INTO application_contexts (context_code, context_name, description, display_order) 
SELECT 'bank_ops', 'Banking Operations', 'Admin panel for bank employee workflows (Админ панель для банков)', 4
WHERE NOT EXISTS (SELECT 1 FROM application_contexts WHERE context_code = 'bank_ops');

-- Step 3: Add app_context_id column to content_items (check if exists first)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_items' 
        AND column_name = 'app_context_id'
    ) THEN
        ALTER TABLE content_items ADD COLUMN app_context_id INTEGER DEFAULT 1;
    END IF;
END $$;

-- Step 4: Update existing data to use 'public' context
UPDATE content_items 
SET app_context_id = (
    SELECT id FROM application_contexts 
    WHERE context_code = 'public'
)
WHERE app_context_id IS NULL OR app_context_id = 1;

-- Step 5: Add index for performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_content_items_app_context'
    ) THEN
        CREATE INDEX idx_content_items_app_context ON content_items(app_context_id);
    END IF;
END $$;

-- Step 6: Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_content_items_app_context'
        AND table_name = 'content_items'
    ) THEN
        ALTER TABLE content_items 
        ADD CONSTRAINT fk_content_items_app_context 
        FOREIGN KEY (app_context_id) REFERENCES application_contexts(id);
    END IF;
END $$;

-- Step 7: Make app_context_id NOT NULL (only if no NULL values exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM content_items WHERE app_context_id IS NULL) THEN
        ALTER TABLE content_items ALTER COLUMN app_context_id SET NOT NULL;
    END IF;
END $$;

-- Step 8: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_application_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trigger_application_contexts_updated_at ON application_contexts;
CREATE TRIGGER trigger_application_contexts_updated_at
    BEFORE UPDATE ON application_contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_application_contexts_updated_at();

-- Step 10: Verification queries
SELECT 
    'Application Contexts Created' as status,
    COUNT(*) as total_contexts
FROM application_contexts;

SELECT 
    'Content Items with Context' as status,
    COUNT(*) as total_items,
    COUNT(app_context_id) as items_with_context
FROM content_items;

-- Show content distribution by context
SELECT 
    ac.context_name,
    ac.context_code,
    COUNT(ci.id) as content_count
FROM application_contexts ac
LEFT JOIN content_items ci ON ac.id = ci.app_context_id
GROUP BY ac.id, ac.context_name, ac.context_code
ORDER BY ac.display_order; 