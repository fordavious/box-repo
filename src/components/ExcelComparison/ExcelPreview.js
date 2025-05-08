import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const ExcelPreview = ({ file, sheet }) => {
  const { isAuthenticated } = useBoxAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [forecastCols, setForecastCols] = useState([]);

  // Fetch Excel data when file and sheet are available
  useEffect(() => {
    if (isAuthenticated && file && sheet) {
      fetchExcelData();
    }
  }, [isAuthenticated, file, sheet]);

  // Mock function to fetch Excel data
  const fetchExcelData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would download and parse the Excel file
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
      
      // Mock headers (columns)
      const mockHeaders = [
        'BH Level 5', 'BH Level 6', 'C_Line', 'Pillar Activity', 'Region', 
        'Div', 'Vendor Name', "Q1'24 Fcst", "Q2'24 Fcst", "Q3'24 Fcst", "Q4'24 Fcst"
      ];
      
      // Detect forecast columns
      const forecastPattern = /Q[1-4]'\d{2} Fcst/;
      const mockForecastCols = mockHeaders.filter(header => forecastPattern.test(header));
      
      // Mock data rows
      const mockData = [
        {
          'BH Level 5': 'Marketing',
          'BH Level 6': 'Digital',
          'C_Line': '1234',
          'Pillar Activity': 'Social Media',
          'Region': 'North America',
          'Div': 'Consumer',
          'Vendor Name': 'Digital Agency X',
          "Q1'24 Fcst": 25000,
          "Q2'24 Fcst": 27000,
          "Q3'24 Fcst": 30000,
          "Q4'24 Fcst": 32000
        },
        {
          'BH Level 5': 'Sales',
          'BH Level 6': 'Enterprise',
          'C_Line': '5678',
          'Pillar Activity': 'Client Outreach',
          'Region': 'EMEA',
          'Div': 'B2B',
          'Vendor Name': 'Sales Consultants Inc',
          "Q1'24 Fcst": 50000,
          "Q2'24 Fcst": 55000,
          "Q3'24 Fcst": 40000,
          "Q4'24 Fcst": 60000
        },
        {
          'BH Level 5': 'HR',
          'BH Level 6': 'Training',
          'C_Line': '9012',
          'Pillar Activity': 'Employee Development',
          'Region': 'Global',
          'Div': 'Operations',
          'Vendor Name': 'Learning Solutions Ltd',
          "Q1'24 Fcst": 10000,
          "Q2'24 Fcst": 10000,
          "Q3'24 Fcst": 10000,
          "Q4'24 Fcst": 10000
        },
        {
          'BH Level 5': 'IT',
          'BH Level 6': 'Infrastructure',
          'C_Line': '3456',
          'Pillar Activity': 'Cloud Services',
          'Region': 'APAC',
          'Div': 'Operations',
          'Vendor Name': 'Cloud Provider Inc',
          "Q1'24 Fcst": 35000,
          "Q2'24 Fcst": 38000,
          "Q3'24 Fcst": 40000,
          "Q4'24 Fcst": 45000
        },
        {
          'BH Level 5': 'Finance',
          'BH Level 6': 'Accounting',
          'C_Line': '7890',
          'Pillar Activity': 'Audit Services',
          'Region': 'Global',
          'Div': 'Corporate',
          'Vendor Name': 'Big 4 Accounting Firm',
          "Q1'24 Fcst": 60000,
          "Q2'24 Fcst": 20000,
          "Q3'24 Fcst": 20000,
          "Q4'24 Fcst": 20000
        }
      ];
      
      setHeaders(mockHeaders);
      setForecastCols(mockForecastCols);
      setData(mockData);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load Excel data: ${err.message}`);
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to preview Excel files.</div>;
  }

  if (!file || !sheet) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please select a file and sheet to preview.</div>;
  }

  if (loading) {
    return <LoadingSpinner message="Loading Excel data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: 0 }}>Excel Preview</h3>
        <div style={{ 
          fontSize: '0.9rem', 
          color: '#5a5a5a', 
          background: '#e8f1fd', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px'
        }}>
          {file.name} / {sheet}
        </div>
      </div>
      
      <div style={{ 
        background: 'white', 
        border: '1px solid #dde2e9', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        overflowX: 'auto'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} style={{
                  padding: '0.75rem',
                  backgroundColor: forecastCols.includes(header) ? '#e8f1fd' : '#f5f7fa',
                  borderBottom: '1px solid #dde2e9',
                  fontWeight: '500',
                  color: forecastCols.includes(header) ? '#0061d5' : '#5a5a5a',
                  whiteSpace: 'nowrap',
                  textAlign: forecastCols.includes(header) ? 'right' : 'left'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td key={colIndex} style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #dde2e9',
                    whiteSpace: 'nowrap',
                    backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9f9f9',
                    textAlign: forecastCols.includes(header) ? 'right' : 'left'
                  }}>
                    {forecastCols.includes(header) ? 
                      `$${row[header].toLocaleString()}` : 
                      row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        marginTop: '1rem', 
        fontSize: '0.85rem', 
        color: '#5a5a5a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ 
          display: 'inline-block', 
          width: '12px', 
          height: '12px', 
          backgroundColor: '#e8f1fd',
          border: '1px solid #0061d5',
          borderRadius: '2px'
        }}></span>
        <span>Forecast columns are highlighted</span>
      </div>
    </div>
  );
};

export default ExcelPreview;