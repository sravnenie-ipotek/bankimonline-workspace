import React, { useEffect, useState } from 'react';
import './RailwayWarningChip.css';

interface DatabaseSafetyResponse {
  safe: boolean;
  mode: string;
  warning: string | null;
  databases: {
    main: {
      type: string;
      host: string;
      safe: boolean;
    };
    content: {
      type: string;
      host: string;
      safe: boolean;
    };
  };
  message: string;
}

const RailwayWarningChip: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [safetyData, setSafetyData] = useState<DatabaseSafetyResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check database safety on mount
    checkDatabaseSafety();
    
    // Check every 30 seconds
    const interval = setInterval(checkDatabaseSafety, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkDatabaseSafety = async () => {
    try {
      const response = await fetch('/api/database-safety');
      const data: DatabaseSafetyResponse = await response.json();
      
      setSafetyData(data);
      setShowWarning(!data.safe);
      
      // Log to console for debugging
      if (!data.safe) {
        console.error('⚠️ RAILWAY DATABASE DETECTED:', data);
      }
    } catch (error) {
      console.error('Failed to check database safety:', error);
    }
  };

  const switchToLocal = () => {
    // Show instructions to switch to local
    alert(
      'To switch to local databases:\n\n' +
      '1. Stop the server (Ctrl+C)\n' +
      '2. Run: npm run use-local-db\n' +
      '3. Restart: npm start\n\n' +
      'This will use your local PostgreSQL databases instead of Railway.'
    );
  };

  if (!showWarning || !safetyData) {
    return null;
  }

  return (
    <div className={`railway-warning-chip ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="railway-warning-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="warning-icon">⚠️</span>
        <span className="warning-text">UNSAFE: Railway DB Active</span>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <div className="railway-warning-details">
          <div className="database-status">
            <div className="db-item">
              <span className={`db-indicator ${safetyData.databases.main.safe ? 'safe' : 'unsafe'}`}>●</span>
              <span className="db-label">Main DB:</span>
              <span className="db-value">{safetyData.databases.main.host}</span>
            </div>
            <div className="db-item">
              <span className={`db-indicator ${safetyData.databases.content.safe ? 'safe' : 'unsafe'}`}>●</span>
              <span className="db-label">Content DB:</span>
              <span className="db-value">{safetyData.databases.content.host}</span>
            </div>
          </div>
          
          <div className="warning-message">
            {safetyData.message}
          </div>
          
          <div className="warning-issues">
            <strong>Issues with Railway:</strong>
            <ul>
              <li>Network latency (500-3000ms)</li>
              <li>Connection timeouts</li>
              <li>Data sync problems</li>
              <li>Security vulnerabilities</li>
            </ul>
          </div>
          
          <button 
            className="switch-to-local-btn"
            onClick={switchToLocal}
          >
            Switch to Local Databases
          </button>
        </div>
      )}
    </div>
  );
};

export default RailwayWarningChip;