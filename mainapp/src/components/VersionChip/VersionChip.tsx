import React, { useEffect, useState } from 'react';
import { BUILD_INFO } from '@src/config/buildInfo';
import styles from './VersionChip.module.scss';

export interface VersionChipProps {
  version?: string;
}

const VersionChip: React.FC<VersionChipProps> = ({ 
  version
}) => {
  const [isRailway, setIsRailway] = useState(false);
  
  // Check if using Railway database
  useEffect(() => {
    // Check backend API to see if Railway is active
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        // Check if database URL contains Railway domain
        if (data.database?.includes('railway') || data.database?.includes('rlwy.net')) {
          setIsRailway(true);
        }
      })
      .catch(() => {
        // Fallback: check if we can detect Railway from API responses
        console.log('Could not detect database type');
      });
  }, []);
  
  // Use build info for version and timestamp
  // Force to use package.json version (5.2.1) instead of simple-version
  const displayVersion = version || '5.2.1';
  const timestamp = BUILD_INFO.buildTime;
  const buildNumber = BUILD_INFO.buildNumber;
  const commit = BUILD_INFO.commit;
  
  // Create detailed tooltip
  const tooltipText = `Deployed: ${timestamp}\nBuild: #${buildNumber}\nCommit: ${commit}`;
  
  return (
    <div className={styles.versionContainer}>
      {isRailway && (
        <div className={styles.railwayWarning} title="Connected to Railway Database">
          <span className={styles.warningIcon}>🚂</span>
          <span className={styles.warningText}>RAILWAY</span>
        </div>
      )}
      <div className={styles.versionChip} title={tooltipText}>
        <span className={styles.versionLabel}>v</span>
        <span className={styles.versionNumber}>{displayVersion}</span>
        <span className={styles.versionTimestamp}>{timestamp}</span>
        {buildNumber !== 'local' && (
          <span className={styles.buildNumber}>#{buildNumber}</span>
        )}
      </div>
    </div>
  );
};

export default VersionChip;