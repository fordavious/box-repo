import React, { useState } from 'react';
import { BoxAuthProvider } from './components/Auth/BoxAuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import FolderBrowser from './components/FileExplorer/FolderBrowser';
import FileSelector from './components/FileExplorer/FileSelector';
import SheetSelector from './components/ExcelComparison/SheetSelector';
import ComparisonResult from './components/ExcelComparison/ComparisonResult';
import Dashboard from './components/Dashboard/Dashboard';
import ExcelPreview from './components/ExcelComparison/ExcelPreview';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorMessage from './components/Common/ErrorMessage';

function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState('compare'); // 'compare', 'dashboard', 'preview'
  
  // State for the comparison workflow
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for consolidated file (first step)
  const [useConsolidated, setUseConsolidated] = useState(true);
  const [consolidatedFolder, setConsolidatedFolder] = useState(null);
  const [consolidatedFile, setConsolidatedFile] = useState(null);
  const [consolidatedSheet, setConsolidatedSheet] = useState(null);
  
  // State for original file
  const [originalFolder, setOriginalFolder] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [originalSheet, setOriginalSheet] = useState(null);
  
  // State for comparison file
  const [comparisonFolder, setComparisonFolder] = useState(null);
  const [comparisonFile, setComparisonFile] = useState(null);
  const [comparisonSheet, setComparisonSheet] = useState(null);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Completion state
  const [workflowCompleted, setWorkflowCompleted] = useState(false);

  // State for selection progress within each step
  const [consolidatedStep, setConsolidatedStep] = useState(1); // 1=folder, 2=file, 3=sheet
  const [originalStep, setOriginalStep] = useState(1); // 1=folder, 2=file, 3=sheet
  const [comparisonStep, setComparisonStep] = useState(1); // 1=folder, 2=file, 3=sheet

  // Handle toggle consolidated usage
  const handleToggleConsolidated = (e) => {
    setUseConsolidated(e.target.checked);
    
    // Reset consolidated selections if turning off
    if (!e.target.checked) {
      setConsolidatedFolder(null);
      setConsolidatedFile(null);
      setConsolidatedSheet(null);
      setConsolidatedStep(1);
    }
  };

  // Handle consolidated folder selection
  const handleConsolidatedFolderSelect = (folder) => {
    setConsolidatedFolder(folder);
    setConsolidatedStep(2); // Move to file selection
  };

  // Handle consolidated file selection
  const handleConsolidatedFileSelect = (file) => {
    setConsolidatedFile(file);
    setConsolidatedStep(3); // Move to sheet selection
  };

  // Handle consolidated sheet selection
  const handleConsolidatedSheetSelect = (sheet) => {
    setConsolidatedSheet(sheet);
    setConsolidatedStep(4); // Complete
  };

  // Handle proceeding from consolidated step
  const handleConsolidatedStepComplete = () => {
    if (!useConsolidated || (consolidatedFolder && consolidatedFile && consolidatedSheet)) {
      setCurrentStep(2); // Proceed to original file
      setOriginalStep(1); // Reset to folder selection
    } else {
      setError('Please complete all consolidated selections before proceeding.');
    }
  };

  // Handle original folder selection
  const handleOriginalFolderSelect = (folder) => {
    setOriginalFolder(folder);
    setOriginalStep(2); // Move to file selection
  };

  // Handle original file selection
  const handleOriginalFileSelect = (file) => {
    setOriginalFile(file);
    setOriginalStep(3); // Move to sheet selection
  };

  // Handle original sheet selection
  const handleOriginalSheetSelect = (sheet) => {
    setOriginalSheet(sheet);
    setOriginalStep(4); // Complete
  };

  // Handle proceeding from original step
  const handleOriginalStepComplete = () => {
    if (originalFolder && originalFile && originalSheet) {
      setCurrentStep(3); // Proceed to comparison file
      setComparisonStep(1); // Reset to folder selection
    } else {
      setError('Please complete all original file selections before proceeding.');
    }
  };

  // Handle comparison folder selection
  const handleComparisonFolderSelect = (folder) => {
    setComparisonFolder(folder);
    setComparisonStep(2); // Move to file selection
  };

  // Handle comparison file selection
  const handleComparisonFileSelect = (file) => {
    setComparisonFile(file);
    setComparisonStep(3); // Move to sheet selection
  };

  // Handle comparison sheet selection
  const handleComparisonSheetSelect = (sheet) => {
    setComparisonSheet(sheet);
    setComparisonStep(4); // Complete
  };

  // Handle proceeding from comparison step
  const handleComparisonStepComplete = () => {
    if (comparisonFolder && comparisonFile && comparisonSheet) {
      setCurrentStep(4); // Proceed to comparison
    } else {
      setError('Please complete all comparison file selections before proceeding.');
    }
  };

  // Handle comparison completion
  const handleComparisonComplete = () => {
    setWorkflowCompleted(true);
    
    // After 5 seconds, reset the workflow
    setTimeout(() => {
      resetWorkflow();
    }, 5000);
  };

  // Reset workflow
  const resetWorkflow = () => {
    setCurrentStep(1);
    setOriginalFolder(null);
    setOriginalFile(null);
    setOriginalSheet(null);
    setComparisonFolder(null);
    setComparisonFile(null);
    setComparisonSheet(null);
    setUseConsolidated(true);
    setConsolidatedFolder(null);
    setConsolidatedFile(null);
    setConsolidatedSheet(null);
    setConsolidatedStep(1);
    setOriginalStep(1);
    setComparisonStep(1);
    setWorkflowCompleted(false);
    setError(null);
  };

  return (
    <BoxAuthProvider>
      <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {error && <ErrorMessage message={error} />}
          
          {/* Navigation Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #dde2e9',
            paddingBottom: '0.5rem'
          }}>
            <button 
              onClick={() => setActiveTab('compare')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'compare' ? '2px solid #0061d5' : 'none',
                padding: '0.75rem 1rem',
                color: activeTab === 'compare' ? '#0061d5' : '#5a5a5a',
                fontWeight: activeTab === 'compare' ? '500' : 'normal',
                cursor: 'pointer'
              }}
            >
              Excel Comparison
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'dashboard' ? '2px solid #0061d5' : 'none',
                padding: '0.75rem 1rem',
                color: activeTab === 'dashboard' ? '#0061d5' : '#5a5a5a',
                fontWeight: activeTab === 'dashboard' ? '500' : 'normal',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                if (originalFile && originalSheet) {
                  setActiveTab('preview');
                } else {
                  alert('Please select a file and sheet to preview first.');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'preview' ? '2px solid #0061d5' : 'none',
                padding: '0.75rem 1rem',
                color: activeTab === 'preview' ? '#0061d5' : '#5a5a5a',
                fontWeight: activeTab === 'preview' ? '500' : 'normal',
                cursor: 'pointer',
                opacity: originalFile && originalSheet ? 1 : 0.5
              }}
            >
              Excel Preview
            </button>
          </div>
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Dashboard />
          )}
          
          {/* Excel Preview Tab */}
          {activeTab === 'preview' && (
            <ExcelPreview 
              file={originalFile}
              sheet={originalSheet}
            />
          )}
          
          {/* Comparison Tab */}
          {activeTab === 'compare' && (
            <>
              <div style={{
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0 }}>Box Excel Comparison Tool</h2>
                {currentStep > 1 && (
                  <button 
                    onClick={resetWorkflow}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              
              {/* Workflow steps indicator */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                overflowX: 'auto',
                padding: '0.5rem 0'
              }}>
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 1 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 1 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 1 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 1 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  1. Consolidated File
                </div>
                
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 2 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 2 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 2 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 2 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  2. Original File
                </div>
                
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 3 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 3 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 3 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 3 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  3. Comparison File
                </div>
                
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 4 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 4 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 4 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 4 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  4. Compare
                </div>
              </div>
              
              {/* Step content */}
              <div style={{ 
                padding: '2rem', 
                background: '#fff', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Step 1: Consolidated File Selection */}
                {currentStep === 1 && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <h3 style={{ margin: 0 }}>Step 1: Consolidated File</h3>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        padding: '0.5rem 1rem',
                        background: '#f5f7fa',
                        borderRadius: '4px',
                        border: '1px solid #dde2e9',
                      }}>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={useConsolidated}
                            onChange={handleToggleConsolidated}
                            style={{
                              width: '1.2rem',
                              height: '1.2rem'
                            }}
                          />
                          <span style={{ fontWeight: '500' }}>Include consolidated file</span>
                        </label>
                      </div>
                    </div>
                    
                    {useConsolidated ? (
                      <>
                        {/* Step 1: Folder Selection */}
                        {consolidatedStep === 1 && (
                          <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px', marginBottom: '1.5rem' }}>
                            <FolderBrowser onFolderSelect={handleConsolidatedFolderSelect} />
                          </div>
                        )}
                        
                        {/* Step 2: File Selection */}
                        {consolidatedStep === 2 && consolidatedFolder && (
                          <div>
                            <div style={{ marginBottom: '1rem' }}>
                              <div style={{ 
                                padding: '0.75rem', 
                                backgroundColor: '#e8f1fd',
                                borderRadius: '4px',
                                border: '1px solid #0061d5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '1.2rem' }}>📁</span>
                                  <span style={{ fontWeight: '500' }}>Selected Folder: {consolidatedFolder.name}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setConsolidatedFolder(null);
                                    setConsolidatedStep(1);
                                  }}
                                  style={{
                                    background: 'white',
                                    color: '#5a5a5a',
                                    border: '1px solid #dde2e9',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                            
                            <h4>Select Consolidated File</h4>
                            <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                              <FileSelector 
                                folder={consolidatedFolder} 
                                fileExtension=".xlsx" 
                                onFileSelect={handleConsolidatedFileSelect} 
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Step 3: Sheet Selection */}
                        {consolidatedStep === 3 && consolidatedFolder && consolidatedFile && (
                          <div>
                            <div style={{ marginBottom: '1rem' }}>
                              <div style={{ 
                                padding: '0.75rem', 
                                backgroundColor: '#e8f1fd',
                                borderRadius: '4px',
                                border: '1px solid #0061d5',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '1.2rem' }}>📁</span>
                                  <span style={{ fontWeight: '500' }}>Selected Folder: {consolidatedFolder.name}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setConsolidatedFolder(null);
                                    setConsolidatedFile(null);
                                    setConsolidatedStep(1);
                                  }}
                                  style={{
                                    background: 'white',
                                    color: '#5a5a5a',
                                    border: '1px solid #dde2e9',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  Change
                                </button>
                              </div>
                              <div style={{ 
                                padding: '0.75rem', 
                                backgroundColor: '#e8f1fd',
                                borderRadius: '4px',
                                border: '1px solid #0061d5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                                  <span style={{ fontWeight: '500' }}>Selected File: {consolidatedFile.name}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setConsolidatedFile(null);
                                    setConsolidatedStep(2);
                                  }}
                                  style={{
                                    background: 'white',
                                    color: '#5a5a5a',
                                    border: '1px solid #dde2e9',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                            
                            <h4>Select Consolidated Sheet</h4>
                            <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                              <SheetSelector 
                                file={consolidatedFile} 
                                onSheetSelect={handleConsolidatedSheetSelect} 
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Step 4: Consolidated Selection Complete */}
                        {consolidatedStep === 4 && consolidatedFolder && consolidatedFile && consolidatedSheet && (
                          <div style={{ 
                            padding: '1.5rem',
                            background: '#e6f4ea',
                            borderRadius: '8px',
                            border: '1px solid #16813d',
                            marginBottom: '1.5rem'
                          }}>
                            <h4 style={{ color: '#16813d', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>✓</span> Consolidated File Selection Complete
                            </h4>
                            
                            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📁</span>
                              <strong>Folder:</strong> {consolidatedFolder.name}
                            </div>
                            
                            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📄</span>
                              <strong>File:</strong> {consolidatedFile.name}
                            </div>
                            
                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📊</span>
                              <strong>Sheet:</strong> {consolidatedSheet}
                            </div>
                            
                            <div>
                              <button
                                onClick={() => {
                                  setConsolidatedStep(1);
                                  setConsolidatedFolder(null);
                                  setConsolidatedFile(null);
                                  setConsolidatedSheet(null);
                                }}
                                style={{
                                  background: 'white',
                                  color: '#16813d',
                                  border: '1px solid #16813d',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Change Selection
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        background: '#f5f7fa',
                        borderRadius: '8px',
                        border: '1px solid #dde2e9',
                        marginBottom: '1.5rem'
                      }}>
                        <p>Consolidated file selection is disabled.</p>
                        <p>You will only need to select original and comparison files.</p>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={handleConsolidatedStepComplete}
                        disabled={useConsolidated && consolidatedStep < 4}
                        style={{
                          background: (!useConsolidated || consolidatedStep === 4) ? '#0061d5' : '#bdc3c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: (!useConsolidated || consolidatedStep === 4) ? 'pointer' : 'not-allowed',
                          fontWeight: '500'
                        }}
                      >
                        Continue to Original File
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Original File Selection */}
                {currentStep === 2 && (
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Step 2: Original File</h3>
                    
                    {/* Step 1: Folder Selection */}
                    {originalStep === 1 && (
                      <div>
                        <h4>Select Original Folder</h4>
                        <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                          <FolderBrowser onFolderSelect={handleOriginalFolderSelect} />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: File Selection */}
                    {originalStep === 2 && originalFolder && (
                      <div>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#e8f1fd',
                            borderRadius: '4px',
                            border: '1px solid #0061d5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📁</span>
                              <span style={{ fontWeight: '500' }}>Selected Folder: {originalFolder.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                setOriginalFolder(null);
                                setOriginalStep(1);
                              }}
                              style={{
                                background: 'white',
                                color: '#5a5a5a',
                                border: '1px solid #dde2e9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        
                        <h4>Select Original File</h4>
                        <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                          <FileSelector 
                            folder={originalFolder} 
                            fileExtension=".xlsx" 
                            onFileSelect={handleOriginalFileSelect} 
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Sheet Selection */}
                    {originalStep === 3 && originalFolder && originalFile && (
                      <div>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#e8f1fd',
                            borderRadius: '4px',
                            border: '1px solid #0061d5',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📁</span>
                              <span style={{ fontWeight: '500' }}>Selected Folder: {originalFolder.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                setOriginalFolder(null);
                                setOriginalFile(null);
                                setOriginalStep(1);
                              }}
                              style={{
                                background: 'white',
                                color: '#5a5a5a',
                                border: '1px solid #dde2e9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#e8f1fd',
                            borderRadius: '4px',
                            border: '1px solid #0061d5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📄</span>
                              <span style={{ fontWeight: '500' }}>Selected File: {originalFile.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                setOriginalFile(null);
                                setOriginalStep(2);
                              }}
                              style={{
                                background: 'white',
                                color: '#5a5a5a',
                                border: '1px solid #dde2e9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        
                        <h4>Select Original Sheet</h4>
                        <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                          <SheetSelector 
                            file={originalFile} 
                            onSheetSelect={handleOriginalSheetSelect} 
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 4: Original Selection Complete */}
                    {originalStep === 4 && originalFolder && originalFile && originalSheet && (
                      <div style={{ 
                        padding: '1.5rem',
                        background: '#e6f4ea',
                        borderRadius: '8px',
                        border: '1px solid #16813d',
                        marginBottom: '1.5rem'
                      }}>
                        <h4 style={{ color: '#16813d', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>✓</span> Original File Selection Complete
                        </h4>
                        
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📁</span>
                          <strong>Folder:</strong> {originalFolder.name}
                        </div>
                        
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📄</span>
                          <strong>File:</strong> {originalFile.name}
                        </div>
                        
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📊</span>
                          <strong>Sheet:</strong> {originalSheet}
                        </div>
                        
                        <div>
                          <button
                            onClick={() => {
                              setOriginalStep(1);
                              setOriginalFolder(null);
                              setOriginalFile(null);
                              setOriginalSheet(null);
                            }}
                            style={{
                              background: 'white',
                              color: '#16813d',
                              border: '1px solid #16813d',
                              padding: '0.5rem 1rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Change Selection
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => setCurrentStep(1)}
                        style={{
                          background: '#f5f7fa',
                          color: '#5a5a5a',
                          border: '1px solid #dde2e9',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOriginalStepComplete}
                        disabled={originalStep < 4}
                        style={{
                          background: originalStep === 4 ? '#0061d5' : '#bdc3c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: originalStep === 4 ? 'pointer' : 'not-allowed',
                          fontWeight: '500'
                        }}
                      >
                        Continue to Comparison File
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Comparison File Selection */}
                {currentStep === 3 && (
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Step 3: Comparison File</h3>
                    
                    {/* Step 1: Folder Selection */}
                    {comparisonStep === 1 && (
                      <div>
                        <h4>Select Comparison Folder</h4>
                        <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                          <FolderBrowser onFolderSelect={handleComparisonFolderSelect} />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: File Selection */}
                    {comparisonStep === 2 && comparisonFolder && (
                      <div>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#e8f1fd',
                            borderRadius: '4px',
                            border: '1px solid #0061d5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📁</span>
                              <span style={{ fontWeight: '500' }}>Selected Folder: {comparisonFolder.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                setComparisonFolder(null);
                                setComparisonStep(1);
                              }}
                              style={{
                                background: 'white',
                                color: '#5a5a5a',
                                border: '1px solid #dde2e9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        
                        <h4>Select Comparison File</h4>
                        <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                          <FileSelector 
                            folder={comparisonFolder} 
                            fileExtension=".xlsx" 
                            onFileSelect={handleComparisonFileSelect} 
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Sheet Selection */}
                    {comparisonStep === 3 && comparisonFolder && comparisonFile && (
                      <div>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#e8f1fd',
                            borderRadius: '4px',
                            border: '1px solid #0061d5',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📁</span>
                              <span style={{ fontWeight: '500' }}>Selected Folder: {comparisonFolder.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                setComparisonFolder(null);
                                setComparisonFile(null);
                                setComparisonStep(1);
                              }}
                              style={{
                                background: 'white',
                                color: '#5a5a5a',
                                border: '1px solid #dde2e9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                          <div style={{ 
                            padding: '0.75rem', 
                            backgroundColor: '#e8f1fd',
                            borderRadius: '4px',
                            border: '1px solid #0061d5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>📄</span>
                              <span style={{ fontWeight: '500' }}>Selected File: {comparisonFile.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                setComparisonFile(null);
                                setComparisonStep(2);
                              }}
                              style={{
                                background: 'white',
                                color: '#5a5a5a',
                                border: '1px solid #dde2e9',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        
                        <h4>Select Comparison Sheet</h4>
                        <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #dde2e9', borderRadius: '4px' }}>
                          <SheetSelector 
                            file={comparisonFile} 
                            onSheetSelect={handleComparisonSheetSelect} 
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 4: Comparison Selection Complete */}
                    {comparisonStep === 4 && comparisonFolder && comparisonFile && comparisonSheet && (
                      <div style={{ 
                        padding: '1.5rem',
                        background: '#e6f4ea',
                        borderRadius: '8px',
                        border: '1px solid #16813d',
                        marginBottom: '1.5rem'
                      }}>
                        <h4 style={{ color: '#16813d', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>✓</span> Comparison File Selection Complete
                        </h4>
                        
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📁</span>
                          <strong>Folder:</strong> {comparisonFolder.name}
                        </div>
                        
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📄</span>
                          <strong>File:</strong> {comparisonFile.name}
                        </div>
                        
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📊</span>
                          <strong>Sheet:</strong> {comparisonSheet}
                        </div>
                        
                        <div>
                          <button
                            onClick={() => {
                              setComparisonStep(1);
                              setComparisonFolder(null);
                              setComparisonFile(null);
                              setComparisonSheet(null);
                            }}
                            style={{
                              background: 'white',
                              color: '#16813d',
                              border: '1px solid #16813d',
                              padding: '0.5rem 1rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Change Selection
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => setCurrentStep(2)}
                        style={{
                          background: '#f5f7fa',
                          color: '#5a5a5a',
                          border: '1px solid #dde2e9',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleComparisonStepComplete}
                        disabled={comparisonStep < 4}
                        style={{
                          background: comparisonStep === 4 ? '#0061d5' : '#bdc3c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: comparisonStep === 4 ? 'pointer' : 'not-allowed',
                          fontWeight: '500'
                        }}
                      >
                        Continue to Comparison
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Comparison Results */}
                {currentStep === 4 && (
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Step 4: Compare Excel Sheets</h3>
                    
                    <div style={{ 
                      padding: '1rem',
                      background: '#f5f7fa',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      border: '1px solid #dde2e9'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Selected Files</h4>
                      
                      {useConsolidated && consolidatedFile && consolidatedSheet && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Consolidated:</strong> {consolidatedFile.name} / {consolidatedSheet}
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Original:</strong> {originalFile.name} / {originalSheet}
                      </div>
                      
                      <div>
                        <strong>Comparison:</strong> {comparisonFile.name} / {comparisonSheet}
                      </div>
                    </div>
                    
                    <ComparisonResult 
                      originalFile={originalFile}
                      originalSheet={originalSheet}
                      comparisonFile={comparisonFile}
                      comparisonSheet={comparisonSheet}
                      consolidatedFile={useConsolidated ? consolidatedFile : null}
                      consolidatedSheet={useConsolidated ? consolidatedSheet : null}
                      onComplete={handleComparisonComplete}
                    />
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-start' }}>
                      <button
                        onClick={() => setCurrentStep(3)}
                        style={{
                          background: '#f5f7fa',
                          color: '#5a5a5a',
                          border: '1px solid #dde2e9',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Workflow Completed */}
                {workflowCompleted && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    background: '#e8f1fd',
                    borderRadius: '8px',
                    marginTop: '1rem'
                  }}>
                    <h3 style={{ color: '#0061d5' }}>Process Complete</h3>
                    <p>All changes have been successfully applied and logged.</p>
                    <p>The workflow will reset in 5 seconds, or you can click the Reset button to start again.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
        
        <Footer />
      </div>
    </BoxAuthProvider>
  );
}

export default App;