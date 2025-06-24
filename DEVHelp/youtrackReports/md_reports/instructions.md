# YouTrack Issues Processing Instructions

## Purpose
YouTrack issues organized by issue number for systematic development gap analysis.

**Primary Objective**: Compare OS-... issue requirements against actual implemented features to identify development gaps.

## Mandatory Logging

### Action Log
- **ALWAYS** write ALL moves and actions to: `youTrackReports_log.txt`

### Start Analysis Log
- **CRITICAL**: When starting analysis of OS-[NUMBER], write `OS-[NUMBER]` to: `reportsNums.txt`

### Completion Log
- After finishing each OS-... issue, add **ONLY** the issue number to: `youTrackReports_log.txt`

### Figma URLs
- **ALWAYS** add Figma URLs to log files when writing to youTrackReports_ files

## File Management Rules

### File Naming Pattern
- Format: `youTrackReports_[START_NUMBER]-[END_NUMBER].json`
- **Range Limit**: Each file MUST contain NO MORE than 100 OS issues

### File Creation Logic

1. **Step 1**: Check if current OS-[NUMBER] falls within existing youTrackReports_ file range
2. **Step 2**: If OS number is WITHIN range: Add to existing file
3. **Step 3**: If OS number is OUTSIDE range but file has <100 OS issues: Extend range and rename file
4. **Step 4**: If extending would exceed 100 OS limit: Create new file

#### Examples
- **Extend Range**: `youTrackReports_625-628.json + OS-650 → youTrackReports_625-650.json` (if total ≤100)
- **New File**: If `youTrackReports_625-724.json` exists (100 OS) + OS-750 → create `youTrackReports_750-750.json`

### File Content Requirements
- Complete OS issue analysis
- ALL Figma URLs encountered during analysis
- Documented development gaps
- Business logic and design validation outcomes

## Processing Order

### Multiple Issues
- If multiple OS-... issues exist, process them **ONE BY ONE** in the **EXACT order** provided by user

### Sequential Rule
- **NEVER** process multiple OS-... issues simultaneously

### Completion Requirement
- **FULLY** complete current OS-... issue before starting next one

## Figma Protocol

### Priority
⚠️ **VERY VERY VERY IMPORTANT**: Always check for Figma URLs - this is **CRITICAL**

### Access Check
- If you **CANNOT ACCESS** Figma, **IMMEDIATELY STOP** processing

### Error Handling
- If Figma access error occurs, **IMMEDIATELY STOP** processing

### URL Delivery
- Send **ONE** Figma URL at a time (including embedded Figma URLs)
- **DO NOT** send all URLs at once - send one by one

### Wait Condition
- Wait for user to open Figma desktop and say 'continue'

### Continuation
- After user says continue, proceed to next Figma URL if more exist

### Completion
- Resume analysis only after **ALL** Figma URLs have been processed

### URL Storage
- Store **ALL** encountered Figma URLs in the corresponding youTrackReports_ file

## Gap Analysis Workflow

### Step 1: Start Analysis
- **Action**: `LOG: Starting analysis of OS-[NUMBER]`
- **Description**: Begin processing single OS-... issue from user-provided order
- **File Action**: Determine target youTrackReports_ file using file_management_rules
- **CRITICAL**: Write `OS-[NUMBER]` to reportsNums.txt when starting analysis

### Step 2: Review Requirements
- **Action**: `LOG: Reviewing requirements for OS-[NUMBER]`
- **Description**: Extract and understand original requirements and specifications

### Step 3: Compare Implementation
- **Action**: `LOG: Comparing implementation vs requirements for OS-[NUMBER]`
- **Description**: Compare requirements against actual developed features

### Step 4: Identify Gaps
- **Action**: `LOG: Identifying gaps for OS-[NUMBER]`
- **Description**: Document gaps between planned features and delivered functionality

### Step 5: Figma Validation
- **Action**: `LOG: Checking Figma validation for OS-[NUMBER]`
- **Description**: Cross-reference gaps with Figma designs (FOLLOW FIGMA PROTOCOL)
- **Critical Action**: **CAPTURE and STORE** all Figma URLs encountered

### Step 6: Business Logic Verification
- **Action**: `LOG: Verifying business logic for OS-[NUMBER]`
- **Description**: Verify gaps against business logic requirements

### Step 7: Document Findings
- **Action**: `LOG: Documenting findings for OS-[NUMBER]`
- **Description**: Document all findings for development prioritization

### Step 8: Update Files
- **Action**: `LOG: Updating youTrackReports file for OS-[NUMBER]`
- **Description**: Update/create youTrackReports_ file following file_management_rules
- **Requirements**:
  - Include complete OS analysis
  - Include ALL Figma URLs found
  - Update file range if necessary
  - Rename file if range extended
  - Create new file if 100 OS limit reached

### Step 9: Complete
- **Action**: `LOG: Completed OS-[NUMBER]`
- **Description**: Add ONLY the OS number to youTrackReports_log.txt completion log

## File Update Decision Matrix

### Scenario 1
- **Condition**: OS number within existing file range AND file has <100 OS
- **Action**: Add to existing file, no rename needed

### Scenario 2
- **Condition**: OS number outside existing file range AND total would be ≤100 OS
- **Action**: Extend range, rename file to new range

### Scenario 3
- **Condition**: OS number outside existing file range AND total would exceed 100 OS
- **Action**: Create new `youTrackReports_[OS_NUMBER]-[OS_NUMBER].json` file

### Scenario 4
- **Condition**: No existing youTrackReports_ files
- **Action**: Create `youTrackReports_[OS_NUMBER]-[OS_NUMBER].json`

## Validation Sources

### Figma (HIGHEST PRIORITY)
- Figma designs for visual and interaction requirements
- **STORE ALL URLs**

### Business Logic
- Business logic documentation for functional specifications

### YouTrack
- YouTrack reports for implementation status tracking

## Error Handling

### Figma Errors
- **STOP** immediately, send ONE URL, wait for 'continue' command

### File Access Errors
- LOG error and request user assistance

### Data Inconsistencies
- LOG discrepancy and continue with available data

### File Management Errors
- LOG file operation failure and request user guidance

## Success Criteria

### Per Issue
- Each OS-... issue completely analyzed with all gaps documented

### Logging Complete
- All actions logged in youTrackReports_log.txt

### Files Updated
- Corresponding youTrackReports files updated with proper naming

### Figma Validated
- All Figma URLs processed successfully AND stored in files

### File Integrity
- All files respect 100 OS limit and proper range naming

## Critical Reminders

### Figma Storage
- **NEVER** lose Figma URLs - they **MUST** be stored in youTrackReports_ files

### File Limits
- **NEVER** exceed 100 OS issues per youTrackReports_ file

### Range Accuracy
- File names **MUST** accurately reflect the OS number range contained

### Sequential Processing
- **COMPLETE** each OS fully before starting next one

---

**Note**: These instructions are designed for systematic processing of OS-... issues with comprehensive gap analysis and proper file management. Always follow the Figma protocol and maintain accurate logging throughout the process. 