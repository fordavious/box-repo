// src/components/ExcelComparison/DifferencesReview.js
import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';
import Console from '../Layout/Console';

const DifferencesReview = ({ 
  differences, 
  originalFile, 
  originalSheet,
  forecastColumns,
  consolidatedFile,
  consolidatedSheet,
  onComplete 
}) => {
  const { isAuthenticated } = useBoxAuth();
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [currentColIndex, setCurrentColIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [changes, setChanges] = useState([]);
  const [changesToApply, setChangesToApply] = useState([]);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Track decision history to enable going back
  const [reviewHistory, setReviewHistory] = useState([]);
  const [reviewedChanges, setReviewedChanges] = useState(new Set());
  
  // Track progress
  const [progress, setProgress] = useState(0);
  const [totalChanges, setTotalChanges] = useState(0);

  // Add log entry to console
  const addConsoleLog = (message) => {
    setConsoleOutput(prev => [...prev, {
      type: 'log',
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Add error to console
  const addConsoleError = (message) => {
    setConsoleOutput(prev => [...prev, {
      type: 'error',
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  useEffect(() => {
    if (differences && differences.length > 0) {
      // Calculate total changes for progress tracking
      const total = differences.reduce((sum, diff) => sum + diff.columns.length, 0);
      setTotalChanges(total);
      
      addConsoleLog(`Starting review of ${differences.length} rows with differences (${total} total changes).`);
    }
  }, [differences]);

  // Current difference and column
  const currentDiff = differences ? differences[currentDiffIndex] : null;
  const currentColDiff = currentDiff ? currentDiff.columns[currentColIndex] : null;

  // Calculate progress percentage
  useEffect(() => {
    if (totalChanges > 0) {
      // Calculate how many changes we've gone through
      let processed = 0;
      for (let i = 0; i < currentDiffIndex; i++) {
        processed += differences[i].columns.length;
      }
      processed += currentColIndex;
      
      const percentage = Math.floor((processed / totalChanges) * 100);
      setProgress(percentage);
    }
  }, [currentDiffIndex, currentColIndex, differences, totalChanges]);

  // Handle action selection (Accept, Deny, Modify)
  const handleAction = (action, modifiedValue = null) => {
    if (!currentDiff || !currentColDiff) return;

    const column = currentColDiff.column;
    const oldVal = currentColDiff.old_value;
    const newVal = currentColDiff.new_value;
    
    let finalValue = newVal;
    let actionText = "";
    
    if (action === 'A') {
      actionText = "Accepted";
      // final_value already set to new_val
    } else if (action === 'D') {
      actionText = "Denied";
      finalValue = oldVal;  // Revert to old value
    } else if (action === 'M') {
      actionText = "Modified";
      finalValue = modifiedValue;
    }
    
    // Get comment for this change
    const comment = document.getElementById('change-comment').value || '';
    
    // Create change record
    const changeRecord = {
      'BH Level 5': currentDiff['BH Level 5'],
      'BH Level 6': currentDiff['BH Level 6'] || '',
      'C_Line': currentDiff['C_Line'],
      'Pillar Activity': currentDiff['Pillar Activity'],
      'Region': currentDiff['Region'],
      'Div': currentDiff['Div'],
      'Vendor Name': currentDiff['Vendor Name'],
      'column': column,
      'previous_value': oldVal,
      'final_value': finalValue,
      'action': actionText,
      'comment': comment,
      'changeId': currentColDiff.changeId || `${currentDiff['BH Level 5']}-${currentDiff['C_Line']}-${column}`
    };
    
    // Log the action
    addConsoleLog(`${column}: ${actionText} - Previous Value: $${oldVal.toLocaleString()}, New Value: $${finalValue.toLocaleString()}${comment ? ` (Comment: ${comment})` : ''}`);
    
    // Store for log
    setChanges(prev => [...prev, changeRecord]);
    
    // Store for application (only if not denied)
    if (action !== 'D') {
      setChangesToApply(prev => [...prev, {
        'row_idx': currentDiff.row_idx,
        'column': column,
        'value': finalValue
      }]);
    }
    
    // Add to reviewedChanges set
    setReviewedChanges(prev => {
      const newSet = new Set(prev);
      newSet.add(`${currentDiffIndex}-${currentColIndex}`);
      return newSet;
    });
    
    // Save current position to history before moving
    const newHistoryEntry = { 
      diffIndex: currentDiffIndex, 
      colIndex: currentColIndex
    };
    setReviewHistory(prev => [...prev, newHistoryEntry]);
    
    // Move to next difference
    moveToNext();
  };

  // Move to next difference or column
  const moveToNext = () => {
    // Clear the comment field
    if (document.getElementById('change-comment')) {
      document.getElementById('change-comment').value = '';
    }
    
    // If there are more columns in the current difference
    if (currentDiff && currentColIndex < currentDiff.columns.length - 1) {
      setCurrentColIndex(currentColIndex + 1);
    } 
    // Otherwise move to the next difference
    else if (currentDiffIndex < differences.length - 1) {
      setCurrentDiffIndex(currentDiffIndex + 1);
      setCurrentColIndex(0);
      
      // Log moving to next row
      const nextDiff = differences[currentDiffIndex + 1];
      addConsoleLog(`Moving to next row: BH Level 5: ${nextDiff['BH Level 5']}, C_Line: ${nextDiff['C_Line']}`);
    } 
    // All differences reviewed
    else {
      addConsoleLog('All differences have been reviewed.');
      setReviewComplete(true);
    }
  };

  // Go back to the previous change
  const moveToPrevious = () => {
    // Only allow going back if we have history
    if (reviewHistory.length === 0) return;
    
    // Get and remove the last item from history
    const newHistory = [...reviewHistory];
    const prevPosition = newHistory.pop();
    
    // Update history
    setReviewHistory(newHistory);
    
    // Restore previous position
    setCurrentDiffIndex(prevPosition.diffIndex);
    setCurrentColIndex(prevPosition.colIndex);
    
    // Log moving to previous change
    addConsoleLog('Moving back to previous change.');
  };

  // Skip current change
  const skipChange = () => {
    addConsoleLog(`Skipped ${currentColDiff.column} for ${currentDiff['BH Level 5']} / ${currentDiff['C_Line']}`);
    moveToNext();
  };

  // Handle Apply Changes button
  const handleApplyChanges = async () => {
    if (changesToApply.length === 0) {
      addConsoleError('No changes to apply.');
      return;
    }
    
    setApplyingChanges(true);
    addConsoleLog('Applying changes to Excel files...');
    
    try {
      // Simulate API calls with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log changes
      addConsoleLog(`Updating ${originalFile.name} / ${originalSheet} with ${changesToApply.length} changes.`);
      
      // Update consolidated file if specified
      if (consolidatedFile && consolidatedSheet) {
        addConsoleLog(`Updating consolidated file: ${consolidatedFile.name} / ${consolidatedSheet}`);
      }
      
      // Log changes to CSV
      addConsoleLog(`Creating change log in Box with ${changes.length} entries.`);
      
      setSuccessMessage('All changes have been applied successfully!');
      addConsoleLog('All changes have been applied successfully!');
      
      // Notify parent component
      if (onComplete) {
        onComplete({
          changes,
          changesToApply,
          originalFile,
          originalSheet,
          consolidatedFile,
          consolidatedSheet,
          appliedChanges: changes.map(change => ({
            ...change,
            changeId: change.changeId
          }))
        });
      }
    } catch (err) {
      setError(`Failed to apply changes: ${err.message}`);
      addConsoleError(`Failed to apply changes: ${err.message}`);
    } finally {
      setApplyingChanges(false);
    }
  };

  // Handle "Finish" button
  const handleFinish = async () => {
    // First ask for confirmation
    if (!window.confirm('Are you sure you want to finish? This will apply all changes to Box and complete the process.')) {
      return;
    }
    
    setSubmitting(true);
    addConsoleLog('Finalizing changes and pushing to Box...');
    
    try {
      // Simulate API calls with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Apply any pending changes first
      if (changesToApply.length > 0) {
        // Update original file
        addConsoleLog(`Updating ${originalFile.name} / ${originalSheet} with ${changesToApply.length} changes.`);
        
        // Update consolidated file if specified
        if (consolidatedFile && consolidatedSheet) {
          addConsoleLog(`Updating consolidated file: ${consolidatedFile.name} / ${consolidatedSheet}`);
        }
        
        // Log changes to CSV
        addConsoleLog(`Creating change log in Box with ${changes.length} entries.`);
      }
      
      setSuccessMessage('All changes have been successfully applied to Box!');
      addConsoleLog('✓ Process completed successfully.');
      
      // Notify parent component
      if (onComplete) {
        onComplete({
          changes,
          changesToApply,
          originalFile,
          originalSheet,
          consolidatedFile,
          consolidatedSheet,
          appliedChanges: changes.map(change => ({
            ...change,
            changeId: change.changeId
          })),
          completed: true // Indicate this was a final submission
        });
      }
    } catch (err) {
      setError(`Failed to finish process: ${err.message}`);
      addConsoleError(`Failed to finish process: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to review differences.</div>;
  }

  if (!differences || differences.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>No differences to review.</div>;
  }

  if (loading) {
    return <LoadingSpinner message="Loading difference details..." />;
  }

  if (applyingChanges || submitting) {
    return (
      <div>
        <LoadingSpinner message={submitting ? "Finalizing and pushing to Box..." : "Applying changes to Excel files..."} />
        <Console messages={consoleOutput} />
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: 0 }}>Review Complete</h3>
        </div>
        
        {successMessage && (
          <div style={{ 
            background: '#e6f4ea', 
            color: '#16813d', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <div>{successMessage}</div>
          </div>
        )}
        
        {error && <ErrorMessage message={error} />}
        
        <div style={{ 
          padding: '1.5rem', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          border: '1px solid #dde2e9',
          marginBottom: '1.5rem'
        }}>
          <p>All differences have been reviewed.</p>
          <p><strong>Total changes to apply:</strong> {changesToApply.length}</p>
          <p><strong>Changes by action:</strong></p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Accepted: {changes.filter(c => c.action === 'Accepted').length}</li>
            <li>Denied: {changes.filter(c => c.action === 'Denied').length}</li>
            <li>Modified: {changes.filter(c => c.action === 'Modified').length}</li>
          </ul>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={handleApplyChanges}
            disabled={changesToApply.length === 0}
            style={{
              background: changesToApply.length === 0 ? '#bdc3c7' : '#0061d5',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: changesToApply.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Apply Changes
          </button>
          
          <button
            onClick={handleFinish}
            style={{
              background: '#16813d',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Finish and Submit to Box
          </button>
        </div>
        
        <Console messages={consoleOutput} />
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <h3 style={{ margin: 0 }}>Review Differences</h3>
        <div style={{ 
          fontSize: '0.9rem', 
          color: '#5a5a5a', 
          background: '#e8f1fd', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px'
        }}>
          Row {currentDiffIndex + 1} of {differences.length}, Change {currentColIndex + 1} of {currentDiff?.columns.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{ 
        width: '100%',
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '1rem',
        overflow: 'hidden'
      }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${progress}%`, 
            backgroundColor: '#0061d5',
            transition: 'width 0.3s ease'
          }}
        ></div>
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#5a5a5a', 
        textAlign: 'right', 
        marginBottom: '1.5rem' 
      }}>
        {Math.floor(progress)}% complete
      </div>

      {error && <ErrorMessage message={error} />}

      {currentDiff && currentColDiff && (
        <div style={{ 
          padding: '1.5rem', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          border: '1px solid #dde2e9',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>BH Level 5:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['BH Level 5']}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>BH Level 6:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['BH Level 6'] || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>C_Line:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['C_Line']}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Pillar Activity:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['Pillar Activity']}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Region:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['Region']}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Div:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['Div']}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Vendor Name:</div>
              <div style={{ fontWeight: '500' }}>{currentDiff['Vendor Name']}</div>
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            border: '1px solid #dde2e9', 
            borderRadius: '4px', 
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              color: '#0061d5'
            }}>
              {currentColDiff.column}
            </h4>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>Previous Value:</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '500', color: '#e74c3c' }}>
                  ${currentColDiff.old_value.toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>New Value:</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '500', color: '#16813d' }}>
                  ${currentColDiff.new_value.toLocaleString()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>Difference:</div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '500', 
                  color: currentColDiff.new_value > currentColDiff.old_value ? '#16813d' : '#e74c3c'
                }}>
                  {currentColDiff.new_value > currentColDiff.old_value ? '+' : ''}
                  ${(currentColDiff.new_value - currentColDiff.old_value).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: 'white', 
            border: '1px solid #dde2e9', 
            borderRadius: '4px', 
            padding: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <button 
                onClick={() => handleAction('A')}
                style={{
                  flex: 1,
                  background: '#16813d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Accept (A)
              </button>
              <button 
                onClick={() => handleAction('D')}
                style={{
                  flex: 1,
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Deny (D)
              </button>
              <button 
                onClick={() => {
                  const newValue = document.getElementById('modified-value').value;
                  handleAction('M', parseInt(newValue, 10));
                }}
                style={{
                  flex: 1,
                  background: '#f39c12',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Modify (M)
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="modified-value" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Enter new value:
              </label>
              <input 
                type="number" 
                id="modified-value" 
                defaultValue={currentColDiff.new_value}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dde2e9',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div>
              <label htmlFor="change-comment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Comment:
              </label>
              <input 
                type="text" 
                id="change-comment" 
                placeholder="Enter comment for this change"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dde2e9',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #dde2e9'
          }}>
            <button 
              onClick={moveToPrevious}
              disabled={reviewHistory.length === 0}
              style={{
                background: reviewHistory.length === 0 ? '#f5f7fa' : '#f5f7fa',
                color: reviewHistory.length === 0 ? '#bdc3c7' : '#5a5a5a',
                border: '1px solid #dde2e9',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: reviewHistory.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ← Previous Change
            </button>
            <button 
              onClick={skipChange}
              style={{
                background: '#f5f7fa',
                color: '#5a5a5a',
                border: '1px solid #dde2e9',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Skip →
            </button>
          </div>
        </div>
      )}
      
      <Console messages={consoleOutput} />
    </div>
  );
};

export default DifferencesReview;