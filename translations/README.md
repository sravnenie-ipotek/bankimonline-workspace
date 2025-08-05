# 🌐 TRANSLATIONS - SINGLE SOURCE OF TRUTH

This directory contains the **master translation files** for the Bankimonline application.

## 📁 FILE STRUCTURE

```
translations/
├── en.json     ← Master English translations (243 keys)
├── he.json     ← Master Hebrew translations (385 keys) 
├── ru.json     ← Master Russian translations (176 keys)
└── README.md   ← This file
```

## ✅ HOW TO UPDATE TRANSLATIONS

### 🎯 SIMPLE PROCESS (Only edit these files!)

1. **Edit the master files** in this directory:
   - `en.json` - English translations
   - `he.json` - Hebrew translations  
   - `ru.json` - Russian translations

2. **Run the sync script** to copy to all locations:
   ```bash
   node scripts/sync-translations.js
   ```

3. **Done!** All locations are now updated automatically.

## 🚫 WHAT NOT TO DO

- ❌ **Don't edit** files in `locales/`, `mainapp/public/locales/`, or `public/locales/`
- ❌ **Don't edit** multiple files for the same change
- ❌ **Don't forget** to run the sync script after changes

## 🔧 SYNC SCRIPT FEATURES

The sync script (`scripts/sync-translations.js`) automatically:

- ✅ **Copies** from single source to all required locations
- ✅ **Validates** translations (checks for missing keys)
- ✅ **Creates** directories if they don't exist
- ✅ **Reports** success/failure for each operation
- ✅ **Shows warnings** for missing translation keys

## 📊 CURRENT STATUS

| Language | Keys | Completeness |
|----------|------|--------------|
| English  | 243  | 100% (base) |
| Hebrew   | 385  | 100% ✅ |
| Russian  | 176  | 72% ⚠️ (105 missing keys) |

### 🔍 Missing Russian Keys (Top 5):
- `not_found_greeting`
- `fallback_greeting` 
- `not_found_back_home`
- `name_required`
- `name_letters_only`
- ... and 100 more

## 🚀 BENEFITS OF THIS SYSTEM

### ✅ BEFORE (Old System)
- 5+ duplicate files to maintain
- Inconsistent content (139 vs 276 keys)
- Manual sync required
- Easy to forget locations
- Sync issues and conflicts

### 🎉 AFTER (New System) 
- **1 file per language** to edit
- **Automatic sync** to all locations
- **Consistent content** everywhere
- **Validation** built-in
- **No more sync issues**

## 🛠️ TECHNICAL DETAILS

### Target Locations (Auto-synced)
The sync script copies translations to:
- `./locales/[lang]/translation.json`
- `./mainapp/public/locales/[lang]/translation.json`
- `./public/locales/[lang]/translation.json`

### Integration
- **React App**: Uses `/locales/` path via i18next-http-backend
- **Static HTML**: Uses relative paths via i18n.js
- **Build Process**: Can be integrated into build scripts

## 📝 USAGE EXAMPLES

### Adding a New Translation Key

1. **Add to master file** (`translations/en.json`):
   ```json
   {
     "new_feature_title": "Amazing New Feature"
   }
   ```

2. **Add to other languages** (`translations/he.json`, `translations/ru.json`):
   ```json
   {
     "new_feature_title": "תכונה חדשה מדהימה"
   }
   ```

3. **Sync to all locations**:
   ```bash
   node scripts/sync-translations.js
   ```

### Checking Translation Status
```bash
# Run sync script to see validation report
node scripts/sync-translations.js
```

## 🔄 AUTOMATION OPTIONS

### Option 1: Manual Sync (Current)
Run `node scripts/sync-translations.js` after each change.

### Option 2: Build Integration (Future)
Add to `package.json` scripts:
```json
{
  "scripts": {
    "sync-translations": "node scripts/sync-translations.js",
    "build": "npm run sync-translations && vite build"
  }
}
```

### Option 3: Watch Mode (Future)
Automatically sync when files change using `chokidar` or similar.

---

**🎯 REMEMBER: Only edit files in `/translations/` directory, then run the sync script!** 