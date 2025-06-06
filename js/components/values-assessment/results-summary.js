/**
 * Values Assessment Results Summary Component
 * Displays a summary of the user's assessment with insights
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ResultsSummaryComponent {
  /**
   * Create a results summary component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.isPremiumUser = options.isPremiumUser || false;
    this.authService = options.authService || window.authService;
    
    // State
    this.summaryExpanded = false;
  }
  
  /**
   * Render the summary section
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get assessment data from service
      const prioritizedValues = this.service?.prioritizedValues || [];
      const selectedValues = this.service?.selectedValues || [];
      const reflections = this.service?.reflections || {};
      
      if (!prioritizedValues || prioritizedValues.length === 0) {
        // Show message if no values are prioritized
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
        emptyMessage.textContent = 'No values have been prioritized yet. Please complete the prioritization step first.';
        this.container.appendChild(emptyMessage);
        return this.container;
      }
      
      // Create summary card
      const summaryCard = document.createElement('div');
      summaryCard.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6';
      
      // Create summary header
      const summaryHeader = document.createElement('div');
      summaryHeader.className = 'flex items-center justify-between mb-4';
      
      const completionDate = document.createElement('div');
      completionDate.className = 'text-sm text-gray-500 dark:text-gray-400';
      completionDate.textContent = `Completed on ${new Date().toLocaleDateString()}`;
      
      summaryHeader.appendChild(completionDate);
      
      // Create user info if authenticated
      if (this.authService && this.authService.isAuthenticated()) {
        const user = this.authService.getCurrentUser();
        if (user) {
          const userInfo = document.createElement('div');
          userInfo.className = 'text-sm text-gray-500 dark:text-gray-400';
          userInfo.textContent = `Assessment for: ${user.name || user.email || 'Authenticated User'}`;
          summaryHeader.appendChild(userInfo);
        }
      }
      
      // Create stats section
      const statsSection = document.createElement('div');
      statsSection.className = 'flex flex-wrap gap-4 mb-6';
      
      // Add stats cards
      const stats = [
        {
          label: 'Values Selected',
          value: selectedValues.length,
          icon: `<svg class="w-8 h-8 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`
        },
        {
          label: 'Values Prioritized',
          value: prioritizedValues.length,
          icon: `<svg class="w-8 h-8 text-green-500 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>`
        },
        {
          label: 'Reflections Written',
          value: Object.keys(reflections).length,
          icon: `<svg class="w-8 h-8 text-purple-500 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>`
        }
      ];
      
      stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'flex-1 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg';
        
        const statContent = document.createElement('div');
        statContent.className = 'flex items-center';
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'mr-3';
        iconDiv.innerHTML = stat.icon;
        
        const textContent = document.createElement('div');
        
        const value = document.createElement('div');
        value.className = 'text-2xl font-bold text-gray-900 dark:text-gray-100';
        value.textContent = stat.value;
        
        const label = document.createElement('div');
        label.className = 'text-sm text-gray-600 dark:text-gray-400';
        label.textContent = stat.label;
        
        textContent.appendChild(value);
        textContent.appendChild(label);
        
        statContent.appendChild(iconDiv);
        statContent.appendChild(textContent);
        statCard.appendChild(statContent);
        
        statsSection.appendChild(statCard);
      });
      
      // Create insights section
      const insightsSection = document.createElement('div');
      insightsSection.className = 'mt-6';
      
      const insightsTitle = document.createElement('h3');
      insightsTitle.className = 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-3';
      insightsTitle.textContent = 'Assessment Insights';
      
      const insights = document.createElement('div');
      
      // Premium users get AI insights, non-premium get general insights
      if (this.isPremiumUser) {
        insights.className = 'p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800';
        
        const premiumLabel = document.createElement('div');
        premiumLabel.className = 'flex items-center mb-2';
        premiumLabel.innerHTML = `
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 mr-2">
            <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
            PREMIUM AI INSIGHTS
          </span>
        `;
        
        const aiInsightText = document.createElement('p');
        aiInsightText.className = 'text-gray-700 dark:text-gray-300';
        aiInsightText.textContent = this._getAIInsights(prioritizedValues);
        
        const expandButton = document.createElement('button');
        expandButton.className = 'mt-2 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500';
        expandButton.textContent = this.summaryExpanded ? 'Show less' : 'Show more insights';
        expandButton.addEventListener('click', () => this._toggleExpand());
        
        insights.appendChild(premiumLabel);
        insights.appendChild(aiInsightText);
        insights.appendChild(expandButton);
      } else {
        insights.className = 'p-4 bg-gray-100 dark:bg-gray-750 rounded-lg';
        
        const basicInsightText = document.createElement('p');
        basicInsightText.className = 'text-gray-700 dark:text-gray-300';
        basicInsightText.textContent = this._getBasicInsights(prioritizedValues);
        
        const upgradeNote = document.createElement('div');
        upgradeNote.className = 'mt-3 text-sm flex items-center text-gray-600 dark:text-gray-400';
        upgradeNote.innerHTML = `
          <svg class="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
          </svg>
          <span>Upgrade to premium for personalized AI insights and advanced analysis.</span>
        `;
        
        insights.appendChild(basicInsightText);
        insights.appendChild(upgradeNote);
      }
      
      insightsSection.appendChild(insightsTitle);
      insightsSection.appendChild(insights);
      
      // Assemble the summary card
      summaryCard.appendChild(summaryHeader);
      summaryCard.appendChild(statsSection);
      summaryCard.appendChild(insightsSection);
      
      // Add to container
      this.container.appendChild(summaryCard);
      
      return this.container;
    } catch (error) {
      console.error('[ResultsSummaryComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          <p>There was a problem loading the assessment summary.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Toggle expanded insights view
   * @private
   */
  _toggleExpand() {
    this.summaryExpanded = !this.summaryExpanded;
    this.render();
    
    // Announce for screen readers
    if (this.ui && this.ui.announce) {
      const message = this.summaryExpanded ? 'Showing expanded insights.' : 'Showing summarized insights.';
      this.ui.announce(message, 'polite');
    }
  }
  
  /**
   * Get basic insights based on top values
   * @private
   * @param {Array<string>} prioritizedValues Array of value IDs
   * @returns {string} Basic insights text
   */
  _getBasicInsights(prioritizedValues) {
    if (!prioritizedValues || prioritizedValues.length === 0) {
      return 'Complete the assessment to receive insights about your values.';
    }
    
    const topThree = prioritizedValues.slice(0, 3).map(id => {
      const value = this.valuesData.find(v => v.id === id);
      return value ? value.name : 'Unknown value';
    });
    
    return `Your top values (${topThree.join(', ')}) suggest you value personal principles that guide your decisions and actions. Understanding these core values can help you make more aligned choices in your personal and professional life.`;
  }
  
  /**
   * Get AI insights based on top values
   * @private
   * @param {Array<string>} prioritizedValues Array of value IDs
   * @returns {string} AI insights text
   */
  _getAIInsights(prioritizedValues) {
    if (!prioritizedValues || prioritizedValues.length === 0) {
      return 'Complete the assessment to receive personalized AI insights about your values.';
    }
    
    const topThree = prioritizedValues.slice(0, 3).map(id => {
      const value = this.valuesData.find(v => v.id === id);
      return value ? value.name : 'Unknown value';
    });
    
    // In a real implementation, this would come from the AI service
    if (this.summaryExpanded) {
      return `Your assessment reveals a strong prioritization of ${topThree.join(', ')}. This combination suggests you approach challenges with a balanced perspective of both personal conviction and consideration for broader impact. People with similar value profiles often excel in roles requiring ethical decision-making and leadership. Your reflections indicate that you're particularly thoughtful about how these values manifest in your daily choices. Consider exploring how these values might help you navigate current challenges in your personal or professional life. For deeper application, try creating specific scenarios where these values might conflict, and work through how you'd resolve these tensions.`;
    } else {
      return `Your value profile prioritizes ${topThree.join(', ')}, which indicates you approach life decisions with a focus on [personal principles]. This value pattern suggests you're likely to thrive in environments that honor these priorities and allow you to express them in your work and relationships.`;
    }
  }
}

// Export the component
export { ResultsSummaryComponent };
