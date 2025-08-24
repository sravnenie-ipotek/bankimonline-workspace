# 🔍 Hebrew Translation Analyzer Guide

## ✅ **What It Does**

The Hebrew Translation Analyzer checks your Hebrew translations in the content database and compares them with Azure Translator API suggestions. It **does NOT update the database** - it only creates comparison reports.

## 🎯 **Key Features**

- ✅ **Database Analysis**: Checks Hebrew translations with English references
- ✅ **Azure Comparison**: Compares with Azure Translator API suggestions
- ✅ **Similarity Scoring**: Calculates how similar your translations are to Azure's
- ✅ **Quality Assessment**: Rates translations as Identical/Very Similar/Similar/Different/Very Different
- ✅ **Smart Recommendations**: Suggests whether to keep current or use Azure
- ✅ **Multiple Reports**: Generates JSON, CSV, and HTML comparison tables
- ✅ **Word Analysis**: Analyzes specific words/phrases you want to check

## 🚀 **How to Use**

### **1. Analyze Database Translations**

```bash
# Analyze 20 translations (default)
node scripts/hebrew-translation-analyzer.js analyze

# Analyze specific number of translations
node scripts/hebrew-translation-analyzer.js analyze 50
```

### **2. Analyze Specific Words/Phrases**

```bash
# Analyze banking terms
node scripts/hebrew-translation-analyzer.js words "Property Ownership" "Monthly Payment" "Interest Rate"

# Analyze any words you want
node scripts/hebrew-translation-analyzer.js words "Hello World" "Bank Account" "Credit Card"
```

## 📊 **Analysis Results Explained**

### **Similarity Levels**
- **100% (Identical)**: Your translation matches Azure exactly
- **80-99% (Very Similar)**: Minor differences, keep your version
- **60-79% (Similar)**: Some differences, consider Azure suggestion
- **40-59% (Different)**: Significant differences, review Azure
- **0-39% (Very Different)**: Major differences, use Azure suggestion

### **Recommendations**
- **Keep Current**: Your translation is good
- **Consider Azure**: Think about using Azure's suggestion
- **Review Azure**: Look at Azure's suggestion carefully
- **Use Azure**: Azure's suggestion is better

## 📁 **Generated Files**

### **1. JSON Report** (`hebrew-analysis-report-TIMESTAMP.json`)
```json
{
  "total": 5,
  "identical": 1,
  "very_similar": 2,
  "similar": 1,
  "different": 0,
  "very_different": 1,
  "recommendations": {
    "keep_current": 3,
    "consider_azure": 1,
    "use_azure": 1
  },
  "details": [
    {
      "content_key": "about_title",
      "english_text": "About us",
      "current_hebrew": "אודותינו",
      "azure_suggestion": "עלינו",
      "similarity": 38,
      "analysis": "very_different",
      "recommendation": "use_azure"
    }
  ]
}
```

### **2. CSV Table** (`hebrew-comparison-table-TIMESTAMP.csv`)
Spreadsheet format with columns:
- Content Key
- Screen Location
- English Text
- Current Hebrew
- Azure Suggestion
- Similarity %
- Analysis
- Recommendation
- Issues

### **3. HTML Table** (`hebrew-comparison-table-TIMESTAMP.html`)
Beautiful web table with:
- Color-coded rows (green=good, yellow=review, red=change)
- RTL Hebrew text display
- Sortable columns
- Professional styling

### **4. Word Analysis** (`word-analysis-TIMESTAMP.json`)
```json
[
  {
    "english": "Property Ownership",
    "azure_hebrew": "בעלות על נכס",
    "confidence": 1
  }
]
```

## 🔍 **Example Analysis Results**

### **✅ Good Translation (Keep Current)**
```
📖 English: How does it work?
📝 Current Hebrew: איך זה עובד?
🤖 Azure Suggestion: איך זה עובד?
📊 Similarity: 100%
🎯 Analysis: IDENTICAL
💡 Recommendation: KEEP CURRENT
```

