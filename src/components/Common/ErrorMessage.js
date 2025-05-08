import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div style={{
      background: '#ffebee',
      border: '1px solid #ffcdd2',
      borderLeft: '4px solid #f44336',
      color: '#b71c1c',
      padding: '1rem',
      borderRadius: '4px',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <div>{message}</div>
      </div>
    </div>
  );
};

export default ErrorMessage;