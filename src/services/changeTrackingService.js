/**
 * Change Tracking Service
 * Provides functionality for tracking previously processed changes to prevent duplicates
 */

// Local storage key for processed changes
const PROCESSED_CHANGES_KEY = 'excel_comparison_processed_changes';

/**
 * Initialize the change tracking system
 * @returns {Object} The change tracking service
 */
const initializeChangeTracking = () => {
  // Load previously processed changes from storage
  const loadProcessedChanges = () => {
    try {
      const storedChanges = localStorage.getItem(PROCESSED_CHANGES_KEY);
      return storedChanges ? new Set(JSON.parse(storedChanges)) : new Set();
    } catch (error) {
      console.error('Error loading processed changes:', error);
      return new Set();
    }
  };

  // Save processed changes to storage
  const saveProcessedChanges = (changes) => {
    try {
      localStorage.setItem(PROCESSED_CHANGES_KEY, JSON.stringify([...changes]));
    } catch (error) {
      console.error('Error saving processed changes:', error);
    }
  };

  // Initialize processed changes set
  let processedChanges = loadProcessedChanges();

  return {
    /**
     * Get all processed changes
     * @returns {Set} Set of processed change IDs
     */
    getProcessedChanges: () => processedChanges,

    /**
     * Check if a change has been processed before
     * @param {string} changeId - Unique identifier for the change
     * @returns {boolean} True if the change has been processed
     */
    isChangeProcessed: (changeId) => processedChanges.has(changeId),

    /**
     * Mark a change as processed
     * @param {string} changeId - Unique identifier for the change
     */
    markChangeAsProcessed: (changeId) => {
      processedChanges.add(changeId);
      saveProcessedChanges(processedChanges);
    },

    /**
     * Mark multiple changes as processed
     * @param {Array} changeIds - Array of change IDs
     */
    markChangesAsProcessed: (changeIds) => {
      for (const changeId of changeIds) {
        processedChanges.add(changeId);
      }
      saveProcessedChanges(processedChanges);
    },

    /**
     * Clear all processed changes
     */
    clearProcessedChanges: () => {
      processedChanges.clear();
      localStorage.removeItem(PROCESSED_CHANGES_KEY);
    },

    /**
     * Get comparison options with processed changes included
     * @returns {Object} Comparison options
     */
    getComparisonOptions: () => ({
      tolerance: 0.001,          // Numerical tolerance for floating point comparison
      roundDecimals: 0,          // Round to integers by default
      ignoreProcessedChanges: true, // Ignore previously processed changes
      processedChanges: processedChanges // Pass the processed changes set
    })
  };
};

// Export the service
const changeTrackingService = initializeChangeTracking();
export default changeTrackingService;