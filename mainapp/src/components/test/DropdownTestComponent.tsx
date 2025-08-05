import React from 'react';
import { useDropdownData, useAllDropdowns, clearDropdownCache, getDropdownCacheStats } from '@src/hooks/useDropdownData';

/**
 * Test component to verify Phase 4 dropdown hooks functionality
 * This component demonstrates both hook patterns and can be used for testing
 */
const DropdownTestComponent: React.FC = () => {
  // Test single dropdown hook
  const whenNeededData = useDropdownData('mortgage_step1', 'when_needed', 'full');
  
  // Test bulk dropdown hook
  const { data: allDropdowns, loading: bulkLoading, error: bulkError, getDropdownProps } = useAllDropdowns('mortgage_step1');

  const handleClearCache = () => {
    clearDropdownCache();
    console.log('🗑️ Dropdown cache cleared manually');
  };

  const handleShowCacheStats = () => {
    const stats = getDropdownCacheStats();
    console.log('📊 Cache statistics:', stats);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h2>🧪 Phase 4 Dropdown Hooks Test Component</h2>
      
      {/* Single Hook Test */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
        <h3>📋 Single Hook Test (useDropdownData)</h3>
        <p><strong>Hook:</strong> useDropdownData('mortgage_step1', 'when_needed', 'full')</p>
        <p><strong>Loading:</strong> {whenNeededData.loading ? '🔄 Loading...' : '✅ Loaded'}</p>
        <p><strong>Error:</strong> {whenNeededData.error ? `❌ ${whenNeededData.error.message}` : '✅ No errors'}</p>
        <p><strong>Options Count:</strong> {whenNeededData.options.length}</p>
        <p><strong>Has Label:</strong> {whenNeededData.label ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Has Placeholder:</strong> {whenNeededData.placeholder ? '✅ Yes' : '❌ No'}</p>
        
        {whenNeededData.options.length > 0 && (
          <details>
            <summary>📋 Options Data</summary>
            <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', fontSize: '12px' }}>
              {JSON.stringify(whenNeededData.options, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Bulk Hook Test */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
        <h3>📦 Bulk Hook Test (useAllDropdowns)</h3>
        <p><strong>Hook:</strong> useAllDropdowns('mortgage_step1')</p>
        <p><strong>Loading:</strong> {bulkLoading ? '🔄 Loading...' : '✅ Loaded'}</p>
        <p><strong>Error:</strong> {bulkError ? `❌ ${bulkError.message}` : '✅ No errors'}</p>
        <p><strong>Dropdowns Count:</strong> {allDropdowns?.dropdowns?.length || 0}</p>
        <p><strong>Option Groups:</strong> {Object.keys(allDropdowns?.options || {}).length}</p>
        
        {allDropdowns && (
          <div style={{ marginTop: '10px' }}>
            <h4>🔍 Individual Dropdown Props Test:</h4>
            {['when_needed', 'type', 'first_home', 'property_ownership'].map(field => {
              const props = getDropdownProps(field);
              return (
                <div key={field} style={{ marginLeft: '20px', marginBottom: '5px' }}>
                  <strong>{field}:</strong> {props.options.length} options, 
                  {props.label ? ' has label' : ' no label'}, 
                  {props.placeholder ? ' has placeholder' : ' no placeholder'}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cache Management */}
      <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
        <h3>💾 Cache Management</h3>
        <button 
          onClick={handleShowCacheStats}
          style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          📊 Show Cache Stats
        </button>
        <button 
          onClick={handleClearCache}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🗑️ Clear Cache
        </button>
      </div>

      {/* Usage Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>📝 Usage Instructions</h3>
        <p>1. Open browser DevTools console to see detailed logging</p>
        <p>2. Watch for cache hits vs API calls in console</p>
        <p>3. Test cache by refreshing component or clearing cache</p>
        <p>4. Verify error handling by temporarily breaking API endpoint</p>
        <p>5. Test multi-language by changing i18n language</p>
      </div>
    </div>
  );
};

export default DropdownTestComponent;