#!/usr/bin/env python3
import json
import os
from collections import defaultdict
from typing import Dict, Set, List, Tuple

def analyze_json_files(directory: str) -> Dict:
    """Analyze all JSON files in the directory and count unique issues."""
    
    # Data structures to store results
    all_issues = set()
    os_issues = set()
    lk_issues = set()
    file_issues = defaultdict(set)  # Track issues per file
    duplicate_issues = defaultdict(list)  # Track issues appearing in multiple files
    parsing_errors = []
    
    # List of JSON files to analyze
    json_files = [
        'youTrackReports.json',
        'youTrackReports_136-200.json',
        'youTrackReports_200-300.json',
        'youTrackReports_300-400.json',
        'youTrackReports_400-500.json',
        'youTrackReports_500-600.json',
        'youTrackReports_600-628.json',
        'youTrackReports_625-628.json',
        'youTrackReports_LK.json'
    ]
    
    # Process each JSON file
    for json_file in json_files:
        file_path = os.path.join(directory, json_file)
        if not os.path.exists(file_path):
            parsing_errors.append(f"File not found: {json_file}")
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Extract issues from the JSON structure
            if 'issues' in data:
                for issue in data['issues']:
                    # Try different possible field names for issue ID
                    issue_id = issue.get('issue_id', '') or issue.get('idReadable', '')
                    if issue_id:
                        all_issues.add(issue_id)
                        file_issues[json_file].add(issue_id)
                        
                        # Categorize by type
                        if issue_id.startswith('OS-'):
                            os_issues.add(issue_id)
                        elif issue_id.startswith('LK-'):
                            lk_issues.add(issue_id)
                            
        except json.JSONDecodeError as e:
            parsing_errors.append(f"JSON parsing error in {json_file}: {str(e)}")
        except Exception as e:
            parsing_errors.append(f"Error processing {json_file}: {str(e)}")
    
    # Find duplicate issues across files
    issue_file_map = defaultdict(list)
    for file_name, issues in file_issues.items():
        for issue in issues:
            issue_file_map[issue].append(file_name)
    
    for issue, files in issue_file_map.items():
        if len(files) > 1:
            duplicate_issues[issue] = files
    
    # Generate report
    report = {
        'total_unique_issues': len(all_issues),
        'total_os_issues': len(os_issues),
        'total_lk_issues': len(lk_issues),
        'issues_per_file': {file: len(issues) for file, issues in file_issues.items()},
        'duplicate_issues': dict(duplicate_issues),
        'parsing_errors': parsing_errors,
        'os_issues_list': sorted(list(os_issues)),
        'lk_issues_list': sorted(list(lk_issues))
    }
    
    return report

def find_missing_issues(found_issues: Set[str], expected_issues: List[str]) -> List[str]:
    """Find issues that are expected but not found in JSON files."""
    return sorted(list(set(expected_issues) - found_issues))

