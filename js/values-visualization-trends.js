/**
 * Values Trends Visualization
 * Premium feature that shows how values priorities change over time
 * Requires D3.js and core visualization module
 */

class ValuesTrendsChart {
    /**
     * Initialize trends chart visualization
     * @param {HTMLElement} container - The DOM element to render in
     * @param {Array} history - Historical assessment data
     * @param {Object} config - Configuration options
     */
    constructor(container, history, config = {}) {
        this.container = container;
        this.history = history || [];
        this.config = {
            width: config.width || 700,
            height: config.height || 400,
            margin: config.margin || { top: 50, right: 100, bottom: 50, left: 60 },
            colors: config.colors || ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6'],
            animate: config.animate !== undefined ? config.animate : true,
            accessible: config.accessible !== undefined ? config.accessible : true
        };
        
        // Ensure we have valid history data
        if (!this.history || !Array.isArray(this.history) || this.history.length === 0) {
            // Create a sample history if none provided (for demo purposes)
            this.history = this.generateSampleHistory();
        }
        
        // Process data on initialization
        this.processedData = null;
        this.svg = null;
        this.processData();
    }
    
    /**
     * Generate sample history for demonstration purposes
     * @returns {Array} Sample history data
     */
    generateSampleHistory() {
        const dates = [
            new Date(2025, 0, 15),
            new Date(2025, 1, 15),
            new Date(2025, 2, 15),
            new Date(2025, 3, 15),
            new Date(2025, 4, 15),
            new Date(2025, 5, 15)
        ];
        
        const sampleValues = [
            'honesty', 'compassion', 'creativity', 'courage', 'growth'
        ];
        
        return dates.map(date => {
            // Shuffle the values slightly for each date
            const shuffled = [...sampleValues].sort(() => Math.random() - 0.5);
            
            return {
                date: date,
                values: shuffled.slice(0, 5),
                reflections: {}
            };
        });
    }
    
    /**
     * Process historical data for visualization
     */
    processData() {
        if (!this.history || this.history.length === 0) {
            console.error('Invalid history data for trends chart');
            return;
        }
        
        // Get all unique values across history
        const allValues = new Set();
        this.history.forEach(entry => {
            if (entry.values && Array.isArray(entry.values)) {
                entry.values.forEach(value => allValues.add(value));
            }
        });
        
        const uniqueValues = Array.from(allValues);
        
        // Track each value's rank over time
        this.processedData = uniqueValues.map(valueId => {
            const valueData = window.valuesData?.find(v => v.id === valueId) || { name: valueId };
            
            // Track position of this value at each time point
            const dataPoints = this.history.map(entry => {
                const rank = entry.values.indexOf(valueId);
                // Value not present this period = no data point
                if (rank === -1) return null;
                
                return {
                    date: entry.date,
                    rank: rank + 1, // Convert to 1-indexed rank
                    // Invert for visualization (lower rank = higher value)
                    value: entry.values.length - rank, 
                    valueId: valueId
                };
            }).filter(Boolean); // Remove nulls (periods where value wasn't selected)
            
            return {
                id: valueId,
                name: valueData.name,
                values: dataPoints
            };
        });
    }
    
    /**
     * Render the trends visualization
     */
    render() {
        if (!this.processedData || !this.container) return;
        
        // Clear any existing visualization
        const trendsContainer = document.createElement('div');
        trendsContainer.className = 'trends-chart-container';
        this.container.appendChild(trendsContainer);
        
        // Create accessible title for the chart
        const chartTitle = document.createElement('h3');
        chartTitle.id = 'trends-chart-title';
        chartTitle.className = 'visualization-title';
        chartTitle.textContent = 'Your Values Trends Over Time';
        trendsContainer.appendChild(chartTitle);
        
        // Create description for screen readers
        const chartDesc = document.createElement('p');
        chartDesc.id = 'trends-chart-desc';
        chartDesc.className = 'sr-only';
        chartDesc.textContent = 'A line chart showing how your values priorities have changed over time. Each line represents a value, and its position shows its relative importance at different points in time.';
        trendsContainer.appendChild(chartDesc);
        
        // Check if D3 is available
        if (!window.d3) {
            console.error('D3.js is required for trends chart visualization');
            const errorMsg = document.createElement('p');
            errorMsg.className = 'visualization-error';
            errorMsg.textContent = 'D3.js is required for this visualization but was not found.';
            trendsContainer.appendChild(errorMsg);
            return;
        }
        
        // SVG container with proper roles
        const svgContainer = document.createElement('div');
        svgContainer.className = 'trends-svg-container';
        svgContainer.setAttribute('role', 'img');
        svgContainer.setAttribute('aria-labelledby', 'trends-chart-title');
        svgContainer.setAttribute('aria-describedby', 'trends-chart-desc');
        trendsContainer.appendChild(svgContainer);
        
        // D3 visualization code would go here
        // This is a placeholder that would be replaced with actual D3 line chart implementation
        svgContainer.innerHTML = `
            <div class="trends-chart-placeholder" style="width:${this.config.width}px;height:${this.config.height}px;">
                <p>Values Trends Visualization</p>
                <p>(Placeholder for D3.js implementation)</p>
            </div>
        `;
        
        // Create accessible data table
        this.createAccessibleDataTable(trendsContainer);
        
        // Add insights section
        this.addInsightsSection(trendsContainer);
    }
    
