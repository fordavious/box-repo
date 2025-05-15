import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const FolderBrowser = ({ onFolderSelect }) => {
  const { isAuthenticated } = useBoxAuth();
  const [currentFolder, setCurrentFolder] = useState({ 
    id: '0',
    name: 'All Files',
    path: 'All Files'
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: '0', name: 'All Files' }]);

  // Mock API call to fetch folder contents
  const fetchFolderContents = async (folderId) => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll create mock data
      // In a real app, this would be a call to the Box API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock folder contents
      let mockItems = [];
      
      if (folderId === '0') {
        mockItems = [
          { id: 'folder1', name: 'Financial Reports', type: 'folder', modified_at: new Date().toISOString(), modified_by: { name: 'John Doe' } },
          { id: 'folder2', name: 'Marketing', type: 'folder', modified_at: new Date().toISOString(), modified_by: { name: 'Jane Smith' } },
          { id: 'folder3', name: 'Sales', type: 'folder', modified_at: new Date().toISOString(), modified_by: { name: 'Bob Johnson' } }
        ];
      } else if (folderId === 'folder1') {
        mockItems = [
          { id: 'folder1-1', name: 'Q1 Reports', type: 'folder', modified_at: new Date().toISOString(), modified_by: { name: 'John Doe' } },
          { id: 'file1', name: 'Annual Budget.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'Jane Smith' } }
        ];
      } else if (folderId === 'folder1-1') {
        mockItems = [
          { id: 'file2', name: 'Q1 Financial Summary.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'John Doe' } },
          { id: 'file3', name: 'Q1 Projections.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'Bob Johnson' } }
        ];
      } else {
        mockItems = [
          { id: 'file4', name: 'Sample.xlsx', type: 'file', modified_at: new Date().toISOString(), modified_by: { name: 'Jane Smith' } }
        ];
      }
      
      setItems(mockItems);
    } catch (err) {
      setError(`Failed to load folder contents: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load folder contents when folder changes or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFolderContents(currentFolder.id);
    }
  }, [isAuthenticated, currentFolder.id]);

  // Navigate to a subfolder
  const navigateToFolder = (item) => {
    if (item.type !== 'folder') return;
    
    // Add current folder to history
    setFolderHistory(prev => [...prev, { ...currentFolder }]);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs, { id: item.id, name: item.name }];
    setBreadcrumbs(newBreadcrumbs);
    
    // Update current folder
    setCurrentFolder({
      id: item.id,
      name: item.name,
      path: newBreadcrumbs.map(b => b.name).join(' > ')
    });
  };

  // Go back to previous folder
  const navigateBack = () => {
    if (folderHistory.length === 0) return;
    
    // Get previous folder
    const newHistory = [...folderHistory];
    const previousFolder = newHistory.pop();
    
    // Update breadcrumbs
    const newBreadcrumbs = breadcrumbs.slice(0, -1);
    setBreadcrumbs(newBreadcrumbs);
    
    // Update current folder
    setCurrentFolder(previousFolder);
    
    // Update history
    setFolderHistory(newHistory);
  };

  // Navigate using breadcrumb
  const navigateToBreadcrumb = (index) => {
    if (index >= breadcrumbs.length - 1) return; // Already at this level
    
    // Get the folder at the selected breadcrumb level
    const targetFolder = breadcrumbs[index];
    
    // Update breadcrumbs
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    
    // Update current folder
    setCurrentFolder({
      id: targetFolder.id,
      name: targetFolder.name,
      path: newBreadcrumbs.map(b => b.name).join(' > ')
    });
    
    // Update history - if jumping multiple levels back
    if (folderHistory.length > 0) {
      // Get the history up to the point before the target breadcrumb
      const newHistory = folderHistory.slice(0, index);
      setFolderHistory(newHistory);
    }
  };

  const handleSelectFolder = () => {
    if (onFolderSelect) {
      onFolderSelect(currentFolder);
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to browse folders.</div>;
  }

  if (loading) {
    return <LoadingSpinner message="Loading folder contents..." />;
  }

  return (
    <div style={{ border: '1px solid #dde2e9', borderRadius: '6px', overflow: 'hidden' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ 
        background: '#f5f7fa', 
        padding: '0.5rem 1rem', 
        borderBottom: '1px solid #dde2e9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <span style={{ margin: '0 0.5rem', color: '#5a5a5a' }}>/</span>}
              <button 
                onClick={() => navigateToBreadcrumb(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: index === breadcrumbs.length - 1 ? '#0061d5' : '#5a5a5a',
                  fontWeight: index === breadcrumbs.length - 1 ? '500' : 'normal'
                }}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Folder Header */}
      <div style={{ 
        padding: '1rem', 
        background: '#e8f1fd', 
        borderBottom: '1px solid #dde2e9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#5a5a5a', fontSize: '0.85rem' }}>Current location: </span>
          <span style={{ fontWeight: '500' }}>{currentFolder.path}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={navigateBack}
            disabled={folderHistory.length === 0}
            style={{
              background: 'white',
              color: folderHistory.length === 0 ? '#bdc3c7' : '#5a5a5a',
              border: '1px solid #dde2e9',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              cursor: folderHistory.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Back
          </button>
          <button 
            onClick={handleSelectFolder}
            style={{
              background: '#0061d5',
              color: 'white',
              border: 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Select This Folder
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Folder Contents */}
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
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
        
        {items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>This folder is empty.</div>
        ) : (
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => item.type === 'folder' ? navigateToFolder(item) : null}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1fr',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #f2f2f2',
                  cursor: item.type === 'folder' ? 'pointer' : 'default',
                  transition: 'background-color 0.2s',
                  backgroundColor: 'white',
                  ':hover': {
                    backgroundColor: item.type === 'folder' ? '#e8f1fd' : '#f9f9f9'
                  }
                }}
                onMouseOver={(e) => {
                  if (item.type === 'folder') {
                    e.currentTarget.style.backgroundColor = '#e8f1fd';
                  } else {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.type === 'folder' ? '📁' : '📄'}</span>
                  <span>{item.name}</span>
                  {item.type === 'folder' && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      background: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '0.25rem',
                      marginLeft: '0.5rem'
                    }}>
                      Folder
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  {item.modified_at ? new Date(item.modified_at).toLocaleDateString() : 'N/A'}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  {item.modified_by ? item.modified_by.name : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Folder Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        background: '#f5f7fa',
        borderTop: '1px solid #dde2e9',
        fontSize: '0.85rem',
        color: '#5a5a5a'
      }}>
        <div>Path: {currentFolder.path}</div>
        <div>{items.length} items</div>
      </div>
    </div>
  );
};

export default FolderBrowser;