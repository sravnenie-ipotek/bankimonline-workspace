import React from 'react';
import { useServerMode } from '@src/hooks/useServerMode';
import styles from './ServerModeWarning.module.scss';

export const ServerModeWarning: React.FC = () => {
  const { serverMode, loading } = useServerMode();

  // Don't show anything while loading or if modern server
  if (loading || !serverMode || !serverMode.warning) {
    return null;
  }

  return (
    <div className={styles.warningBanner}>
      <div className={styles.warningContent}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningText}>
          <strong>DEV MODE - LEGACY MONOREPO</strong>
          <span className={styles.warningDetails}>
            Using: {serverMode.file} | Switch to modern: {serverMode.recommendedSwitch}
          </span>
        </div>
        <div className={styles.warningClose}>
          <button 
            className={styles.closeButton}
            onClick={() => {
              // Hide the warning for this session
              const banner = document.querySelector(`.${styles.warningBanner}`) as HTMLElement;
              if (banner) {
                banner.style.display = 'none';
              }
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};