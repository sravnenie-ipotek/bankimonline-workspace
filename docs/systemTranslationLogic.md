# 🌍 System Translation Logic
**Banking Application Translation Architecture**

## 📊 Overview

The system uses a **Database-First Translation Architecture** with multi-layer caching and JSON fallback. This ensures optimal performance, reliability, and maintainability for multi-language content management.

## 🏗️ Architecture Flow

```mermaid
graph TB
    A[Component Mount] --> B[useContentApi Hook]
    B --> C[useEffect Triggers]
    C --> D[API Call: /api/content/screen/lang]
    
    D --> E[Server-Side Cache Check]
    E --> F{Cache Hit?}
    F -->|Yes| G[Return Cached Data <1ms]
    F -->|No| H[Query Database 10-50ms]
    H --> I[Cache Result 5min TTL]
    I --> G
    
    G --> J[Load to Component State]
    J --> K[content = {...translations}]
    
    L[Translation Request] --> M[getContent key]
    M --> N{Check content cache?}
    N -->|Found| O[Return DB Translation]
    N -->|Not Found| P{Cache Empty/Error?}
    P -->|Yes| Q[t key - JSON Fallback]
    P -->|No| R[Try Key Mappings]
    R --> S{Found in Mappings?}
    S -->|Yes| O
    S -->|No| Q
    
    style K fill:#e1f5fe
    style O fill:#c8e6c9
    style Q fill:#fff3e0
```

## 🔧 How It Works

### 1. Component Initialization

When a component using translations mounts:

```typescript
// Component mounts and requests translations for its screen
const { getContent, loading, error } = useContentApi('mortgage_step1')

// This triggers:
useEffect(() => {
  const fetchContent = async () => {
    // API call to load ALL translations for this screen
    const response = await fetch(`/api/content/mortgage_step1/en`);
    const data = await response.json();
    
    // Store ALL screen translations in component state
    setContent({
      'calculate_mortgage_title': 'Calculate Your Mortgage',
      'calculate_mortgage_price': 'Property Value',
      'calculate_mortgage_city': 'City',
      // ... all other translations for this screen
    });
  }
}, [screenLocation, i18n.language]);
```

### 2. Server-Side Processing

When API endpoint `/api/content/mortgage_step1/en` is called:

```javascript
app.get('/api/content/:screen/:language', async (req, res) => {
  const cacheKey = `content_mortgage_step1_en_all`;
  
  // 1. CHECK SERVER CACHE FIRST (5-minute TTL)
  const cached = contentCache.get(cacheKey);
  if (cached) {
    console.log(`✅ Cache HIT for ${cacheKey}`);
    return res.json(cached); // Return in <1ms
  }
  
  // 2. CACHE MISS - QUERY DATABASE
  console.log(`⚡ Cache MISS for ${cacheKey} - querying database`);
  const result = await contentPool.query(`
    SELECT 
      content_items.content_key,
      content_translations.content_value
    FROM content_items
    JOIN content_translations ON content_items.id = content_translations.content_item_id
    WHERE content_items.screen_location = 'mortgage_step1' 
      AND content_translations.language_code = 'en'
      AND content_translations.status = 'approved'
  `);
  
  // 3. TRANSFORM RESULTS
  const content = {};
  result.rows.forEach(row => {
    content[row.content_key] = row.content_value;
  });
  
  // 4. CACHE FOR 5 MINUTES
  const response = { status: 'success', content };
  contentCache.set(cacheKey, response);
  
  res.json(response);
});
```

### 3. Translation Lookup

When component needs a translation:

```typescript
// Component requests a specific translation
const title = getContent('calculate_mortgage_title', 'calculate_mortgage_title');

const getContent = (key: string, fallbackKey?: string): string => {
  // 1. CHECK COMPONENT CACHE FIRST (loaded from database)
  if (content[key]) {
    return content[key]; // "Calculate Your Mortgage"
  }
  
  // 2. TRY SHORT KEY VERSION
  const shortKey = key.split('.').pop() || key;
  if (content[shortKey]) {
    return content[shortKey];
  }
  
  // 3. IMMEDIATE FALLBACK if database cache failed to load
  if (Object.keys(content).length === 0 || error || loading) {
    const translationKey = fallbackKey || key;
    return t(translationKey); // Falls back to JSON files
  }
  
  // 4. TRY KEY MAPPINGS (300+ predefined mappings)
  const mappedKeys = prefixMap[key] || [];
  for (const mappedKey of mappedKeys) {
    if (content[mappedKey]) {
      return content[mappedKey];
    }
  }
  
  // 5. FINAL FALLBACK to JSON
  return t(fallbackKey || key);
};
```

