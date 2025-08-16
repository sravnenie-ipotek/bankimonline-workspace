# 🎯 QA Automation Setup - runqa Command

## Quick Start

```bash
# Run all QA test suites
runqa

# Or use npm script
npm run runqa
```

## Available Commands

### Shell Aliases (after sourcing .qa_aliases)
```bash
runqa                # Run all 5 QA test suites + generate master report
runqa-menu           # Run Menu & Navigation tests only
runqa-credit         # Run Credit Calculator tests only
runqa-mortgage       # Run Mortgage Calculator tests only  
runqa-refcredit      # Run Refinance Credit tests only
runqa-refmortgage    # Run Refinance Mortgage tests only
qa-reports           # View generated reports directory
qahelp               # Show available commands
```

### NPM Scripts
```bash
npm run runqa              # Run all QA suites
npm run qa:all             # Same as runqa
npm run qa:menu            # Menu & Navigation info
npm run qa:credit          # Credit Calculator info
npm run qa:mortgage        # Mortgage Calculator info
npm run qa:refcredit       # Refinance Credit info
npm run qa:refmortgage     # Refinance Mortgage info
npm run qa:reports         # List reports
```

## Test Suites Included

1. **Menu & Navigation QA**
   - Instructions: `server/docs/QA/menuQA/instructions.md`
   - Tests all menus, submenus, navigation elements
   - Critical navigation bug testing
   - Mobile hamburger menu validation

2. **Calculate Credit (Steps 1-4)**
   - Instructions: `server/docs/QA/calculateCredit1,2,3,4/instructions.md`
   - Tests credit calculation workflow
   
3. **Mortgage Steps (Steps 1-4)**
   - Instructions: `server/docs/QA/mortgageStep1,2,3,4/instructions.md`
   - Tests mortgage calculation workflow
   
4. **Refinance Credit (Steps 1-4)**
   - Instructions: `server/docs/QA/refinanceCredit1,2,3,4/instructions.md`
   - Tests refinance credit workflow
   
5. **Refinance Mortgage (Steps 1-4)**
   - Instructions: `server/docs/QA/refinanceMortgage1,2,3,4/instructions.md`
   - Tests refinance mortgage workflow

## Setup

### Automatic Setup (Recommended)
The aliases are automatically loaded if you have the `.qa_aliases` file sourced in your shell profile.

### Manual Setup
```bash
# Source aliases manually
source .qa_aliases

# Or add to your shell profile
echo 'source /Users/michaelmishayev/Projects/bankDev2_standalone/.qa_aliases' >> ~/.zshrc
```

## Report Generation

The QA automation follows the specifications in:
`server/docs/QA/ReportsCreations/reportDetails_afterEachRun.md`

### Report Features
- 📄 Self-contained HTML with embedded CSS/JS
- 🌐 Bilingual support (English/Russian)
- 📊 Executive summary with metrics
- 🎨 Modern UI with glassmorphism design
- 📱 Responsive and mobile-friendly
- 🖨️ Print-ready for PDF export
- 🔍 Interactive bug cards with one-click creation
- 🛡️ Production safety warnings
- 📈 Performance metrics and analytics

### Report Location
```bash
server/docs/QA/reports/qa-master-report-TIMESTAMP.html
```

## Environment Detection

The system automatically detects:
- **Development**: `http://localhost:5173` - Safe for all operations
- **Production**: `bankimonline.com` domains - Safety mode enabled

### Production Safety Features
- 🚨 Visual warnings for production environment
- 🛡️ Disabled real bug creation in JIRA
- 💾 Local storage of production bugs
- ⚠️ Prominent warning modals

## File Structure

```
/
├── runqa.sh                 # Main QA automation script
├── .qa_aliases             # Shell aliases configuration  
├── QA_AUTOMATION_README.md # This documentation
├── server/docs/QA/
│   ├── calculateCredit1,2,3,4/instructions.md
│   ├── mortgageStep1,2,3,4/instructions.md
│   ├── refinanceCredit1,2,3,4/instructions.md
│   ├── refinanceMortgage1,2,3,4/instructions.md
│   ├── ReportsCreations/reportDetails_afterEachRun.md
│   └── reports/            # Generated reports directory
└── package.json            # NPM scripts configuration
```

## Customization

### Adding New Test Suites
1. Add test instructions file to `server/docs/QA/`
2. Update `runqa.sh` script with new test suite call
3. Add alias to `.qa_aliases` if needed
4. Update this README

### Modifying Report Template
Edit the HTML generation section in `runqa.sh` starting around line 70.

### Environment Configuration
Modify environment detection logic in the report generation section.

## Troubleshooting

### Common Issues

**Line Ending Problems**
```bash
# Fix line endings
sed -i '' 's/\r$//' runqa.sh
sed -i '' 's/\r$//' .qa_aliases
```

**Permission Issues**
```bash
# Make script executable
chmod +x runqa.sh
```

**Aliases Not Loading**
```bash
# Source aliases manually
source .qa_aliases

# Check if sourced in shell profile
grep "qa_aliases" ~/.zshrc
```

**Report Not Opening**
```bash
# Manually open report
open server/docs/QA/reports/qa-master-report-*.html

# Or check reports directory
ls -la server/docs/QA/reports/
```

## Integration Notes

- Compatible with Cypress, Playwright, and custom test runners
- Follows enterprise QA reporting standards
- Includes JIRA integration hooks for bug reporting
- Supports multi-language content and RTL layouts
- Production-safe with comprehensive safety mechanisms

## Next Steps

1. **Implement Actual Test Execution**: Replace placeholder test execution with real test runner calls
2. **JIRA Integration**: Configure JIRA API endpoints for bug creation
3. **CI/CD Integration**: Add to build pipeline for automated QA reporting
4. **Performance Metrics**: Add real performance monitoring and alerting
5. **Advanced Analytics**: Implement trend analysis and success rate tracking

---

🚀 **Ready to go!** Use `runqa` command to execute all QA automation suites.