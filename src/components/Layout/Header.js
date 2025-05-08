import React from 'react';
import BoxAuth from '../Auth/BoxAuth';

const Header = () => {
  return (
    <header style={{
      backgroundColor: '#0061d5',
      padding: '1rem 2rem',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div className="header-logo">
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Box Excel Comparison Tool</h1>
        </div>
        <div className="header-auth" style={{ background: 'white', padding: '10px', borderRadius: '4px' }}>
          <BoxAuth />
        </div>
      </div>
    </header>
  );
};

export default Header;