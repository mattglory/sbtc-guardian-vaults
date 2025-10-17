import { useEffect, useState } from 'react';

/**
 * Component to test that all required polyfills are working
 * This will log to console and display any polyfill issues
 */
function PolyfillTest() {
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const results = [];

    // Test Buffer
    try {
      if (typeof window.Buffer !== 'undefined') {
        const buf = Buffer.from('test');
        results.push({ name: 'Buffer', status: 'OK', value: buf.toString() });
      } else {
        results.push({ name: 'Buffer', status: 'MISSING', value: 'window.Buffer is undefined' });
      }
    } catch (error) {
      results.push({ name: 'Buffer', status: 'ERROR', value: error.message });
    }

    // Test process
    try {
      if (typeof process !== 'undefined' && process.env) {
        results.push({ name: 'process', status: 'OK', value: `env keys: ${Object.keys(process.env).length}` });
      } else {
        results.push({ name: 'process', status: 'MISSING', value: 'process or process.env is undefined' });
      }
    } catch (error) {
      results.push({ name: 'process', status: 'ERROR', value: error.message });
    }

    // Test global
    try {
      if (typeof global !== 'undefined') {
        results.push({ name: 'global', status: 'OK', value: 'global is defined' });
      } else {
        results.push({ name: 'global', status: 'MISSING', value: 'global is undefined' });
      }
    } catch (error) {
      results.push({ name: 'global', status: 'ERROR', value: error.message });
    }

    // Test crypto (basic check)
    try {
      if (typeof crypto !== 'undefined') {
        results.push({ name: 'crypto', status: 'OK', value: 'crypto is available' });
      } else {
        results.push({ name: 'crypto', status: 'MISSING', value: 'crypto is undefined' });
      }
    } catch (error) {
      results.push({ name: 'crypto', status: 'ERROR', value: error.message });
    }

    // Test @stacks/transactions import
    try {
      import('@stacks/transactions').then(module => {
        results.push({ name: '@stacks/transactions', status: 'OK', value: `Loaded: ${Object.keys(module).length} exports` });
        setTestResults([...results]);
      }).catch(error => {
        results.push({ name: '@stacks/transactions', status: 'ERROR', value: error.message });
        setTestResults([...results]);
      });
    } catch (error) {
      results.push({ name: '@stacks/transactions', status: 'ERROR', value: error.message });
    }

    // Test @stacks/connect import
    try {
      import('@stacks/connect').then(module => {
        results.push({ name: '@stacks/connect', status: 'OK', value: `Loaded: ${Object.keys(module).length} exports` });
        setTestResults([...results]);
      }).catch(error => {
        results.push({ name: '@stacks/connect', status: 'ERROR', value: error.message });
        setTestResults([...results]);
      });
    } catch (error) {
      results.push({ name: '@stacks/connect', status: 'ERROR', value: error.message });
    }

    setTestResults(results);

    // Log all results to console
    console.log('=== Polyfill Test Results ===');
    results.forEach(result => {
      const emoji = result.status === 'OK' ? '✅' : result.status === 'ERROR' ? '❌' : '⚠️';
      console.log(`${emoji} ${result.name}: ${result.status} - ${result.value}`);
    });
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't render in production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: '#1a1a1a',
      color: '#fff',
      padding: '1rem',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace',
      borderTopLeftRadius: '8px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
      zIndex: 9999
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '14px' }}>
        🔧 Polyfill Status
      </div>
      {testResults.map((result, idx) => (
        <div key={idx} style={{
          marginBottom: '0.25rem',
          padding: '0.25rem',
          background: result.status === 'OK' ? '#1a3d1a' : result.status === 'ERROR' ? '#3d1a1a' : '#3d3d1a',
          borderRadius: '4px'
        }}>
          <span style={{ color: result.status === 'OK' ? '#4ade80' : result.status === 'ERROR' ? '#f87171' : '#fbbf24' }}>
            {result.status === 'OK' ? '✅' : result.status === 'ERROR' ? '❌' : '⚠️'}
          </span>
          {' '}
          <strong>{result.name}:</strong> {result.value}
        </div>
      ))}
    </div>
  );
}

export default PolyfillTest;