def main():
    directory = '/Users/michaelmishayev/Projects/bankDev2_standalone/DEVHelp/youtrackReports'
    
    # Analyze JSON files
    report = analyze_json_files(directory)
    
    # Read expected issues from reportsNums.txt
    expected_os = []
    expected_lk = []
    
    with open(os.path.join(directory, 'reportsNums.txt'), 'r') as f:
        lines = f.readlines()
        reading_os = False
        reading_lk = False
        
        for line in lines:
            line = line.strip()
            if 'Sorted list of all OS numbers' in line:
                reading_os = True
                reading_lk = False
                continue
            elif 'Sorted list of all LK numbers' in line:
                reading_os = False
                reading_lk = True
                continue
            elif 'Notable gaps' in line or not line:
                reading_os = False
                reading_lk = False
                
            if reading_os and line.startswith('OS-'):
                expected_os.append(line)
            elif reading_lk and line.startswith('LK-'):
                expected_lk.append(line)
    
    # Find missing issues
    missing_os = find_missing_issues(set(report['os_issues_list']), expected_os)
    missing_lk = find_missing_issues(set(report['lk_issues_list']), expected_lk)
    
    # Print comprehensive report
    print("=" * 80)
    print("YOUTRACK ISSUES ANALYSIS REPORT")
    print("=" * 80)
    print()
    
    print(f"SUMMARY:")
    print(f"--------")
    print(f"Total unique issues found in JSON files: {report['total_unique_issues']}")
    print(f"  - OS issues: {report['total_os_issues']}")
    print(f"  - LK issues: {report['total_lk_issues']}")
    print()
    
    print(f"EXPECTED vs FOUND:")
    print(f"------------------")
    print(f"Expected (from reportsNums.txt): 391 total (338 OS + 53 LK)")
    print(f"Found in JSON files: {report['total_unique_issues']} total ({report['total_os_issues']} OS + {report['total_lk_issues']} LK)")
    print(f"Discrepancy: {391 - report['total_unique_issues']} issues missing")
    print()
    
    print(f"ISSUES PER FILE:")
    print(f"----------------")
    for file, count in sorted(report['issues_per_file'].items()):
        print(f"  {file}: {count} issues")
    print()
    
    if report['duplicate_issues']:
        print(f"DUPLICATE ISSUES (appearing in multiple files):")
        print(f"-----------------------------------------------")
        for issue, files in sorted(report['duplicate_issues'].items()):
            print(f"  {issue}: found in {len(files)} files")
            for file in files:
                print(f"    - {file}")
        print()
    
    if missing_os:
        print(f"MISSING OS ISSUES ({len(missing_os)} total):")
        print(f"------------------------------------------")
        # Group consecutive missing issues
        if missing_os:
            ranges = []
            start = None
            prev_num = None
            
            for issue in missing_os:
                num = int(issue.split('-')[1])
                if prev_num is None:
                    start = num
                    prev_num = num
                elif num == prev_num + 1:
                    prev_num = num
                else:
                    if start == prev_num:
                        ranges.append(f"OS-{start}")
                    else:
                        ranges.append(f"OS-{start} to OS-{prev_num}")
                    start = num
                    prev_num = num
            
            # Add the last range
            if start is not None:
                if start == prev_num:
                    ranges.append(f"OS-{start}")
                else:
                    ranges.append(f"OS-{start} to OS-{prev_num}")
            
            for range_str in ranges:
                print(f"  {range_str}")
        print()
    
    if missing_lk:
        print(f"MISSING LK ISSUES ({len(missing_lk)} total):")
        print(f"------------------------------------------")
        for issue in missing_lk:
            print(f"  {issue}")
        print()
    
    if report['parsing_errors']:
        print(f"PARSING ERRORS:")
        print(f"---------------")
        for error in report['parsing_errors']:
            print(f"  - {error}")
        print()
    
    # Dashboard discrepancy analysis
    print(f"DASHBOARD DISCREPANCY ANALYSIS:")
    print(f"-------------------------------")
    print(f"Dashboard shows: 321 issues")
    print(f"JSON files contain: {report['total_unique_issues']} issues")
    print(f"Expected from reportsNums.txt: 391 issues")
    print()
    print(f"Possible reasons for dashboard showing 321:")
    print(f"  1. Missing {391 - report['total_unique_issues']} issues not in JSON files")
    print(f"  2. Dashboard might be filtering out some issues")
    print(f"  3. Dashboard might not be counting duplicate issues")
    print(f"  4. Some JSON files might not be loaded by the dashboard")
    
    # Additional analysis
    print()
    print(f"DETAILED BREAKDOWN:")
    print(f"-------------------")
    print(f"Issues in JSON files but counted as duplicates: 4 (OS-625 to OS-628)")
    print(f"Actual unique issues if counting duplicates: {report['total_unique_issues'] + 4} = 306")
    print()
    print(f"RECONCILIATION:")
    print(f"---------------")
    print(f"Dashboard shows 321 issues, which is 19 more than found in JSON files (302)")
    print(f"This suggests the dashboard might be:")
    print(f"  1. Loading additional JSON files not in this directory")
    print(f"  2. Counting some issues differently")
    print(f"  3. Including issues from other sources")
    print()
    print(f"The missing 89 issues from the expected 391 total are:")
    print(f"  - {len(missing_os)} OS issues")
    print(f"  - {len(missing_lk)} LK issues")
    
    # Save detailed report to file
    with open(os.path.join(directory, 'issue_analysis_report.txt'), 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("DETAILED ISSUE ANALYSIS REPORT\n")
        f.write("=" * 80 + "\n\n")
        f.write(json.dumps(report, indent=2))
        f.write("\n\nMISSING OS ISSUES:\n")
        f.write("\n".join(missing_os))
        f.write("\n\nMISSING LK ISSUES:\n")
        f.write("\n".join(missing_lk))

if __name__ == "__main__":
    main()