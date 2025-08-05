#!/usr/bin/env python3

import json
import os
import glob

def analyze_json_files():
    """Analyze all JSON files in youtrackReports folder"""
    
    json_files = glob.glob("youtrackReports/*.json")
    print(f"Found {len(json_files)} JSON files")
    print("-" * 80)
    
    total_issues = 0
    all_statuses = set()
    
    for json_file in sorted(json_files):
        print(f"\nAnalyzing: {json_file}")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Count issues
            issue_count = 0
            statuses_in_file = set()
            
            # Check for 'issues' array
            if 'issues' in data and isinstance(data['issues'], list):
                issue_count += len(data['issues'])
                for issue in data['issues']:
                    if 'status' in issue:
                        statuses_in_file.add(issue['status'])
                print(f"  - Found 'issues' array with {len(data['issues'])} items")
            
            # Check for individual issue keys (LK-xxx, OS-xxx, etc.)
            issue_keys = [k for k in data.keys() if isinstance(k, str) and 
                         any(k.startswith(prefix + '-') for prefix in ['LK', 'OS', 'DOC', 'REP'])]
            
            if issue_keys:
                issue_count += len(issue_keys)
                print(f"  - Found {len(issue_keys)} individual issue keys: {issue_keys[:5]}...")
                for key in issue_keys:
                    if isinstance(data[key], dict) and 'status' in data[key]:
                        statuses_in_file.add(data[key]['status'])
            
            # Check for 'reports' object
            if 'reports' in data and isinstance(data['reports'], dict):
                issue_count += len(data['reports'])
                print(f"  - Found 'reports' object with {len(data['reports'])} items")
                for report in data['reports'].values():
                    if 'status' in report:
                        statuses_in_file.add(report['status'])
            
            print(f"  - Total issues in file: {issue_count}")
            print(f"  - Unique statuses: {statuses_in_file}")
            
            total_issues += issue_count
            all_statuses.update(statuses_in_file)
            
        except Exception as e:
            print(f"  - ERROR: {e}")
    
    print("\n" + "=" * 80)
    print(f"SUMMARY:")
    print(f"Total issues across all files: {total_issues}")
    print(f"All unique statuses found: {sorted(all_statuses)}")
    print("=" * 80)

if __name__ == "__main__":
    analyze_json_files()