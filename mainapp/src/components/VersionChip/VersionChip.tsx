import React from 'react';
import { BUILD_INFO } from '@src/config/buildInfo';
import styles from './VersionChip.module.scss';

export interface VersionChipProps {
  version?: string;
}

const VersionChip: React.FC<VersionChipProps> = ({ 
  version
}) => {
  // Use build info for version and timestamp
  const displayVersion = version || BUILD_INFO.version;
  const timestamp = BUILD_INFO.buildTime;
  const formattedVersion = `${displayVersion}_${timestamp}`;
  
  return (
    <div className={styles.versionChip} title={`Deployed: ${timestamp}`}>
      <span className={styles.versionLabel}>v</span>
      <span className={styles.versionNumber}>{displayVersion}</span>
      <span className={styles.versionTimestamp}>{timestamp}</span>
    </div>
  );
};

export default VersionChip;