### **⚠️ Needs Review (Consider Azure)**
```
📖 English: Our platform connects to all major banks...
📝 Current Hebrew: הפלטפורמה שלנו מתחברת לכל הבנקים הגדולים...
🤖 Azure Suggestion: הפלטפורמה שלנו מתחברת לכל הבנקים הגדולים...
📊 Similarity: 79%
🎯 Analysis: SIMILAR
💡 Recommendation: CONSIDER AZURE
```

### **🔄 Should Change (Use Azure)**
```
📖 English: About us
📝 Current Hebrew: אודותינו
🤖 Azure Suggestion: עלינו
📊 Similarity: 38%
🎯 Analysis: VERY_DIFFERENT
💡 Recommendation: USE AZURE
```

## 🎯 **Quality Score Calculation**

The analyzer calculates an overall quality score:
```
Quality Score = (Identical + Very Similar) / Total × 100
```

**Example**: 3 out of 5 translations are good = 60% quality score

## 🔧 **Advanced Usage**

### **Analyze Specific Categories**
```bash
# The analyzer automatically groups by screen_location
# Check specific screens by filtering the CSV/HTML output
```

### **Batch Analysis**
```bash
# Analyze different sets
node scripts/hebrew-translation-analyzer.js analyze 10
node scripts/hebrew-translation-analyzer.js analyze 20
node scripts/hebrew-translation-analyzer.js analyze 50
```

### **Word-Specific Analysis**
```bash
# Banking terms
node scripts/hebrew-translation-analyzer.js words "Mortgage" "Loan" "Interest" "Payment"

# UI terms
node scripts/hebrew-translation-analyzer.js words "Submit" "Cancel" "Continue" "Back"

# Business terms
node scripts/hebrew-translation-analyzer.js words "Account" "Balance" "Transaction" "Statement"
```

## 📈 **Interpreting Results**

### **High Quality (80-100%)**
- Most translations are identical or very similar
- Your Hebrew translations are excellent
- Keep current translations

### **Medium Quality (60-79%)**
- Some translations need review
- Consider Azure suggestions for different ones
- Overall good but room for improvement

### **Low Quality (0-59%)**
- Many translations differ significantly
- Review Azure suggestions carefully
- Consider updating translations

## 🛡️ **Safety Features**

- ✅ **Read-Only**: Never updates your database
- ✅ **Backup**: All original data preserved
- ✅ **Rate Limiting**: Respects Azure API limits
- ✅ **Error Handling**: Continues even if some translations fail
- ✅ **Detailed Logging**: Shows exactly what's happening

## 🚨 **Common Issues & Solutions**

### **"No Hebrew translations found"**
- Check if Hebrew translations exist in database
- Verify database connection
- Ensure translations have 'approved' status

### **"Azure API error"**
- Check Azure API key in `.env` file
- Verify internet connection
- Check Azure service status

### **"Rate limit exceeded"**
- Wait a few minutes between runs
- Reduce the number of translations analyzed
- Azure has rate limits for API calls

## 📚 **Best Practices**

### **1. Start Small**
```bash
# Start with 10-20 translations
node scripts/hebrew-translation-analyzer.js analyze 10
```

### **2. Review Results Carefully**
- Don't blindly accept all Azure suggestions
- Consider context and tone
- Some differences might be intentional

### **3. Focus on Low Similarity Items**
- Prioritize translations with <60% similarity
- These are most likely to need updates

### **4. Use Word Analysis for New Terms**
```bash
# Check new terms before adding to database
node scripts/hebrew-translation-analyzer.js words "New Banking Term"
```

## 🎉 **Summary**

The Hebrew Translation Analyzer gives you:
- **Comprehensive analysis** of your Hebrew translations
- **Professional suggestions** from Azure Translator API
- **Detailed comparison tables** in multiple formats
- **Quality scoring** to track improvement
- **Safe operation** that never modifies your database

**Perfect for**: Quality assurance, translation review, and ensuring professional Hebrew translations in your banking application!