### 4. JSON Fallback System

If database/API fails, system falls back to traditional i18n:

```typescript
// i18n loads from /public/locales/en/translation.json
{
  "calculate_mortgage_title": "Calculate Your Mortgage",
  "calculate_mortgage_price": "Property Value",
  "back": "Back",
  "continue": "Continue"
}

// Fallback usage
return t('calculate_mortgage_title'); // Returns "Calculate Your Mortgage"
```

## 🚀 Performance Characteristics

### Caching Layers

```yaml
Layer 1 - Server Cache (NodeCache):
  TTL: 5 minutes (300 seconds)
  Check Interval: 60 seconds
  Key Format: content_{screen}_{language}_{type}
  Performance: <1ms for cache hits

Layer 2 - Component Cache (React State):
  Scope: Per component instance
  Lifetime: Component lifecycle
  Loading: Once per screen/language combination
  Performance: <1ms for all lookups

Layer 3 - JSON Fallback (i18next):
  Source: /public/locales/{lang}/translation.json
  Performance: 1-5ms
  Reliability: Always available
```

### Response Times

```yaml
Best Case (Server Cache Hit): <1ms
Good Case (Component Cache): <1ms  
Cache Miss (Database Query): 10-50ms
Fallback Only (JSON): 1-5ms
Worst Case (Network + DB): 50-100ms
```

## ❓ Database-First vs API-First Explanation

### **Database-First** (Current Architecture)
```typescript
// Database-First: Load ALL screen translations at once
const { getContent } = useContentApi('mortgage_step1')
// ↓ Single API call loads ALL translations for the screen
// ↓ Stores in component cache: { title: "...", price: "...", city: "..." }
// ↓ All subsequent getContent() calls use cached data

const title = getContent('title')     // From cache - <1ms
const price = getContent('price')     // From cache - <1ms  
const city = getContent('city')       // From cache - <1ms
```

### **API-First** (Alternative Architecture - NOT used)
```typescript
// API-First: Individual API call per translation
const title = await apiTranslate('title')     // API call - 10-50ms
const price = await apiTranslate('price')     // API call - 10-50ms
const city = await apiTranslate('city')       // API call - 10-50ms
// ↑ Multiple network requests, slower, more server load
```

### Why Database-First is Better

1. **Performance**: 1 API call vs N API calls
2. **Network Efficiency**: Batch loading vs individual requests
3. **User Experience**: Instant translations after initial load
4. **Server Load**: Fewer API requests, better caching
5. **Reliability**: All translations loaded together or fail together

## 🎯 Screen-Based Organization

### Screen Locations
```typescript
const screenLocations = [
  'home_page',           // Homepage content
  'mortgage_step1',      // Property and loan details
  'mortgage_step2',      // Personal information
  'mortgage_step3',      // Income and employment
  'mortgage_step4',      // Bank offers and results
  'sidebar',             // Navigation menu
  'personal_cabinet',    // User dashboard
  'sms_verification',    // Authentication flows
  'bank_offers',         // Bank comparison cards
  'common'               // Shared UI elements
];
```

### Database Schema
```sql
-- Content items define what can be translated
CREATE TABLE content_items (
  id SERIAL PRIMARY KEY,
  content_key VARCHAR UNIQUE,        -- 'app.mortgage.form.title'
  screen_location VARCHAR,           -- 'mortgage_step1'
  component_type VARCHAR,            -- 'text', 'button', 'dropdown_option'
  is_active BOOLEAN DEFAULT true
);

-- Translations provide language-specific content
CREATE TABLE content_translations (
  id SERIAL PRIMARY KEY,
  content_item_id INTEGER REFERENCES content_items(id),
  language_code VARCHAR(5),          -- 'en', 'he', 'ru'
  content_value TEXT,                -- Actual translation
  status VARCHAR DEFAULT 'approved'  -- Translation status
);
```

## 🔄 Language Switching

When user changes language:

```typescript
// Language change triggers re-fetch
useEffect(() => {
  fetchContent(); // New API call for new language
}, [screenLocation, i18n.language]);

// Example: English → Hebrew
// Old: /api/content/mortgage_step1/en
// New: /api/content/mortgage_step1/he
// Result: Component cache updates with Hebrew translations
```

## 🛡️ Error Handling & Fallbacks

