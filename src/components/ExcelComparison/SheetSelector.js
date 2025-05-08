import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const SheetSelector = ({ file, onSheetSelect }) => {
  const { isAuthenticated } = useBoxAuth();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);

  // Mock API call to fetch Excel sheets
  const fetchSheets = async (fileId) => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll create mock data
      // In a real app, this would download the file and extract sheet names
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock sheets based on file ID
      let mockSheets = [];
      
      if (fileId === 'file1') {
        mockSheets = ['Annual Summary', 'Q1', 'Q2', 'Q3', 'Q4'];
      } else if (fileId === 'file2') {
        mockSheets = ['Summary', 'Revenue', 'Expenses', 'Projections'];
      } else if (fileId === 'file3') {
        mockSheets = ['Q1 Forecast', 'Q1 Actuals', 'Variance Analysis'];
      } else {
        mockSheets = ['Sheet1', 'Sheet2', 'Sheet3'];
      }
      
      setSheets(mockSheets);
    } catch (err) {
      setError(`Failed to load Excel sheets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load sheets when file changes
  useEffect(() => {
    if (isAuthenticated && file) {
      fetchSheets(file.id);
    }
  }, [isAuthenticated, file]);

  const handleSheetClick = (sheet) => {
    setSelectedSheet(sheet);
  };

  const handleSelectSheet = () => {
    if (selectedSheet && onSheetSelect) {
      onSheetSelect(selectedSheet);
    } else {
      setError('Please select a sheet first.');
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to select sheets.</div>;
  }

  if (!file) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please select a file first.</div>;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Excel sheets..." />;
  }

  return (
    <div style={{ border: '1px solid #dde2e9', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Sheet Selector Header */}
      <div style={{ 
        padding: '1rem', 
        background: '#e8f1fd', 
        borderBottom: '1px solid #dde2e9'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
          Select Sheet from {file.name}
        </h3>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Sheets Container */}
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {sheets.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>
            No sheets found in this Excel file.
          </div>
        ) : (
          <div>
            {sheets.map((sheet) => (
              <div
                key={sheet}
                onClick={() => handleSheetClick(sheet)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #f2f2f2',
                  cursor: 'pointer',
                  backgroundColor: selectedSheet === sheet ? '#e8f1fd' : 'white',
                  borderLeft: selectedSheet === sheet ? '3px solid #0061d5' : 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (selectedSheet !== sheet) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedSheet !== sheet) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <span>{sheet}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet Selector Footer */}
      <div style={{ 
        padding: '1rem',
        background: '#f5f7fa',
        borderTop: '1px solid #dde2e9',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleSelectSheet}
          disabled={!selectedSheet}
          style={{
            background: selectedSheet ? '#0061d5' : '#bdc3c7',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: selectedSheet ? 'pointer' : 'not-allowed'
          }}
        >
          Select Sheet
        </button>
      </div>
    </div>
  );
};

export default SheetSelector;