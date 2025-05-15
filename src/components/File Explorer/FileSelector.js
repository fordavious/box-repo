import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const FileSelector = ({ folder, fileExtension = '.xlsx', onFileSelect }) => {
  const { isAuthenticated } = useBoxAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock API call to fetch files
  const fetchFiles = async (folderId) => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll create mock data
      // In a real app, this would be a call to the Box API
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Mock files based on folder
      let mockFiles = [];
      
      if (folderId === 'folder1') {
        mockFiles = [
          { id: 'file1', name: 'Annual Budget.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'Jane Smith' } }
        ];
      } else if (folderId === 'folder1-1') {
        mockFiles = [
          { id: 'file2', name: 'Q1 Financial Summary.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'John Doe' } },
          { id: 'file3', name: 'Q1 Projections.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'Bob Johnson' } }
        ];
      } else {
        mockFiles = [
          { id: 'file4', name: 'Sample.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'Jane Smith' } }
        ];
      }
      
      // Filter files by extension
      const filteredFiles = mockFiles.filter(file => 
        file.name.toLowerCase().endsWith(fileExtension.toLowerCase())
      );
      
      setFiles(filteredFiles);
    } catch (err) {
      setError(`Failed to load files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load files when folder changes
  useEffect(() => {
    if (isAuthenticated && folder) {
      fetchFiles(folder.id);
    }
  }, [isAuthenticated, folder]);

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleSelectFile = () => {
    if (selectedFile && onFileSelect) {
      onFileSelect(selectedFile);
    } else {
      setError('Please select a file first.');
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to select files.</div>;
  }

  if (!folder) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please select a folder first.</div>;
  }

  if (loading) {
    return <LoadingSpinner message={`Loading ${fileExtension} files...`} />;
  }

  return (
    <div style={{ border: '1px solid #dde2e9', borderRadius: '6px', overflow: 'hidden' }}>
      {/* File Selector Header */}
      <div style={{ 
        padding: '1rem', 
        background: '#e8f1fd', 
        borderBottom: '1px solid #dde2e9'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
          Select {fileExtension} File from {folder.name}
        </h3>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Files Container */}
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {files.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>
            No {fileExtension} files found in this folder.
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '3fr 1fr 1fr',
              padding: '0.5rem 1rem',
              background: '#f5f7fa',
              borderBottom: '1px solid #dde2e9',
              fontWeight: '500',
              fontSize: '0.9rem',
              color: '#5a5a5a'
            }}>
              <div>Name</div>
              <div>Last Modified</div>
              <div>Modified By</div>
            </div>
            
            <div>
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr 1fr',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f2f2f2',
                    cursor: 'pointer',
                    backgroundColor: selectedFile && selectedFile.id === file.id ? '#e8f1fd' : 'white',
                    borderLeft: selectedFile && selectedFile.id === file.id ? '3px solid #0061d5' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!(selectedFile && selectedFile.id === file.id)) {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!(selectedFile && selectedFile.id === file.id)) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>📄</span>
                    <span>{file.name}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    {file.modified_at ? new Date(file.modified_at).toLocaleDateString() : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.85rem' }}>
                    {file.modified_by ? file.modified_by.name : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File Selector Footer */}
      <div style={{ 
        padding: '1rem',
        background: '#f5f7fa',
        borderTop: '1px solid #dde2e9',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleSelectFile}
          disabled={!selectedFile}
          style={{
            background: selectedFile ? '#0061d5' : '#bdc3c7',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: selectedFile ? 'pointer' : 'not-allowed'
          }}
        >
          Select File
        </button>
      </div>
    </div>
  );
};

export default FileSelector;