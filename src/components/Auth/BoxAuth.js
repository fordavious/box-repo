import React from 'react';
import { useBoxAuth } from './BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const BoxAuth = () => {
  const { isAuthenticated, user, loading, error, login, logout } = useBoxAuth();

  if (loading) {
    return <LoadingSpinner message="Connecting to Box..." />;
  }

  return (
    <div style={{ maxWidth: '400px' }}>
      {error && <ErrorMessage message={error} />}
      
      {isAuthenticated ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          padding: '0.75rem 1rem',
          background: '#e8f1fd',
          borderRadius: '4px',
          border: '1px solid #0061d5'
        }}>
          <span style={{ color: '#0061d5', fontWeight: '500' }}>
            ✓ Connected to Box {user && `as ${user.name}`}
          </span>
          <button 
            onClick={logout}
            style={{
              background: 'white',
              color: '#d92626',
              border: '1px solid #d92626',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <button 
            onClick={login}
            style={{
              background: '#0061d5',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Connect to Box
          </button>
          <p style={{ fontSize: '0.9rem', color: '#5a5a5a', marginTop: '0.5rem' }}>
            Connect to your Box account to access your Excel files.
          </p>
        </div>
      )}
    </div>
  );
};

// Add this default export
export default BoxAuth;