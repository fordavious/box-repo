import React, { useRef, useEffect } from 'react';

const Console = ({ messages = [] }) => {
  const consoleEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div style={{ 
      marginTop: '1.5rem',
      border: '1px solid #333',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        background: '#333',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid #444',
        color: 'white'
      }}>
        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Console Output</span>
      </div>
      <div style={{ 
        height: '300px',
        overflowY: 'auto',
        padding: '1rem',
        background: '#1e1e1e',
        color: '#f0f0f0',
        fontFamily: 'monospace'
      }}>
        {messages.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic' }}>No output yet...</div>
        ) : (
          <div>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                  color: msg.type === 'error' ? '#ff6b6b' : '#f0f0f0'
                }}
              >
                <span style={{ color: '#6b98ff', marginRight: '0.5rem', fontSize: '0.85rem' }}>
                  [{msg.timestamp}]
                </span>
                <span>{msg.message}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Console;