    /**
     * Create accessible data table alternative for screen readers
     * @param {HTMLElement} container - The container to append the table to
     */
    createAccessibleDataTable(container) {
        if (!this.processedData || this.processedData.length === 0) return;
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'trends-data-table-container';
        
        const tableTitle = document.createElement('h4');
        tableTitle.textContent = 'Values Trends Data';
        tableTitle.className = 'sr-only';
        
        const table = document.createElement('table');
        table.className = 'trends-data-table';
        table.setAttribute('aria-label', 'Values trends data table');
        
        // Get sorted dates from history
        const dates = this.history.map(entry => entry.date).sort((a, b) => a - b);
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const valueHeader = document.createElement('th');
        valueHeader.textContent = 'Value';
        valueHeader.setAttribute('scope', 'col');
        headerRow.appendChild(valueHeader);
        
        // Add a column for each date
        dates.forEach(date => {
            const dateHeader = document.createElement('th');
            dateHeader.textContent = date.toLocaleDateString();
            dateHeader.setAttribute('scope', 'col');
            headerRow.appendChild(dateHeader);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        this.processedData.forEach(valueData => {
            const row = document.createElement('tr');
            
            // Value name cell
            const valueCell = document.createElement('td');
            valueCell.textContent = valueData.name;
            row.appendChild(valueCell);
            
            // Add a cell for each date
            dates.forEach(date => {
                const dataPoint = valueData.values.find(v => 
                    v.date.toDateString() === date.toDateString()
                );
                
                const rankCell = document.createElement('td');
                if (dataPoint) {
                    rankCell.textContent = `Rank ${dataPoint.rank}`;
                } else {
                    rankCell.textContent = 'N/A';
                    rankCell.className = 'not-selected';
                }
                
                row.appendChild(rankCell);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(tableTitle);
        tableContainer.appendChild(table);
        
        // Add to container, but hide visually (available to screen readers)
        if (this.config.accessible) {
            tableContainer.className += ' sr-only';
            container.appendChild(tableContainer);
        }
    }
    
    /**
     * Add insights section with key observations about value trends
     * @param {HTMLElement} container - The container to append insights to
     */
    addInsightsSection(container) {
        const insightsSection = document.createElement('section');
        insightsSection.className = 'trends-insights';
        insightsSection.setAttribute('aria-labelledby', 'insights-title');
        
        const insightsTitle = document.createElement('h4');
        insightsTitle.id = 'insights-title';
        insightsTitle.textContent = 'Values Insights';
        insightsSection.appendChild(insightsTitle);
        
        // Generate insights based on data
        const insights = this.generateInsights();
        
        if (insights.length === 0) {
            const noInsights = document.createElement('p');
            noInsights.textContent = 'More assessment data needed to generate insights.';
            insightsSection.appendChild(noInsights);
        } else {
            const insightsList = document.createElement('ul');
            insightsList.setAttribute('role', 'list');
            
            insights.forEach(insight => {
                const insightItem = document.createElement('li');
                insightItem.setAttribute('role', 'listitem');
                insightItem.textContent = insight;
                insightsList.appendChild(insightItem);
            });
            
            insightsSection.appendChild(insightsList);
        }
        
        container.appendChild(insightsSection);
    }
    
    /**
     * Generate insights from trends data
     * @returns {Array} Array of insight strings
     */
    generateInsights() {
        const insights = [];
        
        if (!this.processedData || this.processedData.length === 0 || this.history.length < 2) {
            return insights;
        }
        
        // Find values that have consistently stayed in top positions
        const consistentTopValues = this.processedData
            .filter(valueData => {
                const topRanks = valueData.values.filter(v => v.rank <= 3);
                return topRanks.length >= Math.min(3, this.history.length);
            })
            .map(v => v.name);
            
        if (consistentTopValues.length > 0) {
            insights.push(`${consistentTopValues.join(' and ')} ${consistentTopValues.length > 1 ? 'have' : 'has'} consistently been among your top priorities.`);
        }
        
        // Find values that have significantly changed positions
        this.processedData.forEach(valueData => {
            if (valueData.values.length < 2) return; // Need at least two data points
            
            const sortedByDate = [...valueData.values].sort((a, b) => a.date - b.date);
            const firstPoint = sortedByDate[0];
            const lastPoint = sortedByDate[sortedByDate.length - 1];
            
            const rankChange = firstPoint.rank - lastPoint.rank;
            if (Math.abs(rankChange) >= 2) {
                const direction = rankChange > 0 ? 'increased' : 'decreased';
                insights.push(`${valueData.name} has ${direction} in priority since your first assessment.`);
            }
        });
        
        return insights;
    }
}

// Export the module
window.ValuesTrendsChart = ValuesTrendsChart;
