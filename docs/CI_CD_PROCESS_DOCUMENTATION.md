# 🚀 CI/CD Process Documentation - BankimOnline Platform

## Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Pipeline Stages](#pipeline-stages)
4. [Deployment Workflow](#deployment-workflow)
5. [Testing Strategy](#testing-strategy)
6. [Monitoring & Rollback](#monitoring--rollback)
7. [Security & Compliance](#security--compliance)

---

## 📋 Overview

Our CI/CD pipeline automates the entire software delivery process from code commit to production deployment, ensuring quality, security, and reliability at every stage.

### Key Metrics
- **Deployment Frequency**: 3-5 times per week
- **Lead Time**: ~45 minutes from commit to production
- **Change Failure Rate**: <5%
- **Mean Time to Recovery**: <30 minutes

---

## 🏗️ Architecture Diagram

```ascii
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD PIPELINE ARCHITECTURE                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

     Developer Workstation                    Version Control                    CI Server
    ┌──────────────────┐                   ┌──────────────────┐            ┌──────────────────┐
    │                  │                   │                  │            │                  │
    │  Local Dev Env   │   git push       │     GitHub       │  webhook   │  GitHub Actions  │
    │   - Node.js      │ ───────────────> │   - main branch  │ ────────> │   - Runners      │
    │   - React        │                   │   - dev branch   │            │   - Workflows    │
    │   - PostgreSQL   │                   │   - PRs          │            │                  │
    └──────────────────┘                   └──────────────────┘            └────────┬─────────┘
                                                     │                                │
                                                     │                                ▼
    ┌──────────────────────────────────────────────────────────────────────────────────────────┐
    │                                    CI PIPELINE STAGES                                     │
    ├────────────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                            │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
    │  │  Build   │→ │  Lint    │→ │  Test    │→ │ Security │→ │  Docker  │→ │  Deploy  │   │
    │  │  Stage   │  │  Stage   │  │  Stage   │  │  Scan    │  │  Build   │  │  Stage   │   │
    │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
    │       │             │             │             │              │              │          │
    │       ▼             ▼             ▼             ▼              ▼              ▼          │
    │   npm install   ESLint      Jest/Cypress   Snyk/OWASP    Docker build    Railway       │
    │   npm build     Prettier    Playwright     Dependency     Push to        Deploy        │
    │                 TypeScript  Coverage       Scanner        Registry                      │
    │                                                                                          │
    └──────────────────────────────────────────────────────────────────────────────────────┘

                                              ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────────┐
    │                                  DEPLOYMENT ENVIRONMENTS                                 │
    ├─────────────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                           │
    │   Development              Staging                Production               Monitoring     │
    │  ┌──────────┐          ┌──────────┐           ┌──────────┐           ┌──────────┐      │
    │  │   DEV    │  auto    │ STAGING  │  manual   │   PROD   │  alerts   │ DataDog  │      │
    │  │ Railway  │ ──────> │ Railway  │ ───────> │ Railway  │ <────────> │ Sentry   │      │
    │  │ dev.*.com│          │ stg.*.com│           │ *.com    │           │ Uptime   │      │
    │  └──────────┘          └──────────┘           └──────────┘           └──────────┘      │
    │                                                                                           │
    └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Pipeline Stages

### Stage 1: Source Control & Trigger
```yaml
Trigger Events:
  - Push to main/dev branches
  - Pull Request opened/updated
  - Manual workflow dispatch
  - Scheduled (nightly builds)
```

**Example GitHub Actions Workflow:**
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
```

### Stage 2: Build & Compile
```ascii
┌──────────────────────────────────────────┐
│            BUILD PROCESS                  │
├──────────────────────────────────────────┤
│                                          │
│  1. Install Dependencies                 │
│     └─> npm ci (15s)                    │
│                                          │
│  2. TypeScript Compilation               │
│     └─> tsc --noEmit (20s)             │
│                                          │
│  3. Frontend Build                       │
│     └─> npm run build:frontend (90s)    │
│     └─> Vite optimization               │
│     └─> Asset bundling                  │
│                                          │
│  4. Backend Build                        │
│     └─> npm run build:backend (10s)     │
│                                          │
│  5. Generate Build Artifacts             │
│     └─> dist/ folder (5MB)              │
│     └─> build manifest                  │
│                                          │
└──────────────────────────────────────────┘
```

**Build Script Example:**
```bash
#!/bin/bash
# build.sh

echo "🔨 Starting build process..."

# Clean previous builds
rm -rf dist/ build/

# Install dependencies
npm ci --production=false

# Run TypeScript compiler
npx tsc --noEmit

# Build frontend
cd mainapp
npm run build
cd ..

# Copy build artifacts
mkdir -p dist
cp -r mainapp/build dist/frontend
cp -r server dist/backend

echo "✅ Build completed successfully"
```

### Stage 3: Quality Assurance
```ascii
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                    ╱╲                                        │
│                   ╱  ╲      E2E Tests (5%)                  │
│                  ╱    ╲     - Playwright                    │
│                 ╱──────╲    - Critical paths                │
│                ╱        ╲   - 10-15 min                     │
│               ╱          ╲                                  │
│              ╱────────────╲  Integration Tests (25%)        │
│             ╱              ╲ - API testing                  │
│            ╱                ╲- Database queries             │
│           ╱──────────────────╲- 5-7 min                     │
│          ╱                    ╲                             │
│         ╱──────────────────────╲ Unit Tests (70%)           │
│        ╱                        ╲- Component tests          │
│       ╱                          ╲- Utility functions       │
│      ╱────────────────────────────╲- 2-3 min               │
│     └──────────────────────────────┘                        │
│                                                               │
│     Coverage Requirements:                                   │
│     • Line Coverage: ≥80%                                   │
│     • Branch Coverage: ≥75%                                 │
│     • Function Coverage: ≥85%                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Test Execution Flow:**
```javascript
// test-runner.js
const runTests = async () => {
  const stages = [
    { name: 'Unit Tests', cmd: 'npm run test:unit', threshold: 80 },
    { name: 'Integration Tests', cmd: 'npm run test:integration', threshold: 75 },
    { name: 'E2E Tests', cmd: 'npm run test:e2e', threshold: 95 }
  ];

  for (const stage of stages) {
    console.log(`🧪 Running ${stage.name}...`);
    const result = await executeCommand(stage.cmd);
    
    if (result.coverage < stage.threshold) {
      throw new Error(`Coverage ${result.coverage}% below threshold ${stage.threshold}%`);
    }
  }
};
```

### Stage 4: Security Scanning
```ascii
┌──────────────────────────────────────────────────────────────┐
│                   SECURITY CHECKS                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Dependency Scanning (Snyk)                              │
│     ├─> Known vulnerabilities: BLOCK if critical           │
│     ├─> License compliance: GPL check                       │
│     └─> Outdated packages: WARN if >6 months              │
│                                                               │
│  2. Code Security (SonarQube)                               │
│     ├─> SQL injection patterns                             │
│     ├─> XSS vulnerabilities                                │
│     ├─> Hardcoded secrets                                  │
│     └─> OWASP Top 10 compliance                            │
│                                                               │
│  3. Container Scanning (Trivy)                              │
│     ├─> Base image vulnerabilities                         │
│     ├─> Exposed secrets in layers                          │
│     └─> Security best practices                            │
│                                                               │
│  4. Secret Detection (GitLeaks)                             │
│     ├─> API keys                                           │
│     ├─> Database credentials                               │
│     └─> JWT secrets                                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Stage 5: Containerization
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

# Build stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs
EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/server/index.js"]
```

---

## 🚢 Deployment Workflow

### Blue-Green Deployment Strategy
```ascii
┌────────────────────────────────────────────────────────────────────┐
│                    BLUE-GREEN DEPLOYMENT                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Current State (BLUE - Active)        Deploy New Version (GREEN)   │
│   ┌─────────────────┐                  ┌─────────────────┐        │
│   │                 │                  │                 │        │
│   │   App v1.0.0    │                  │   App v1.1.0    │        │
│   │   (BLUE)        │                  │   (GREEN)       │        │
│   │   Port: 8003    │                  │   Port: 8004    │        │
│   │                 │                  │                 │        │
│   └────────┬────────┘                  └────────┬────────┘        │
│            │                                     │                 │
│            ▼                                     ▼                 │
│   ┌─────────────────┐                  ┌─────────────────┐        │
│   │   Database      │←─────────────────│   Database      │        │
│   │   (Shared)      │                  │   (Shared)      │        │
│   └─────────────────┘                  └─────────────────┘        │
│            │                                     │                 │
│            ▼                                     ▼                 │
│   ┌─────────────────────────────────────────────────────┐         │
│   │              Load Balancer / Router                  │         │
│   │                                                      │         │
│   │   Traffic Split:                                    │         │
│   │   [████████████████████░░░░] 90% BLUE / 10% GREEN │         │
│   │                                                      │         │
│   │   After validation:                                 │         │
│   │   [░░░░░░░░░░░░░░░░████████] 0% BLUE / 100% GREEN │         │
│   └─────────────────────────────────────────────────────┘         │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

ENVIRONMENT=$1
VERSION=$2

echo "🚀 Deploying version $VERSION to $ENVIRONMENT"

# Step 1: Pre-deployment checks
echo "1️⃣ Running pre-deployment checks..."
./scripts/pre-deploy-check.sh $ENVIRONMENT

# Step 2: Database migrations
echo "2️⃣ Running database migrations..."
npm run migrate:$ENVIRONMENT

# Step 3: Deploy to green environment
echo "3️⃣ Deploying to green environment..."
railway up --environment $ENVIRONMENT-green

# Step 4: Health checks
echo "4️⃣ Running health checks..."
./scripts/health-check.sh $ENVIRONMENT-green

# Step 5: Gradual traffic shift
echo "5️⃣ Shifting traffic (canary deployment)..."
for PERCENTAGE in 10 25 50 75 100; do
  echo "   Setting traffic to $PERCENTAGE%..."
  railway domain:update --split $PERCENTAGE
  sleep 60
  
  # Monitor error rates
  ERROR_RATE=$(./scripts/get-error-rate.sh)
  if [ $ERROR_RATE -gt 5 ]; then
    echo "❌ Error rate exceeded threshold!"
    ./scripts/rollback.sh $ENVIRONMENT
    exit 1
  fi
done

# Step 6: Decommission blue environment
echo "6️⃣ Decommissioning blue environment..."
railway down --environment $ENVIRONMENT-blue

echo "✅ Deployment completed successfully!"
```

---

## 🧪 Testing Strategy

### Automated Testing Pipeline
```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    TEST EXECUTION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   PR Created/Updated                                            │
│         │                                                        │
│         ▼                                                        │
│   ┌──────────┐     Pass     ┌──────────┐     Pass             │
│   │  Lint    │ ──────────> │  Unit    │ ──────────>           │
│   │  Check   │              │  Tests   │                       │
│   └──────────┘              └──────────┘                       │
│         │                         │                             │
│        Fail                      Fail                           │
│         ▼                         ▼                             │
│   ❌ Block PR               ❌ Block PR                        │
│                                                                   │
│         ┌──────────┐     Pass     ┌──────────┐                │
│    ───> │  Integ.  │ ──────────> │   E2E    │                │
│         │  Tests   │              │  Tests   │                │
│         └──────────┘              └──────────┘                │
│              │                         │                        │
│             Fail                      Pass                      │
│              ▼                         ▼                        │
│         ⚠️  Warning              ✅ Ready to Merge            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Test Data Management
```javascript
// test-data-generator.js
class TestDataGenerator {
  generateUser() {
    return {
      phone: `972${this.randomDigits(9)}`,
      firstName: faker.name.firstName('he'),
      lastName: faker.name.lastName('he'),
      birthDate: this.randomDate(25, 65),
      income: this.randomIncome(),
      propertyValue: this.randomProperty()
    };
  }

  generateMortgageApplication() {
    return {
      loanAmount: this.randomBetween(500000, 2000000),
      loanPeriod: this.randomChoice([15, 20, 25, 30]),
      propertyType: this.randomChoice(['apartment', 'house', 'land']),
      location: this.randomCity(),
      purpose: this.randomChoice(['purchase', 'refinance', 'equity'])
    };
  }
}
```

---

## 📊 Monitoring & Rollback

### Real-time Monitoring Dashboard
```ascii
┌──────────────────────────────────────────────────────────────────┐
│                    PRODUCTION MONITORING                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Deployment Health: ✅ Healthy                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Response Time (ms)                                       │   │
│  │ 400├─────────────────────────────────────────────────   │   │
│  │ 300├───────────────╱╲─────────────────────────────     │   │
│  │ 200├──────────────╱──╲───╱╲───────────────────────    │   │
│  │ 100├─────────────╱────╲─╱──╲──────────────────────    │   │
│  │   0└─────────────────────────────────────────────────   │   │
│  │     00:00  04:00  08:00  12:00  16:00  20:00  24:00    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Error Rate (%)                                           │   │
│  │  5├─────────────────────────────────────────────────    │   │
│  │  4├─────────────────────────────────────────────────    │   │
│  │  3├─────────────────────────────────────────────────    │   │
│  │  2├──────────────────────╱╲─────────────────────────   │   │
│  │  1├─────────────────────╱──╲────────────────────────   │   │
│  │  0└─────────────────────────────────────────────────    │   │
│  │     00:00  04:00  08:00  12:00  16:00  20:00  24:00    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Key Metrics:                                                   │
│  • Uptime: 99.97% (30 days)                                    │
│  • Avg Response: 187ms                                         │
│  • Error Rate: 0.3%                                            │
│  • Active Users: 1,247                                         │
│  • Database Load: 23%                                          │
│  • Memory Usage: 67%                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Automated Rollback Triggers
```yaml
rollback_conditions:
  - error_rate > 5%
  - response_time_p99 > 2000ms
  - health_check_failures > 3
  - memory_usage > 90%
  - database_connections > 95%
  - critical_alerts > 0
```

### Rollback Process
```bash
#!/bin/bash
# rollback.sh

echo "🔄 Initiating rollback procedure..."

# Step 1: Capture current state
echo "1️⃣ Capturing current state..."
railway logs --tail 1000 > rollback_logs_$(date +%s).txt

# Step 2: Switch traffic back to blue
echo "2️⃣ Switching traffic to previous version..."
railway domain:update --split 0  # 0% to green, 100% to blue

# Step 3: Alert team
echo "3️⃣ Alerting team..."
./scripts/send-alert.sh "Rollback initiated for $ENVIRONMENT"

# Step 4: Create incident report
echo "4️⃣ Creating incident report..."
./scripts/create-incident.sh

echo "✅ Rollback completed"
```

---

## 🔐 Security & Compliance

### Security Pipeline
```ascii
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY CHECKPOINTS                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Code Commit           Build              Deploy         Prod    │
│      │                   │                  │             │      │
│      ▼                   ▼                  ▼             ▼      │
│  ┌────────┐         ┌────────┐        ┌────────┐    ┌────────┐ │
│  │ Secret │         │ SAST   │        │ DAST   │    │Runtime │ │
│  │ Scan   │         │ Scan   │        │ Scan   │    │Monitor │ │
│  └────────┘         └────────┘        └────────┘    └────────┘ │
│      │                   │                  │             │      │
│      ▼                   ▼                  ▼             ▼      │
│  GitLeaks          SonarQube          OWASP ZAP      Falco     │
│  TruffleHog        Checkmarx          Burp Suite     Sysdig    │
│                                                                   │
│  Compliance Checks:                                             │
│  ✅ PCI DSS (Payment Card Industry)                           │
│  ✅ GDPR (Data Protection)                                    │
│  ✅ SOC 2 Type II                                             │
│  ✅ ISO 27001                                                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Security Configuration
```yaml
# security-config.yaml
security:
  scanning:
    dependencies:
      tool: snyk
      severity_threshold: high
      auto_fix: true
      
    static_analysis:
      tool: sonarqube
      quality_gate: strict
      coverage_threshold: 80
      
    dynamic_analysis:
      tool: owasp_zap
      scan_type: full
      authentication: required
      
    secrets:
      tool: gitleaks
      pre_commit: true
      scan_history: true
      
  runtime:
    waf: cloudflare
    rate_limiting: 100/min
    ddos_protection: enabled
    ssl_rating: A+
    
  compliance:
    audits:
      - pci_dss: quarterly
      - gdpr: monthly
      - penetration_test: annual
```

---

## 📈 Performance Metrics

### CI/CD KPIs Dashboard
```ascii
┌──────────────────────────────────────────────────────────────────┐
│                      CI/CD METRICS                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Deployment Frequency     Lead Time          MTTR               │
│  ┌──────────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │  ████████████    │    │ 45 min       │   │ 28 min       │  │
│  │  ████████████    │    │ ▼ 15% ✅     │   │ ▼ 22% ✅     │  │
│  │  5 deploys/week  │    │              │   │              │  │
│  └──────────────────┘    └──────────────┘   └──────────────┘  │
│                                                                   │
│  Build Success Rate       Test Coverage      Change Failure     │
│  ┌──────────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │ ████████████████ │    │ ████████████ │   │ ██           │  │
│  │ ████████████████ │    │ ████████████ │   │              │  │
│  │     96.5%        │    │    82.3%     │   │    4.2%      │  │
│  └──────────────────┘    └──────────────┘   └──────────────┘  │
│                                                                   │
│  Pipeline Duration Breakdown:                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Build    ████████ 3 min                                │   │
│  │ Lint     ██ 1 min                                      │   │
│  │ Test     ████████████████ 7 min                        │   │
│  │ Security ██████ 2 min                                  │   │
│  │ Deploy   ████ 2 min                                    │   │
│  │                                                         │   │
│  │ Total: 15 minutes average                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting Guide

### Common Issues and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Build Failure | npm install fails | Clear npm cache: `npm cache clean --force` |
| Test Timeout | E2E tests hang | Increase timeout: `TIMEOUT=60000 npm test` |
| Deploy Failed | Railway deployment error | Check logs: `railway logs --tail 100` |
| High Error Rate | >5% errors in prod | Trigger rollback: `./scripts/rollback.sh` |
| Slow Pipeline | >30 min duration | Enable parallel jobs in workflow |

### Emergency Procedures
```bash
# Emergency rollback
./scripts/emergency-rollback.sh

# Stop all deployments
railway pause --all

# Database rollback
npm run migrate:rollback

# Clear CDN cache
./scripts/clear-cdn.sh

# Notify stakeholders
./scripts/send-emergency-alert.sh
```

---

## 📚 Best Practices

1. **Commit Guidelines**
   - Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
   - Include ticket number: `feat: add payment gateway [BANK-123]`
   - Keep commits atomic and focused

2. **Branch Strategy**
   - `main` - Production-ready code
   - `develop` - Integration branch
   - `feature/*` - New features
   - `hotfix/*` - Emergency fixes

3. **Testing Requirements**
   - All PRs must have tests
   - Coverage must not decrease
   - E2E tests for critical paths

4. **Security Practices**
   - Never commit secrets
   - Use environment variables
   - Regular dependency updates
   - Security scanning on every commit

5. **Performance Standards**
   - Page load < 3 seconds
   - API response < 500ms
   - Bundle size < 1MB
   - Lighthouse score > 90

---

## 🔗 Related Documentation

- [Automation Testing Tool](./automation/README_automation_tool.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Policies](./SECURITY.md)
- [API Documentation](./API_DOCS.md)
- [Database Migrations](./migrations/README.md)

---

## 📞 Contact & Support

**DevOps Team**
- Slack: #devops-support
- Email: devops@bankimonline.com
- On-call: PagerDuty rotation

**Emergency Contacts**
- Platform Lead: +972-XXX-XXXX
- Security Team: security@bankimonline.com
- Database Admin: dba@bankimonline.com

---

*Last Updated: January 2025*
*Version: 2.0.0*
*Status: Production Ready*