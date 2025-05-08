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
  
  // State for original file
  const [originalFolder, setOriginalFolder] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [originalSheet, setOriginalSheet] = useState(null);
  
  // State for comparison file
  const [comparisonFolder, setComparisonFolder] = useState(null);
  const [comparisonFile, setComparisonFile] = useState(null);
  const [comparisonSheet, setComparisonSheet] = useState(null);
  
  // State for consolidated file (optional)
  const [useConsolidated, setUseConsolidated] = useState(false);
  const [consolidatedFolder, setConsolidatedFolder] = useState(null);
  const [consolidatedFile, setConsolidatedFile] = useState(null);
  const [consolidatedSheet, setConsolidatedSheet] = useState(null);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Completion state
  const [workflowCompleted, setWorkflowCompleted] = useState(false);

  // Handle original folder selection
  const handleOriginalFolderSelect = (folder) => {
    setOriginalFolder(folder);
    setCurrentStep(2);
  };

  // Handle original file selection
  const handleOriginalFileSelect = (file) => {
    setOriginalFile(file);
    setCurrentStep(3);
  };

  // Handle original sheet selection
  const handleOriginalSheetSelect = (sheet) => {
    setOriginalSheet(sheet);
    setCurrentStep(4);
  };

  // Handle comparison folder selection
  const handleComparisonFolderSelect = (folder) => {
    setComparisonFolder(folder);
    setCurrentStep(5);
  };

  // Handle comparison file selection
  const handleComparisonFileSelect = (file) => {
    setComparisonFile(file);
    setCurrentStep(6);
  };

  // Handle comparison sheet selection
  const handleComparisonSheetSelect = (sheet) => {
    setComparisonSheet(sheet);
    
    // If consolidated is enabled, go to consolidated selection
    // Otherwise, go to comparison step
    if (useConsolidated) {
      setCurrentStep(7);
    } else {
      setCurrentStep(10);
    }
  };

  // Toggle consolidated file usage
  const handleToggleConsolidated = (e) => {
    setUseConsolidated(e.target.checked);
  };

  // Handle consolidated folder selection
  const handleConsolidatedFolderSelect = (folder) => {
    setConsolidatedFolder(folder);
    setCurrentStep(8);
  };

  // Handle consolidated file selection
  const handleConsolidatedFileSelect = (file) => {
    setConsolidatedFile(file);
    setCurrentStep(9);
  };

  // Handle consolidated sheet selection
  const handleConsolidatedSheetSelect = (sheet) => {
    setConsolidatedSheet(sheet);
    setCurrentStep(10);
  };

  // Handle comparison completion
  const handleComparisonComplete = () => {
    setWorkflowCompleted(true);
    
    // After 3 seconds, reset the workflow
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
    setUseConsolidated(false);
    setConsolidatedFolder(null);
    setConsolidatedFile(null);
    setConsolidatedSheet(null);
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
                  1. Original Folder
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
                  3. Original Sheet
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
                  4. Comparison Folder
                </div>
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 5 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 5 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 5 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 5 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  5. Comparison File
                </div>
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 6 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 6 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 6 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 6 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  6. Comparison Sheet
                </div>
                {useConsolidated && (
                  <>
                    <div 
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: currentStep >= 7 ? '#e8f1fd' : '#f5f7fa',
                        color: currentStep >= 7 ? '#0061d5' : '#5a5a5a',
                        borderRadius: '4px',
                        border: currentStep >= 7 ? '1px solid #0061d5' : '1px solid #dde2e9',
                        fontWeight: currentStep >= 7 ? '500' : 'normal',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      7. Consolidated Folder
                    </div>
                    <div 
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: currentStep >= 8 ? '#e8f1fd' : '#f5f7fa',
                        color: currentStep >= 8 ? '#0061d5' : '#5a5a5a',
                        borderRadius: '4px',
                        border: currentStep >= 8 ? '1px solid #0061d5' : '1px solid #dde2e9',
                        fontWeight: currentStep >= 8 ? '500' : 'normal',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      8. Consolidated File
                    </div>
                    <div 
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: currentStep >= 9 ? '#e8f1fd' : '#f5f7fa',
                        color: currentStep >= 9 ? '#0061d5' : '#5a5a5a',
                        borderRadius: '4px',
                        border: currentStep >= 9 ? '1px solid #0061d5' : '1px solid #dde2e9',
                        fontWeight: currentStep >= 9 ? '500' : 'normal',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      9. Consolidated Sheet
                    </div>
                  </>
                )}
                <div 
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentStep >= 10 ? '#e8f1fd' : '#f5f7fa',
                    color: currentStep >= 10 ? '#0061d5' : '#5a5a5a',
                    borderRadius: '4px',
                    border: currentStep >= 10 ? '1px solid #0061d5' : '1px solid #dde2e9',
                    fontWeight: currentStep >= 10 ? '500' : 'normal',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {useConsolidated ? '10. Compare' : '7. Compare'}
                </div>
              </div>
              
              {/* Step content */}
              <div style={{ 
                padding: '2rem', 
                background: '#fff', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                {/* Original Folder */}
                {currentStep === 1 && (
                  <div>
                    <h3>Step 1: Select Original Folder</h3>
                    <p>Browse and select the folder containing your original Excel file.</p>
                    <FolderBrowser onFolderSelect={handleOriginalFolderSelect} />
                  </div>
                )}
                
                {/* Original File */}
                {currentStep === 2 && (
                  <div>
                    <h3>Step 2: Select Original Excel File</h3>
                    <p>Choose an Excel file from the selected folder.</p>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Selected Folder:</strong> {originalFolder.name}
                    </div>
                    <FileSelector 
                      folder={originalFolder} 
                      fileExtension=".xlsx" 
                      onFileSelect={handleOriginalFileSelect} 
                    />
                  </div>
                )}
                
                {/* Original Sheet */}
                {currentStep === 3 && (
                  <div>
                    <h3>Step 3: Select Original Excel Sheet</h3>
                    <p>Choose a sheet from the selected Excel file.</p>
                    <div style={{ marginBottom: '1rem' }}>
                      <div><strong>Selected Folder:</strong> {originalFolder.name}</div>
                      <div><strong>Selected File:</strong> {originalFile.name}</div>
                    </div>
                    <SheetSelector 
                      file={originalFile} 
                      onSheetSelect={handleOriginalSheetSelect} 
                    />
                  </div>
                )}
                
                {/* Comparison Folder */}
                {currentStep === 4 && (
                  <div>
                    <h3>Step 4: Select Comparison Folder</h3>
                    <p>Browse and select the folder containing your comparison Excel file.</p>
                    <FolderBrowser onFolderSelect={handleComparisonFolderSelect} />
                  </div>
                )}
                
                {/* Comparison File */}
                {currentStep === 5 && (
                  <div>
                    <h3>Step 5: Select Comparison Excel File</h3>
                    <p>Choose an Excel file from the selected folder.</p>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Selected Folder:</strong> {comparisonFolder.name}
                    </div>
                    <FileSelector 
                      folder={comparisonFolder} 
                      fileExtension=".xlsx" 
                      onFileSelect={handleComparisonFileSelect} 
                    />
                  </div>
                )}
                
                {/* Comparison Sheet */}
                {currentStep === 6 && (
                  <div>
                    <h3>Step 6: Select Comparison Excel Sheet</h3>
                    <p>Choose a sheet from the selected Excel file.</p>
                    <div style={{ 
                      marginBottom: '1rem', 
                      padding: '0.75rem',
                      background: '#f5f7fa',
                      borderRadius: '4px',
                      border: '1px solid #dde2e9'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={useConsolidated}
                          onChange={handleToggleConsolidated}
                        />
                        Update a consolidated sheet as well
                      </label>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div><strong>Selected Folder:</strong> {comparisonFolder.name}</div>
                      <div><strong>Selected File:</strong> {comparisonFile.name}</div>
                    </div>
                    <SheetSelector 
                      file={comparisonFile} 
                      onSheetSelect={handleComparisonSheetSelect} 
                    />
                  </div>
                )}
                
                {/* Consolidated Folder (Optional) */}
                {currentStep === 7 && (
                  <div>
                    <h3>Step 7: Select Consolidated Folder</h3>
                    <p>Browse and select the folder containing your consolidated Excel file.</p>
                    <FolderBrowser onFolderSelect={handleConsolidatedFolderSelect} />
                  </div>
                )}
                
                {/* Consolidated File (Optional) */}
                {currentStep === 8 && (
                  <div>
                    <h3>Step 8: Select Consolidated Excel File</h3>
                    <p>Choose an Excel file from the selected folder.</p>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Selected Folder:</strong> {consolidatedFolder.name}
                    </div>
                    <FileSelector 
                      folder={consolidatedFolder} 
                      fileExtension=".xlsx" 
                      onFileSelect={handleConsolidatedFileSelect} 
                    />
                  </div>
                )}
                
                {/* Consolidated Sheet (Optional) */}
                {currentStep === 9 && (
                  <div>
                    <h3>Step 9: Select Consolidated Excel Sheet</h3>
                    <p>Choose a sheet from the selected Excel file.</p>
                    <div style={{ marginBottom: '1rem' }}>
                      <div><strong>Selected Folder:</strong> {consolidatedFolder.name}</div>
                      <div><strong>Selected File:</strong> {consolidatedFile.name}</div>
                    </div>
                    <SheetSelector 
                      file={consolidatedFile} 
                      onSheetSelect={handleConsolidatedSheetSelect} 
                    />
                  </div>
                )}
                
                {/* Comparison Results */}
                {currentStep === 10 && (
                  <div>
                    <h3>{useConsolidated ? 'Step 10' : 'Step 7'}: Compare Excel Sheets</h3>
                    <ComparisonResult 
                      originalFile={originalFile}
                      originalSheet={originalSheet}
                      comparisonFile={comparisonFile}
                      comparisonSheet={comparisonSheet}
                      consolidatedFile={useConsolidated ? consolidatedFile : null}
                      consolidatedSheet={useConsolidated ? consolidatedSheet : null}
                      onComplete={handleComparisonComplete}
                    />
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