### Error Scenarios

```typescript
// Scenario 1: Database unavailable
// API call fails → content stays empty → getContent() uses t() → JSON files

// Scenario 2: Translation key missing in database
// getContent('missing_key') → not in content cache → t('missing_key') → JSON files

// Scenario 3: Network timeout
// API call times out → error state → immediate fallback to t() → JSON files

// Scenario 4: Invalid API response
// API returns malformed data → content stays empty → t() fallback → JSON files
```

### Fallback Priority

```typescript
const getContent = (key) => {
  // Priority 1: Database content (from component cache)
  if (content[key]) return content[key];
  
  // Priority 2: Key variations and mappings
  if (content[shortKey]) return content[shortKey];
  
  // Priority 3: JSON fallback (always available)
  return t(key);
};
```

## 🎨 Usage Patterns

### Pattern 1: Simple Components (JSON Only)
```typescript
const TextPage = () => {
  const { t } = useTranslation()
  return <button>{t('back')}</button> // Direct JSON lookup
}
```

### Pattern 2: Business Components (Database-First)
```typescript
const MortgageStep1 = () => {
  const { getContent } = useContentApi('mortgage_step1')
  return <h1>{getContent('title', 'title')}</h1> // Database with JSON fallback
}
```

### Pattern 3: Mixed Components (Both)
```typescript
const ComplexForm = () => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('mortgage_step1')
  
  return (
    <div>
      <h1>{getContent('form_title', 'form_title')}</h1> {/* Business content from DB */}
      <button>{t('back')}</button>                      {/* UI element from JSON */}
    </div>
  )
}
```

## 📈 Key Benefits

### 1. Performance Optimized
- **Single Load**: All screen translations loaded once
- **Instant Access**: Cached lookups are <1ms
- **Reduced Requests**: Fewer API calls to server

### 2. Highly Reliable
- **Automatic Fallback**: JSON files ensure app never breaks
- **Graceful Degradation**: Database issues don't crash UI
- **Error Recovery**: Clear error handling at each level

### 3. Developer Friendly
- **Simple API**: `getContent('key', 'fallback')` pattern
- **Transparent Caching**: Developers don't manage cache manually
- **Debug Support**: Console logging shows cache hits/misses

### 4. Content Management
- **Database Managed**: Update translations without code changes
- **Version Control**: Track translation changes in database
- **Multi-Language**: Support for English, Hebrew (RTL), Russian

## 🔧 Technical Implementation

### Server Cache Configuration
```javascript
// NodeCache setup with 5-minute TTL
const contentCache = new NodeCache({ 
  stdTTL: 300,        // 5 minutes
  checkperiod: 60,    // Check for expired keys every 60 seconds
  useClones: false    // Better performance for JSON objects
});
```

### API Endpoint Pattern
```javascript
app.get('/api/content/:screen/:language', async (req, res) => {
  const { screen, language } = req.params;
  const cacheKey = `content_${screen}_${language}_all`;
  
  // Cache-first approach
  const cached = contentCache.get(cacheKey);
  if (cached) return res.json(cached);
  
  // Database query on cache miss
  const result = await contentPool.query(sql, [screen, language]);
  
  // Cache and return result
  const response = transformDbResult(result);
  contentCache.set(cacheKey, response);
  res.json(response);
});
```

### Component Hook Usage
```typescript
export const useContentApi = (screenLocation: string) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${screenLocation}/${language}`);
        const data = await response.json();
        setContent(transformApiResponse(data));
      } catch (err) {
        setError(err.message);
        setContent({}); // Empty content triggers fallback
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [screenLocation, i18n.language]);

  return { content, loading, error, getContent };
};
```

## 📊 System Metrics

### Current Usage Statistics
```yaml
Total Translation Usages: 689
Files Using Translations: 273
Components Using Database: 75
Screen Locations: 20+
Supported Languages: 3 (en, he, ru)
Key Mappings: 300+
Cache TTL: 5 minutes
Average Response Time: <1ms (cached), 10-50ms (uncached)
```

### Database Schema Stats
```yaml
content_items Table: ~500 rows
content_translations Table: ~1500 rows (500 items × 3 languages)
Index Performance: Optimized for screen_location + language_code
Storage Size: ~2MB for all translations
Query Performance: 10-50ms for screen load
```

This architecture provides optimal performance through smart caching while maintaining reliability through comprehensive fallback systems. The database-first approach enables dynamic content management without requiring code deployments for translation updates.