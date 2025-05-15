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
  
  // Current difference review
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [currentColIndex, setCurrentColIndex] = useState(0);
  
  // Track review stage (1: View, 2: Action, 3: Commentary, 4: Confirm)
  const [reviewStage, setReviewStage] = useState(1);
  
  // Store R Commentary for each difference
  const [reviewCommentary, setReviewCommentary] = useState("");
  const [modifiedValue, setModifiedValue] = useState(null);
  
  // Store decisions for tracking
  const [reviewDecisions, setReviewDecisions] = useState([]);

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
        'Plan Commentary': 'Increasing Q1-Q2 budget for new campaign launches',
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
        'Plan Commentary': 'Reducing Q3 forecast due to EMEA market conditions',
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
        'Plan Commentary': 'Consolidating training budgets across all quarters',
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
    // Reset review state
    setCurrentDiffIndex(0);
    setCurrentColIndex(0);
    setReviewStage(1);
    setReviewDecisions([]);
    setReviewCommentary("");
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
  
  // Get current difference and column
  const currentDiff = differences ? differences[currentDiffIndex] : null;
  const currentColDiff = currentDiff ? currentDiff.columns[currentColIndex] : null;
  
  // Handle Action selection (Accept, Deny, Modify)
  const handleAction = (action) => {
    if (!currentDiff || !currentColDiff) return;
    
    const column = currentColDiff.column;
    const oldVal = currentColDiff.old_value;
    const newVal = currentColDiff.new_value;
    
    let finalValue;
    let actionText = "";
    
    if (action === 'accept') {
      actionText = "Accepted";
      finalValue = newVal;  // Use new value
    } else if (action === 'deny') {
      actionText = "Denied";
      finalValue = oldVal;  // Revert to old value
    } else if (action === 'modify') {
      actionText = "Modified";
      // Use the value from the input field
      finalValue = modifiedValue !== null ? modifiedValue : newVal;
    }
    
    // Create a temporary decision record
    const decision = {
      diffIndex: currentDiffIndex,
      colIndex: currentColIndex,
      action: actionText,
      field: column,
      previousValue: oldVal,
      newValue: finalValue,
      rCommentary: ''  // Will be filled in next step
    };
    
    // Store the decision temporarily
    setReviewDecisions(prev => [...prev, decision]);
    
    // Move to commentary stage
    setReviewStage(3);
  };
  
  // Handle modify value change
  const handleModifyValueChange = (e) => {
    setModifiedValue(parseInt(e.target.value, 10));
  };
  
  // Handle commentary submission
  const handleCommentarySubmit = () => {
    // Update the last decision with R Commentary
    setReviewDecisions(prev => {
      const updated = [...prev];
      updated[updated.length - 1].rCommentary = reviewCommentary;
      return updated;
    });
    
    // Reset commentary
    setReviewCommentary('');
    
    // Move to confirmation stage
    setReviewStage(4);
  };
  
  // Handle confirmation and move to next
  const handleConfirmChange = () => {
    // Move to next column or difference
    moveToNext();
  };
  
  // Reset review for current item
  const handleResetReview = () => {
    // Remove the last decision
    setReviewDecisions(prev => prev.slice(0, prev.length - 1));
    
    // Reset to view stage
    setReviewStage(1);
    setModifiedValue(null);
  };
  
  // Move to next difference or column
  const moveToNext = () => {
    // Reset review stage
    setReviewStage(1);
    setModifiedValue(null);
    
    // If there are more columns in the current difference
    if (currentDiff && currentColIndex < currentDiff.columns.length - 1) {
      setCurrentColIndex(currentColIndex + 1);
    } 
    // Otherwise move to the next difference
    else if (currentDiffIndex < differences.length - 1) {
      setCurrentDiffIndex(currentDiffIndex + 1);
      setCurrentColIndex(0);
    } 
    // All differences reviewed
    else {
      // Complete review process
      handleReviewComplete();
    }
  };

  // Mock reviewing differences, in a real app this would update the Excel files
  const handleReviewComplete = () => {
    // Mark changes as processed
    const changeIds = reviewDecisions.map(decision => {
      const diff = differences[decision.diffIndex];
      const col = diff.columns[decision.colIndex];
      return col.changeId || `${diff['BH Level 5']}-${diff['C_Line']}-${col.column}`;
    });
    
    changeTrackingService.markChangesAsProcessed(changeIds);
    
    if (onComplete) {
      onComplete({
        appliedChanges: reviewDecisions,
        consolidated: consolidatedFile ? true : false
      });
    }
    
    setWorkflowCompleted(true);
  };
  
  // State for complete workflow
  const [workflowCompleted, setWorkflowCompleted] = useState(false);

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to compare files.</div>;
  }

  if (!originalFile || !originalSheet || !comparisonFile || !comparisonSheet) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please select both files and sheets first.</div>;
  }

  if (comparing) {
    return <LoadingSpinner message="Comparing Excel sheets..." />;
  }
  
  if (workflowCompleted) {
    return (
      <div style={{ 
        padding: '2rem', 
        background: '#e6f4ea', 
        borderRadius: '8px',
        border: '1px solid #16813d',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#16813d', marginTop: 0 }}>
          <span style={{ marginRight: '0.5rem' }}>✓</span>
          Comparison Completed Successfully
        </h3>
        <p>All changes have been successfully processed and saved.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <strong>{reviewDecisions.length} changes were processed:</strong>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1rem'
          }}>
            <li>
              <span style={{ 
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#e6f4ea',
                borderRadius: '4px',
                fontWeight: '500',
                color: '#16813d'
              }}>
                {reviewDecisions.filter(d => d.action === "Accepted").length} Accepted
              </span>
            </li>
            <li>
              <span style={{ 
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                fontWeight: '500',
                color: '#e74c3c'
              }}>
                {reviewDecisions.filter(d => d.action === "Denied").length} Denied
              </span>
            </li>
            <li>
              <span style={{ 
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#fff8e6',
                borderRadius: '4px',
                fontWeight: '500',
                color: '#f39c12'
              }}>
                {reviewDecisions.filter(d => d.action === "Modified").length} Modified
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (showReview && differences) {
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
        
        {currentDiff && currentColDiff && (
          <>
            {/* Stage 1: View Difference */}
            {reviewStage === 1 && (
              <div>
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
                    padding: '1rem',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>Plan Commentary:</div>
                    <div style={{ fontSize: '1rem', fontStyle: 'italic' }}>{currentDiff['Plan Commentary'] || 'No commentary available'}</div>
                  </div>
                  
                  <div style={{ 
                    background: 'white', 
                    border: '1px solid #dde2e9', 
                    borderRadius: '4px', 
                    padding: '1rem'
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
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button 
                    onClick={() => setReviewStage(2)}
                    style={{
                      background: '#0061d5',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Review Change →
                  </button>
                </div>
              </div>
            )}
            
            {/* Stage 2: Take Action */}
            {reviewStage === 2 && (
              <div>
                <div style={{ 
                  padding: '1.5rem', 
                  background: '#f9f9f9', 
                  borderRadius: '8px',
                  border: '1px solid #dde2e9',
                  marginBottom: '1.5rem'
                }}>
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
                      {currentDiff['BH Level 5']} ({currentDiff['C_Line']}) - {currentColDiff.column}
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
                    padding: '1.5rem', 
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #dde2e9',
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0' }}>Choose an action:</h4>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <button 
                        onClick={() => handleAction('accept')}
                        style={{
                          flex: 1,
                          background: '#16813d',
                          color: 'white',
                          border: 'none',
                          padding: '1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>✓</span>
                        Accept Change
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                          Use new value: ${currentColDiff.new_value.toLocaleString()}
                        </span>
                      </button>
                      <button 
                        onClick={() => handleAction('deny')}
                        style={{
                          flex: 1,
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>✕</span>
                        Deny Change
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                          Keep original: ${currentColDiff.old_value.toLocaleString()}
                        </span>
                      </button>
                      <button
                        onClick={() => handleAction('modify')}
                        style={{
                          flex: 1,
                          background: '#f39c12',
                          color: 'white',
                          border: 'none',
                          padding: '1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>✎</span>
                        Modify
                        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                          Enter custom value
                        </span>
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label htmlFor="modified-value" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Custom value (if modifying):
                      </label>
                      <input 
                        type="number" 
                        id="modified-value" 
                        defaultValue={currentColDiff.new_value}
                        onChange={handleModifyValueChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #dde2e9',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    onClick={() => setReviewStage(1)}
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
                    ← Back to Details
                  </button>
                </div>
              </div>
            )}
            
            {/* Stage 3: Add R Commentary */}
            {reviewStage === 3 && (
              <div>
                <div style={{ 
                  padding: '1.5rem', 
                  background: '#f9f9f9', 
                  borderRadius: '8px',
                  border: '1px solid #dde2e9',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    background: 'white', 
                    border: '1px solid #dde2e9', 
                    borderRadius: '4px', 
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 1rem 0', 
                      color: '#0061d5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>
                        {reviewDecisions[reviewDecisions.length - 1]?.action === "Accepted" && "✓"}
                        {reviewDecisions[reviewDecisions.length - 1]?.action === "Denied" && "✕"}
                        {reviewDecisions[reviewDecisions.length - 1]?.action === "Modified" && "✎"}
                      </span>
                      {currentDiff['BH Level 5']} ({currentDiff['C_Line']}) - {currentColDiff.column}
                    </h4>
                    
                    <div style={{ 
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>Previous Value:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#e74c3c' }}>
                          ${currentColDiff.old_value.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>New Value:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#16813d' }}>
                          ${reviewDecisions[reviewDecisions.length - 1]?.newValue.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.25rem' }}>Action:</div>
                        <div style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          backgroundColor: 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Accepted' ? '#e6f4ea' : 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Denied' ? '#ffebee' : 
                            '#fff8e6',
                          color: 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Accepted' ? '#16813d' : 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Denied' ? '#e74c3c' : 
                            '#f39c12'
                        }}>
                          {reviewDecisions[reviewDecisions.length - 1]?.action}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Add Review Commentary</h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#5a5a5a', fontSize: '0.9rem' }}>
                        Please provide any comments about this change (will be added as "R Commentary"):
                      </p>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>Plan Commentary (read-only):</div>
                        <div style={{ 
                          padding: '0.75rem',
                          background: '#f5f5f5',
                          borderRadius: '4px',
                          fontStyle: 'italic'
                        }}>
                          {currentDiff['Plan Commentary'] || 'No commentary available'}
                        </div>
                      </div>
                      
                      <div>
                        <textarea
                          value={reviewCommentary}
                          onChange={(e) => setReviewCommentary(e.target.value)}
                          placeholder="Enter your review commentary for this change..."
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #dde2e9',
                            borderRadius: '4px',
                            minHeight: '100px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button 
                    onClick={handleResetReview}
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
                    ← Back to Action
                  </button>
                  <button 
                    onClick={handleCommentarySubmit}
                    style={{
                      background: '#0061d5',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Continue to Confirm →
                  </button>
                </div>
              </div>
            )}
            
            {/* Stage 4: Confirmation */}
            {reviewStage === 4 && (
              <div>
                <div style={{ 
                  padding: '1.5rem', 
                  background: '#e6f4ea', 
                  borderRadius: '8px',
                  border: '1px solid #16813d',
                  marginBottom: '1.5rem'
                }}>
                  <h4 style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#16813d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>✓</span> Change Processed
                  </h4>
                  
                  <div style={{ 
                    background: 'white',
                    border: '1px solid #dde2e9',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Entity:</div>
                      <div style={{ fontWeight: '500' }}>
                        {currentDiff['BH Level 5']} - {currentDiff['BH Level 6'] || 'N/A'} ({currentDiff['C_Line']})
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Field:</div>
                      <div style={{ fontWeight: '500' }}>{currentColDiff.column}</div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Previous Value:</div>
                        <div style={{ fontSize: '1.1rem', color: '#e74c3c' }}>
                          ${currentColDiff.old_value.toLocaleString()}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>New Value:</div>
                        <div style={{ fontSize: '1.1rem', color: '#16813d' }}>
                          ${reviewDecisions[reviewDecisions.length - 1]?.newValue.toLocaleString()}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Action:</div>
                        <div style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          backgroundColor: 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Accepted' ? '#e6f4ea' : 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Denied' ? '#ffebee' : 
                            '#fff8e6',
                          color: 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Accepted' ? '#16813d' : 
                            reviewDecisions[reviewDecisions.length - 1]?.action === 'Denied' ? '#e74c3c' : 
                            '#f39c12'
                        }}>
                          {reviewDecisions[reviewDecisions.length - 1]?.action}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'white',
                    border: '1px solid #dde2e9',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>Plan Commentary (unchanged):</div>
                    <div style={{ 
                      padding: '0.75rem',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      marginBottom: '1rem'
                    }}>
                      {currentDiff['Plan Commentary'] || 'No commentary available'}
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>R Commentary (new):</div>
                    <div style={{ 
                      padding: '0.75rem',
                      background: '#f5f5f5',
                      borderRadius: '4px'
                    }}>
                      {reviewCommentary || 'No review commentary provided'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={handleConfirmChange}
                    style={{
                      background: '#16813d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>✓</span>
                    {currentDiffIndex < differences.length - 1 || currentColIndex < currentDiff.columns.length - 1 ? 
                      'Confirm and Continue to Next' : 
                      'Confirm and Complete'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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