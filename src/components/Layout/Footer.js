import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 2rem',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} FPA Forecast Automation </p>
        <p style={{ fontSize: '0.9rem', color: '#bdc3c7', margin: '0.5rem 0 0' }}>
          This application enables comparison and synchronization of Excel files stored in Box.
        </p>
      </div>
    </footer>
  );
};

export default Footer;