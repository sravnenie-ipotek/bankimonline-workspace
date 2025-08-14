### BankIM Admin Content Panel – Full Technical Report

#### 1) Purpose
- Centralized, role‑aware content management for website/app copy, menus, and UI labels across RU/HE/EN.
- Edit three content types: Text, Link/Button, Dropdown (single/multi, with options).
- Designed to mirror Confluence/Figma flows (overview page with counts, page states, action table; detail editors per action).

#### 2) How the Admin Panel fetches data
- Frontend calls REST endpoints (under /api/content/*) via `src/services/api.ts`.
- Backend reads from two core tables:
  - `content_items(id, content_key, content_type, component_type, screen_location, category, description, is_active, created_at, updated_at)`
  - `content_translations(id, content_item_id, language_code, content_value, is_default, status, created_at, updated_at)`
- Only active items with approved translations are returned.
- Caching: responses include ETag, Cache-Control (max-age), and Bankim-Content-Version; client revalidates with If-None-Match and may serve cached data briefly on network errors.

#### 3) Sections, Endpoints, and SQL examples
Below are the exact purpose of each section, the HTTP endpoints the admin panel calls, and representative SQL used by the backend to serve them. Replace <lang> with ‘ru’/‘he’/‘en’ as needed.

- Main (Overview Page 4)
  - Route: /content/main → screen_location: main_page
  - HTTP:
    - GET /api/content/main_page/<lang>  (raw screen content when needed)
    - GET /api/content/main              (pre-aggregated main overview; client calls `api.getMainPageContent()` which transforms keys like app.main.action.N.* into 12 action rows and gallery)
  - SQL (raw screen content per language):
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ct.language_code, ct.content_value, ct.status,
      ci.updated_at AS last_modified
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'main_page'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
      AND ct.language_code = '<lang>'
    ORDER BY ci.content_key;
    ```
  - Note (aggregation): The main overview endpoint groups keys of the form
    app.main.action.{N}.dropdown.{name} → actionNumber N, counts options, sets status from translation status, and builds the 12-row actions table + gallery images.

- Menu
  - Route: /content/menu → screen_location: navigation_menu
  - HTTP:
    - GET /api/content/menu                      (list summary)
    - GET /api/content/menu/translations         (optional: merged translations)
    - GET /api/content/menu/drill/:sectionId     (drill for a specific menu section)
  - SQL (list summary):
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ci.updated_at AS last_modified
    FROM content_items ci
    WHERE ci.screen_location = 'navigation_menu'
      AND ci.is_active = TRUE
    ORDER BY ci.content_key;
    ```
  - SQL (translations per language as needed):
    ```sql
    SELECT
      ci.id, ci.content_key,
      ct.language_code, ct.content_value, ct.status, ct.updated_at
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'navigation_menu'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
      AND ct.language_code = '<lang>';
    ```
  - SQL (drill by sectionId):
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location,
      ci.updated_at AS last_modified,
      jsonb_build_object(
        'ru', MAX(CASE WHEN ct.language_code='ru' THEN ct.content_value END),
        'he', MAX(CASE WHEN ct.language_code='he' THEN ct.content_value END),
        'en', MAX(CASE WHEN ct.language_code='en' THEN ct.content_value END)
      ) AS translations
    FROM content_items ci
    LEFT JOIN content_translations ct ON ct.content_item_id = ci.id AND ct.status='approved'
    WHERE ci.screen_location = :sectionId
      AND ci.is_active = TRUE
    GROUP BY ci.id, ci.content_key, ci.component_type, ci.category, ci.screen_location, ci.updated_at
    ORDER BY ci.content_key;
    ```

- Mortgage Calculation
  - Route: /content/mortgage → screen_location: mortgage_calculation
  - HTTP: GET /api/content/mortgage
  - SQL:
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ct.language_code, ct.content_value, ct.status,
      ci.updated_at AS last_modified
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'mortgage_calculation'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
    ORDER BY ci.content_key;
    ```

- Mortgage Refinancing
  - Route: /content/mortgage-refi → screen_location: mortgage_refinancing
  - HTTP: GET /api/content/mortgage-refi
  - SQL:
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ct.language_code, ct.content_value, ct.status,
      ci.updated_at AS last_modified
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'mortgage_refinancing'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
    ORDER BY ci.content_key;
    ```

- Credit Calculation
  - Route: /content/credit → screen_location: credit_calculation
  - HTTP: GET /api/content/credit
  - SQL:
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ct.language_code, ct.content_value, ct.status,
      ci.updated_at AS last_modified
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'credit_calculation'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
    ORDER BY ci.content_key;
    ```

- Credit Refinancing
  - Route: /content/credit-refi → screen_location: credit_refinancing
  - HTTP: GET /api/content/credit-refi
  - SQL:
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ct.language_code, ct.content_value, ct.status,
      ci.updated_at AS last_modified
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'credit_refinancing'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
    ORDER BY ci.content_key;
    ```

- General Pages
  - Route: /content/general → screen_location: general_pages
  - HTTP: GET /api/content/general
  - SQL:
    ```sql
    SELECT
      ci.id, ci.content_key, ci.component_type, ci.screen_location, ci.category,
      ct.language_code, ct.content_value, ct.status,
      ci.updated_at AS last_modified
    FROM content_items ci
    JOIN content_translations ct ON ct.content_item_id = ci.id
    WHERE ci.screen_location = 'general_pages'
      AND ci.is_active = TRUE
      AND ct.status = 'approved'
    ORDER BY ci.content_key;
    ```

#### 4) Editors (write/update flows)

- Update a translation (Text/Link)
  - HTTP: PUT /api/content-items/:contentItemId/translations/:language_code
  - Body: { content_value: "…" }
  - SQL:
    ```sql
    UPDATE content_translations
    SET content_value = :content_value, updated_at = NOW()
    WHERE content_item_id = :contentItemId
      AND language_code = :language_code;

    -- If missing, insert (kept approved workflow in mind)
    INSERT INTO content_translations (content_item_id, language_code, content_value, is_default, status, created_at, updated_at)
    VALUES (:contentItemId, :language_code, :content_value, FALSE, 'review', NOW(), NOW())
    ON CONFLICT (content_item_id, language_code) DO NOTHING;
    ```

- Dropdown options (CRUD)
  - Add option:
    ```sql
    INSERT INTO dropdown_options (content_item_id, option_key, order_index, is_active, created_at, updated_at)
    VALUES (:contentItemId, :optionKey, :orderIndex, TRUE, NOW(), NOW());
    ```
  - Update option label (per language):
    ```sql
    UPDATE content_translations
    SET content_value = :label, updated_at = NOW()
    WHERE content_item_id = :optionItemId AND language_code = :language_code;
    ```
  - Delete option:
    ```sql
    UPDATE dropdown_options
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = :optionId;
    ```

- Publish workflow
  - Transitions a translation from review → approved:
    ```sql
    UPDATE content_translations
    SET status = 'approved', updated_at = NOW()
    WHERE content_item_id = :contentItemId
      AND language_code = :language_code;
    ```

#### 5) What the “Content Update” does (business intent)
- Text/Link edits: change user‑facing labels/titles/placeholders and link URLs in RU/HE/EN.
- Dropdown edits: manage selectable values (CRUD), ordering, and multilingual labels, used by forms and filters.
- Publication flow ensures only approved content is exposed to the public site/app.

#### 6) Why this report
- To let BankimOnline devs validate real data returned by the admin panel against expectations, confirm screen_location mappings, and review publication/logical rules.
- With the SQL patterns above, devs can run targeted checks and answer:
  - Are all active items present for each screen?
  - Are translations approved and up to date?
  - Do dropdown options align with business specs (counts/order/labels)?

If you want, I can generate DB inspection snippets (psql or Prisma/Knex) per section and export current counts per language to share with the team.