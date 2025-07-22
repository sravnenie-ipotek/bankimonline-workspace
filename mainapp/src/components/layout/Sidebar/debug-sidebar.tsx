import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContentApi } from '@src/hooks/useContentApi';

const DebugSidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { getContent, loading, error, content } = useContentApi('sidebar');
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [content, loading, error]);
  
  const testKeys = [
    'sidebar_company',
    'sidebar_company_1',
    'sidebar_company_2',
    'sidebar_business',
    'sidebar_business_1'
  ];
  
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Sidebar Translation Debug</h3>
      <p>Render count: {renderCount}</p>
      <p>Current language: {i18n.language}</p>
      <p>Content API loading: {loading ? 'Yes' : 'No'}</p>
      <p>Content API error: {error || 'None'}</p>
      <p>Content keys loaded: {Object.keys(content).length}</p>
      
      <h4>Translation Test Results:</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '5px' }}>Key</th>
            <th style={{ textAlign: 'left', padding: '5px' }}>getContent()</th>
            <th style={{ textAlign: 'left', padding: '5px' }}>t()</th>
            <th style={{ textAlign: 'left', padding: '5px' }}>t(__MIGRATED_)</th>
            <th style={{ textAlign: 'left', padding: '5px' }}>Source</th>
          </tr>
        </thead>
        <tbody>
          {testKeys.map(key => {
            const contentValue = getContent(key);
            const tValue = t(key);
            const migratedValue = t(`__MIGRATED_${key}`);
            
            let source = 'Unknown';
            if (content[key]) {
              source = 'Content API';
            } else if (migratedValue !== `__MIGRATED_${key}`) {
              source = 'Migrated JSON';
            } else if (tValue !== key) {
              source = 'JSON';
            } else {
              source = 'None (showing key)';
            }
            
            return (
              <tr key={key} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '5px' }}>{key}</td>
                <td style={{ padding: '5px', color: contentValue === key ? 'red' : 'green' }}>
                  {contentValue}
                </td>
                <td style={{ padding: '5px', color: tValue === key ? 'red' : 'green' }}>
                  {tValue}
                </td>
                <td style={{ padding: '5px', color: migratedValue === `__MIGRATED_${key}` ? 'red' : 'green' }}>
                  {migratedValue}
                </td>
                <td style={{ padding: '5px', fontWeight: 'bold' }}>{source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <h4>Raw Content API Response:</h4>
      <pre style={{ background: '#fff', padding: '10px', overflow: 'auto', maxHeight: '200px' }}>
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
};

export default DebugSidebar;