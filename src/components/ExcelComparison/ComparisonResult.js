import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import changeTrackingService from '../../services/changeTrackingService';

const ComparisonResult = ({ 
  originalFile, 
  originalSheet, 
  comparisonFile, 
  comparisonSheet,
  consolidatedFile,
  consolidatedSheet,
  onComplete
}) => {
  const { isAuthenticated } = useBoxAuth();
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);
  const [differences, setDifferences] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState(0);
  const [showResetTrackingButton, setShowResetTrackingButton] = useState(false);

  // Run comparison when files and sheets are selected
  useEffect(() => {
    if (isAuthenticated && originalFile && originalSheet && comparisonFile && comparisonSheet) {
      // We already have files selected, but don't auto-run the comparison
      setShowResetTrackingButton(changeTrackingService.getProcessedChanges().size > 0);
    }
  }, [isAuthenticated, originalFile, originalSheet, comparisonFile, comparisonSheet]);

  const runComparison = () => {
    setLoading(true);
    setComparing(true);
    setError(null);
    
    // Mock comparison process
    setTimeout(() => {
      try {
        // Get comparison options with processed changes
        const comparisonOptions = changeTrackingService.getComparisonOptions();
        
        // Store original size of processed changes set
        const beforeSize = changeTrackingService.getProcessedChanges().size;
        
        // Mock differences data
        const mockDifferences = generateMockDifferences();
        
        // Filter out differences that have been processed before
        const filteredDifferences = mockDifferences.filter(diff => {
          return diff.columns.some(col => {
            const changeId = `${diff['BH Level 5']}-${diff['C_Line']}-${col.column}`;
            return !comparisonOptions.processedChanges.has(changeId);
          });
        });
        
        // Update columns array for each difference to only include unprocessed changes
        const processedDifferences = filteredDifferences.map(diff => ({
          ...diff,
          columns: diff.columns.filter(col => {
            const changeId = `${diff['BH Level 5']}-${diff['C_Line']}-${col.column}`;
            return !comparisonOptions.processedChanges.has(changeId);
          })
        }));
        
        // Filter out differences with no columns left
        const finalDifferences = processedDifferences.filter(diff => diff.columns.length > 0);
        
        // Calculate how many duplicates were filtered out
        const duplicatesFiltered = mockDifferences.length - finalDifferences.length;
        
        // Store results in state
        setDifferences(finalDifferences);
        setDuplicatesFound(duplicatesFiltered);
        
        setLoading(false);
        setComparing(false);
        
        // If no differences found
        if (finalDifferences.length === 0) {
          setError("No differences found between the sheets." + (duplicatesFiltered > 0 ? 
            ` (${duplicatesFiltered} duplicate changes were filtered out)` : ""));
        }
      } catch (err) {
        setError(`Failed to compare Excel sheets: ${err.message}`);
        setLoading(false);
        setComparing(false);
      }
    }, 2000);
  };

  // Generate mock differences for demonstration
  const generateMockDifferences = () => {
    return [
      {
        row_idx: 5,
        'BH Level 5': 'Marketing',
        'BH Level 6': 'Digital',
        'C_Line': '1234',
        'Pillar Activity': 'Social Media',
        'Region': 'North America',
        'Div': 'Consumer',
        'Vendor Name': 'Digital Agency X',
        columns: [
          {
            column: "Q1'24 Fcst",
            old_value: 15000,
            new_value: 25000,
            changeId: 'Marketing-1234-Q1\'24 Fcst'
          },
          {
            column: "Q2'24 Fcst",
            old_value: 18000,
            new_value: 27000,
            changeId: 'Marketing-1234-Q2\'24 Fcst'
          }
        ]
      },
      {
        row_idx: 12,
        'BH Level 5': 'Sales',
        'BH Level 6': 'Enterprise',
        'C_Line': '5678',
        'Pillar Activity': 'Client Outreach',
        'Region': 'EMEA',
        'Div': 'B2B',
        'Vendor Name': 'Sales Consultants Inc',
        columns: [
          {
            column: "Q3'24 Fcst",
            old_value: 45000,
            new_value: 40000,
            changeId: 'Sales-5678-Q3\'24 Fcst'
          }
        ]
      },
      {
        row_idx: 24,
        'BH Level 5': 'HR',
        'BH Level 6': 'Training',
        'C_Line': '9012',
        'Pillar Activity': 'Employee Development',
        'Region': 'Global',
        'Div': 'Operations',
        'Vendor Name': 'Learning Solutions Ltd',
        columns: [
          {
            column: "Q1'24 Fcst",
            old_value: 12000,
            new_value: 10000,
            changeId: 'HR-9012-Q1\'24 Fcst'
          },
          {
            column: "Q2'24 Fcst",
            old_value: 12000,
            new_value: 10000,
            changeId: 'HR-9012-Q2\'24 Fcst'
          },
          {
            column: "Q3'24 Fcst",
            old_value: 12000,
            new_value: 10000,
            changeId: 'HR-9012-Q3\'24 Fcst'
          },
          {
            column: "Q4'24 Fcst",
            old_value: 12000,
            new_value: 10000,
            changeId: 'HR-9012-Q4\'24 Fcst'
          }
        ]
      }
    ];
  };

  const handleProceedToReview = () => {
    setShowReview(true);
  };

  const handleResetTracking = () => {
    if (window.confirm("Are you sure you want to reset the change tracking? This will clear the history of all processed changes.")) {
      changeTrackingService.clearProcessedChanges();
      setShowResetTrackingButton(false);
      // Re-run comparison
      runComparison();
    }
  };

  // Mock reviewing differences, in a real app this would update the Excel files
  const handleReviewComplete = (results) => {
    // Mark changes as processed
    if (results.appliedChanges && results.appliedChanges.length > 0) {
      const changeIds = results.appliedChanges.map(change => change.changeId);
      changeTrackingService.markChangesAsProcessed(changeIds);
    }
    
    if (onComplete) {
      onComplete(results);
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to compare files.</div>;
  }

  if (!originalFile || !originalSheet || !comparisonFile || !comparisonSheet) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please select both files and sheets first.</div>;
  }

  if (comparing) {
    return <LoadingSpinner message="Comparing Excel sheets..." />;
  }

  if (showReview && differences) {
    return (
      <div style={{ 
        padding: '2rem', 
        background: '#fff', 
        borderRadius: '8px',
        border: '1px solid #dde2e9'
      }}>
        <h3>Review Differences</h3>
        <p>In a complete implementation, this is where you would review each difference and decide whether to accept, deny, or modify the changes.</p>
        
        <div style={{ 
          background: '#e8f1fd', 
          padding: '1rem', 
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <p>Found {differences.reduce((total, diff) => total + diff.columns.length, 0)} differences across {differences.length} rows.</p>
          <button
            onClick={handleReviewComplete}
            style={{
              background: '#0061d5',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Complete Review (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      background: '#fff', 
      borderRadius: '8px',
      border: '1px solid #dde2e9'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: 0 }}>Comparison Tool</h3>
        
        {/* Reset tracking button */}
        {showResetTrackingButton && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={handleResetTracking}
              style={{
                background: '#f0f0f0',
                border: '1px solid #ccc',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Reset Change Tracking
            </button>
            <span style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
              This will enable reviewing changes that were previously processed
            </span>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div style={{ marginBottom: '1.5rem' }}>
        <div><strong>Original File:</strong> {originalFile.name} / {originalSheet}</div>
        <div><strong>Comparison File:</strong> {comparisonFile.name} / {comparisonSheet}</div>
        {consolidatedFile && <div><strong>Consolidated File:</strong> {consolidatedFile.name} / {consolidatedSheet}</div>}
      </div>

      {!loading && !differences && (
        <div style={{ marginTop: '1.5rem' }}>
          <p>Click the button below to compare the selected Excel sheets.</p>
          <button
            onClick={runComparison}
            style={{
              background: '#0061d5',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Run Comparison
          </button>
        </div>
      )}

      {differences && differences.length > 0 && (
        <div style={{ 
          background: '#e8f1fd', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginTop: '1.5rem',
          border: '1px solid #0061d5'
        }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: '500', 
            color: '#0061d5',
            marginBottom: '1rem'
          }}>
            Found {differences.reduce((total, diff) => total + diff.columns.length, 0)} differences 
            across {differences.length} rows
            {duplicatesFound > 0 && (
              <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '0.5rem' }}>
                ({duplicatesFound} duplicate changes were filtered out)
              </span>
            )}
          </div>
          
          <button
            onClick={handleProceedToReview}
            style={{
              background: '#0061d5',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Proceed to Review Process
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparisonResult;