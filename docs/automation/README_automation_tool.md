# 🤖 Bankim Automation Testing Tool – Overview

## 1. Purpose
The **Bankim Automation Testing Tool** provides an end-to-end quality-assurance framework that simulates real user journeys across the platform and validates API integrations, business logic, and UI integrity.  It combines Playwright-driven browser automation with API verification and produces rich HTML/JSON reports – including screenshot & video evidence and optional JIRA bug creation.

## 2. Core Capabilities
| Capability | Description |
|------------|-------------|
| **Full Workflow Execution** | Navigates step-by-step through mortgage/credit/refinance calculators (Steps 1--4) filling realistic data and validating backend results. |
| **API Integration Testing** | Independently hits key REST endpoints (cities list, calculation parameters, compare banks) and validates JSON schema & response times. |
| **Visual Evidence Capture** | Takes high-resolution screenshots at each milestone and records 1080p videos for entire sessions. |
| **Automatic Bug Reporting** | When a step fails it creates a structured bug object (optionally sent to JIRA). |
| **Interactive Reporting** | Generates a single-page HTML dashboard with pass/fail metrics, collapsible details, screenshot galleries and video embeds. |
| **Network Logging** | Intercepts every `/api/*` request during browser sessions for later analysis. |
| **Configurable Test Data** | Uses a central `getTestData()` generator to produce realistic Hebrew/English inputs. |

## 3. Execution Modes
The tool supports two execution flavours, optimised for speed or for completeness.

### 3.1 Smoke Mode (🔎 **Quick Sanity Check**)
File: `scripts/smoke-forms.js`

```
$ node scripts/smoke-forms.js
```
* **Goal** – Verify that critical pages & dropdowns load after each deployment.
* **Scope** – 3rd step of Mortgage/Credit/Refinance calculators.
* **Checks**
  * HTTP 200 & non-error title.
  * Presence of main dropdowns (income source, additional income, etc.).
  * Option count (>1) for native `<select>` elements.
* **Runtime** – <60 s (headless, single page, no screenshots).
* **Exit Code** – 0 on success, 1 on any failure (CI-friendly).

### 3.2 Full Check Mode (🚀 **Comprehensive E2E**)  
Entry point: `comprehensive-e2e-automation.js`

```
# Run default full suite
$ node comprehensive-e2e-automation.js
```

* **Workflow Coverage**
  1. Mortgage calculator – Steps 1-4 including **SMS authentication** flow.
  2. Credit calculator & additional workflows (placeholders for future expansion).
* **API Coverage**
  * `GET /api/get-cities`  (localised list)
  * `GET /api/v1/calculation-parameters`
  * `POST /api/customer/compare-banks` (dynamic payload)
* **Validation Points**
  * Field-level input, dropdown selections, dynamic LTV calculations.
  * Response schema adherence & required keys (`bank_offers`, etc.).
  * UI confirmation of bank offer cards count >0.
* **Artifacts Generated**
  * `/e2e-reports/<timestamp>/comprehensive-e2e-report.html` – interactive dashboard.
  * JSON result payload for further analytics.
  * Per-step screenshots & session videos.
* **Timing** – ~3-5 min depending on network speed (runs Chromium in slow-mo for clear videos).
* **Exit Code** – 0 if all workflows & API tests pass; 1 otherwise.

## 4. Configuration & Extensibility
| Setting | Location | Note |
|---------|----------|------|
| **Base URL** | `this.baseUrl` in `comprehensive-e2e-automation.js` | Change to target env (staging/prod). |
| **Headless / slowMo** | `initialize()` method | Use env vars for CI vs local debug. |
| **Test Data** | `getTestData()` | Add new scenarios or extend locales. |
| **Additional Workflows** | Add new `testXWorkflow()` methods and push to `runAllTests()`. |
| **Smoke Targets** | `tests[]` array in `scripts/smoke-forms.js` | Add/remove critical routes.

## 5. CI/CD Integration
* **Smoke Mode** should run on every pull-request build to fail fast on UI regressions.
* **Full Check** can be scheduled daily or on pre-release pipeline (nightly build) due to longer runtime.
* Artifacts (`e2e-reports/**`) can be uploaded to CI for archival.

## 6. Future Enhancements
* Parallel browser execution (Chrome + Firefox + WebKit) for cross-browser assurance.
* Parameterise slow-mo & viewport via CLI flags.
* Add Lighthouse budgets & accessibility axe audits as separate suites.
* Use `jest-playwright` or `vitest` runner for richer assertion reporting.

---
✨ **Maintained by QA Automation Team – 2025-08-17**
