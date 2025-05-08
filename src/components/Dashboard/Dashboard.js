import React, { useState, useEffect } from 'react';
import { useBoxAuth } from '../Auth/BoxAuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorMessage from '../Common/ErrorMessage';

const Dashboard = () => {
  const { isAuthenticated } = useBoxAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentChanges, setRecentChanges] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Mock function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch data from your backend or Box API
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
      
      // Mock statistics
      const mockStats = {
        totalComparisons: 24,
        totalChangesReviewed: 456,
        changesAccepted: 302,
        changesDenied: 124,
        changesModified: 30,
        lastComparisonDate: new Date().toISOString()
      };
      
      // Mock recent changes
      const mockRecentChanges = [
        {
          id: 'change1',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          bhLevel5: 'Marketing',
          cLine: '1234',
          column: "Q1'24 Fcst",
          oldValue: 15000,
          newValue: 25000,
          action: 'Accepted'
        },
        {
          id: 'change2',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          bhLevel5: 'Sales',
          cLine: '5678',
          column: "Q3'24 Fcst",
          oldValue: 45000,
          newValue: 40000,
          action: 'Denied'
        },
        {
          id: 'change3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          bhLevel5: 'HR',
          cLine: '9012',
          column: "Q2'24 Fcst",
          oldValue: 12000,
          newValue: 10000,
          action: 'Modified'
        },
        {
          id: 'change4',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          bhLevel5: 'IT',
          cLine: '3456',
          column: "Q4'24 Fcst",
          oldValue: 50000,
          newValue: 65000,
          action: 'Accepted'
        },
        {
          id: 'change5',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          bhLevel5: 'Finance',
          cLine: '7890',
          column: "Q1'24 Fcst",
          oldValue: 30000,
          newValue: 28000,
          action: 'Accepted'
        }
      ];
      
      // Mock chart data (last 7 days)
      const mockChartData = Array(7).fill(0).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return {
          date: date.toISOString().split('T')[0],
          accepted: Math.floor(Math.random() * 20) + 5,
          denied: Math.floor(Math.random() * 10) + 2,
          modified: Math.floor(Math.random() * 5) + 1
        };
      });
      
      setStats(mockStats);
      setRecentChanges(mockRecentChanges);
      setChartData(mockChartData);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load dashboard data: ${err.message}`);
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a5a' }}>Please connect to Box to view the dashboard.</div>;
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #dde2e9'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>Total Comparisons</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0061d5' }}>{stats?.totalComparisons || 0}</div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #dde2e9'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>Changes Reviewed</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0061d5' }}>{stats?.totalChangesReviewed || 0}</div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #dde2e9'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>Accepted</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16813d' }}>{stats?.changesAccepted || 0}</div>
        </div>
        
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #dde2e9'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#5a5a5a', marginBottom: '0.5rem' }}>Denied</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#e74c3c' }}>{stats?.changesDenied || 0}</div>
        </div>
      </div>
      
      {/* Chart */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dde2e9',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Changes Over Time</h3>
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '8px',
          padding: '0 1rem'
        }}>
          {chartData.map((day, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center' }}>
                <div 
                  style={{ 
                    width: '70%', 
                    height: `${day.modified * 3}px`, 
                    backgroundColor: '#f39c12',
                    borderTopLeftRadius: index === 0 ? '4px' : '0',
                    borderTopRightRadius: index === chartData.length - 1 ? '4px' : '0',
                  }}
                ></div>
                <div 
                  style={{ 
                    width: '70%', 
                    height: `${day.denied * 3}px`, 
                    backgroundColor: '#e74c3c',
                  }}
                ></div>
                <div 
                  style={{ 
                    width: '70%', 
                    height: `${day.accepted * 3}px`, 
                    backgroundColor: '#16813d',
                    borderTopLeftRadius: index === 0 ? '4px' : '0',
                    borderTopRightRadius: index === chartData.length - 1 ? '4px' : '0',
                  }}
                ></div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#5a5a5a', textAlign: 'center' }}>
                {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem',
          marginTop: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#16813d', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Accepted</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#e74c3c', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Denied</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f39c12', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#5a5a5a' }}>Modified</span>
          </div>
        </div>
      </div>
      
      {/* Recent Changes Table */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        border: '1px solid #dde2e9'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Recent Changes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead>
              <tr>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>Date</th>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>BH Level 5</th>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>C_Line</th>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>Column</th>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>Old Value</th>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>New Value</th>
                <th style={{ 
                  padding: '0.75rem', 
                  borderBottom: '1px solid #dde2e9', 
                  fontWeight: '500', 
                  color: '#5a5a5a'
                }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentChanges.map((change) => (
                <tr key={change.id}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>
                    {new Date(change.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>{change.bhLevel5}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>{change.cLine}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>{change.column}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>${change.oldValue.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>${change.newValue.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #dde2e9' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      backgroundColor: 
                        change.action === 'Accepted' ? '#e6f4ea' : 
                        change.action === 'Denied' ? '#ffebee' : 
                        '#fff8e6',
                      color: 
                        change.action === 'Accepted' ? '#16813d' : 
                        change.action === 'Denied' ? '#e74c3c' : 
                        '#f39c12'
                    }}>
                      {change.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;