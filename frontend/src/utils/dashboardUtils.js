/**
 * Pushes a new module summary to the dashboard history.
 * @param {Object} summary - The summary object
 * @param {string} summary.type - 'github', 'leetcode', 'resume', 'app-frontend', 'app-backend'
 * @param {string} summary.title - Short descriptive title
 * @param {string} summary.mainStat - Key metric (e.g., 'Score: 85%', 'Intermediate')
 * @param {string} summary.insight - A short sentence summarizing the result
 */
export const pushDashboardSummary = (summary) => {
  try {
    const existing = localStorage.getItem('dcis_summaries');
    const summaries = existing ? JSON.parse(existing) : [];
    
    // Add timestamp
    const now = new Date();
    summary.timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if we already have a summary for this type and update it, or add new
    const index = summaries.findIndex(s => s.type === summary.type);
    if (index !== -1) {
      summaries[index] = summary;
    } else {
      summaries.push(summary);
    }
    
    // Keep only last 10
    if (summaries.length > 10) summaries.shift();
    
    localStorage.setItem('dcis_summaries', JSON.stringify(summaries));
    
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save summary:', err);
  }
};
