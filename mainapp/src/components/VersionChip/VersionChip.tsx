import React, { useEffect, useState } from 'react';
import VERSION_CONFIG from '@src/config/versionConfig';
import styles from './VersionChip.module.scss';

export interface VersionChipProps {
  version?: string;
}

const VersionChip: React.FC<VersionChipProps> = ({ 
  version
}) => {
  const [isRailway, setIsRailway] = useState(false);
  
  // Check if chip should be visible based on environment
  const shouldShowChip = VERSION_CONFIG.isVisible();
  
  // Don't render if visibility is disabled for this environment
  if (!shouldShowChip) {
    return null;
  }
  
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
  
  // Use hardcoded version config (manual management)
  const displayVersion = version || VERSION_CONFIG.version;
  const timestamp = VERSION_CONFIG.datetime;
  const buildNumber = VERSION_CONFIG.buildNumber;
  const commit = VERSION_CONFIG.commit;
  
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
        {buildNumber !== 'local' && buildNumber !== 'manual' && (
          <span className={styles.buildNumber}>#{buildNumber}</span>
        )}
      </div>
    </div>
  );
};

export default VersionChip;