# 🎛️ Dropdown System Feature Flag Guide

## Overview

The dropdown system now supports both JSONB and traditional implementations with a feature flag to switch between them.

## Feature Flag Configuration

### Environment Variable

```bash
# Enable JSONB dropdowns (default in production)
export USE_JSONB_DROPDOWNS=true

# Use traditional dropdowns (default in development)
export USE_JSONB_DROPDOWNS=false
```

### Automatic Behavior

- **Production Environment**: `NODE_ENV=production` automatically enables JSONB dropdowns
- **Development Environment**: Defaults to traditional dropdowns unless explicitly enabled

## Testing Different Systems

### Test JSONB System (Development)
```bash
# Set environment variable
export USE_JSONB_DROPDOWNS=true

# Start development server
npm run dev

# Test API endpoint
curl http://localhost:8003/api/dropdowns/mortgage_step1/en
```

### Test Traditional System (Development)
```bash
# Set environment variable  
export USE_JSONB_DROPDOWNS=false

# Start development server
npm run dev

# Test API endpoint
curl http://localhost:8003/api/dropdowns/mortgage_step1/en
```

### Check Current System Status
```bash
# Feature flag status endpoint
curl http://localhost:8003/api/feature-flags/dropdown-system
```

Response:
```json
{
  "status": "success",
  "feature_flags": {
    "USE_JSONB_DROPDOWNS": true,
    "current_system": "JSONB",
    "environment": "development",
    "migration_complete": true
  },
  "performance_info": {
    "jsonb_queries": 1,
    "traditional_queries": 1,
    "expected_improvement": "87%"
  }
}
```

## System Comparison

### JSONB System
- **Database**: Uses `dropdown_configs` table with JSONB columns
- **Queries**: Single optimized query per request
- **Performance**: 87% improvement (1141ms → 152ms)
- **Cache Key**: `dropdowns_jsonb_{screen}_{language}`
- **Indicators**: `jsonb_source: true` in response

### Traditional System  
- **Database**: Uses `content_items` + `content_translations` tables
- **Queries**: JOIN queries between multiple tables
- **Performance**: Baseline performance
- **Cache Key**: `dropdowns_traditional_{screen}_{language}`
- **Indicators**: `jsonb_source: false` in response

## API Response Format

Both systems return identical response formats for compatibility:

```json
{
  "status": "success",
  "screen_location": "mortgage_step1",
  "language_code": "en",
  "dropdowns": [...],
  "options": {...},
  "placeholders": {...},
  "labels": {...},
  "cached": false,
  "jsonb_source": true,
  "performance": {
    "query_count": 1,
    "source": "dropdown_configs"
  }
}
```

## Implementation Details

### Feature Flag Logic
- Environment variable: `USE_JSONB_DROPDOWNS`
- Production override: `NODE_ENV=production` forces JSONB
- Function routing: `handleJsonbDropdowns()` vs `handleTraditionalDropdowns()`

### Database Requirements
- **JSONB**: Requires `dropdown_configs` table in Railway content database
- **Traditional**: Requires `content_items` and `content_translations` tables
- **Migration**: 771 dropdowns migrated from 2560 content items

### Caching Strategy
- Separate cache keys for each system
- 5-minute TTL for both systems
- Cache invalidation independent per system

## Rollback Strategy

### Emergency Rollback to Traditional System
```bash
# Set environment variable
export USE_JSONB_DROPDOWNS=false

# Restart application
npm run dev
```

### Database Rollback
- Original `content_items` and `content_translations` tables preserved
- No data loss during migration
- Instant rollback capability

## Performance Monitoring

### Log Indicators
- JSONB: `🚀 Using JSONB dropdowns for {screen}/{language}`
- Traditional: `🔄 Using traditional dropdowns for {screen}/{language}`
- Cache hits show system type in logs

### Performance Metrics
- Monitor response times via application logs
- Compare cache hit rates between systems  
- Track database query performance

## Deployment Checklist

### Before Switching to JSONB
- [ ] Verify migration completed (771 dropdowns)
- [ ] Test feature flag endpoint
- [ ] Validate sample dropdown responses
- [ ] Check cache performance
- [ ] Verify fallback to traditional works

### Production Deployment
- [ ] Environment automatically uses JSONB (`NODE_ENV=production`)
- [ ] Monitor application logs for system indicators
- [ ] Validate performance improvements
- [ ] Keep traditional system available for rollback