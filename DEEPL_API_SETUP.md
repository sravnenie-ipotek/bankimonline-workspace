# 🚀 DeepL API Setup Guide for Hebrew Translation Validation

## 📋 **Overview**

This guide helps you set up DeepL API to validate Hebrew translations in your banking application's database. DeepL provides superior translation quality and is perfect for validating your Hebrew content.

## 🎯 **Why DeepL API?**

Based on the DeepL Pro features:
- ✅ **Unmatched translation quality** - Best Hebrew translation accuracy
- ✅ **Maximum data security** - Critical for banking content
- ✅ **Text and file translation** - Perfect for database validation
- ✅ **Increased productivity** - Automates translation workflows

## 🔑 **Step 1: Get DeepL API Key**

### **Free Tier (Recommended to start)**
1. Go to [DeepL Pro Plans](https://www.deepl.com/en/pro/change-plan#developer)
2. Click "Select a plan" 
3. Choose the **Free plan**
4. Sign up and verify your email
5. Go to your account → API → Get API key

### **Pro Tier (For production)**
- Higher limits and better performance
- Pay-per-use pricing
- Advanced features

## ⚙️ **Step 2: Environment Setup**

### **Add to your environment variables:**

```bash
# Add this to your .env file or environment
DEEPL_API_KEY=your_deepl_api_key_here
```

### **For CI/CD (GitHub Actions):**
```yaml
# Add to your GitHub repository secrets
DEEPL_API_KEY: your_deepl_api_key_here
```

## 📦 **Step 3: Install Dependencies**

```bash
# Install required packages
npm install axios pg dotenv
```

## 🧪 **Step 4: Test the Setup**

```bash
# Test DeepL API connection
node scripts/deepl-translation-validator.js test
```

## 🚀 **Step 5: Run Hebrew Translation Validation**

### **Basic Validation (20 translations)**
```bash
node scripts/deepl-translation-validator.js validate
```

### **Extended Validation (50 translations)**
```bash
node scripts/deepl-translation-validator.js validate 50
```

### **Get Improvement Suggestions**
```bash
node scripts/deepl-translation-validator.js improve 0.7
```

## 📊 **API Endpoints**

### **Free API (Recommended)**
- **URL**: `https://api-free.deepl.com/v2/translate`
- **Limits**: 500,000 characters/month
- **Perfect for**: Testing and validation

### **Pro API (Production)**
- **URL**: `https://api.deepl.com/v2/translate`
- **Limits**: Higher limits, better performance
- **Perfect for**: Production workflows

## 🔧 **API Usage Examples**

### **Basic Translation**
```javascript
const response = await axios.post('https://api-free.deepl.com/v2/translate', {
  text: ['Hello world'],
  source_lang: 'EN',
  target_lang: 'HE'
}, {
  headers: {
    'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

### **Hebrew to English (Back-translation)**
```javascript
const response = await axios.post('https://api-free.deepl.com/v2/translate', {
  text: ['שלום עולם'],
  source_lang: 'HE',
  target_lang: 'EN'
}, {
  headers: {
    'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

## 📈 **Validation Features**

The script provides:

1. **Quality Assessment** - Rates translations as Excellent/Good/Fair/Poor
2. **Similarity Scoring** - Compares original vs back-translation
3. **Issue Detection** - Identifies common Hebrew translation problems
4. **Improvement Suggestions** - Provides DeepL's recommended translations
5. **Detailed Reports** - Saves comprehensive validation reports

## 🎯 **Supported Languages**

- **Source Languages**: EN (English), HE (Hebrew), RU (Russian)
- **Target Languages**: EN (English), HE (Hebrew), RU (Russian)
- **Auto-detection**: DeepL can detect source language automatically

## 💰 **Cost Considerations**

### **Free Tier**
- 500,000 characters/month
- Perfect for validation and testing
- No credit card required

### **Pro Tier**
- Pay-per-use pricing
- Higher limits
- Better performance
- Advanced features

## 🔒 **Security & Privacy**

- **Data Protection**: DeepL deletes your texts immediately after translation
- **SSL Encryption**: All API calls are encrypted
- **No Data Storage**: DeepL doesn't store your content
- **GDPR Compliant**: Meets European data protection standards

## 🚨 **Rate Limiting**

- **Free API**: 1 request per second recommended
- **Pro API**: Higher limits available
- **Best Practice**: Add 1-second delays between requests

## 📝 **Example Output**

```
🔍 Starting Hebrew translation validation...

✅ DeepL API connection successful
📚 Fetching Hebrew translations from database (limit: 20)...
✅ Found 20 Hebrew translations

🔍 Validating: calculate_mortgage_property_ownership
📍 Screen: mortgage_step1
📝 Hebrew: בעלות על נכס
📖 English: Property Ownership
✅ Quality: EXCELLENT (95% similarity)
🔄 Back-translation: Property ownership

📈 VALIDATION SUMMARY
Total translations checked: 20
✅ Excellent quality: 15
👍 Good quality: 3
⚠️  Fair quality: 1
❌ Poor quality: 1
🚫 Errors: 0

🎯 Overall quality score: 90%
```

## 🔧 **Troubleshooting**

### **API Key Issues**
```bash
# Check if API key is set
echo $DEEPL_API_KEY

# Test connection
node scripts/deepl-translation-validator.js test
```

### **Database Connection Issues**
```bash
# Verify database connection
node test-railway-simple.js
```

### **Rate Limiting**
- Add delays between requests
- Use the `improve` command for batch processing
- Consider upgrading to Pro tier for higher limits

## 📚 **Next Steps**

1. **Get your API key** from DeepL
2. **Add it to your environment**
3. **Test the connection**
4. **Run validation on your Hebrew translations**
5. **Review and implement improvements**

## 🆘 **Support**

- **DeepL API Documentation**: [https://www.deepl.com/en/docs-api](https://www.deepl.com/en/docs-api)
- **DeepL Support**: [https://www.deepl.com/en/help](https://www.deepl.com/en/help)
- **Script Issues**: Check the validation script logs for detailed error messages
