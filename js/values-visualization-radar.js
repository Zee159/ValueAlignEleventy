/**
 * Values Radar Chart Visualization
 * Premium feature that visualizes values in a radar/spider chart
 * Requires D3.js and core visualization module
 */

class ValuesRadarChart {
    /**
     * Initialize radar chart visualization
     * @param {HTMLElement} container - The DOM element to render in
     * @param {Object} data - The values assessment data
     * @param {Object} config - Configuration options
     */
    constructor(container, data, config = {}) {
        this.container = container;
        this.data = data;
        this.config = {
            width: config.width || 500,
            height: config.height || 500,
            margin: config.margin || { top: 50, right: 50, bottom: 50, left: 50 },
            colors: config.colors || ['#4f46e5'],
            animate: config.animate !== undefined ? config.animate : true,
            accessible: config.accessible !== undefined ? config.accessible : true
        };
        
        // Processed data and visualization elements
        this.processedData = null;
        this.svg = null;
        this.radarArea = null;
        
        // Process data on initialization
        this.processData();
    }
    
    /**
     * Process assessment data for visualization
     */
    processData() {
        if (!this.data || !this.data.prioritizedValues) {
            console.error('Invalid data for radar chart');
            return;
        }
        
        // Get values and normalize to 0-1 range based on rank
        const valuesData = window.valuesData || [];
        const valueCount = this.data.prioritizedValues.length;
        
        // Map values to radar chart format
        this.processedData = this.data.prioritizedValues.map((valueId, index) => {
            const valueData = valuesData.find(v => v.id === valueId) || { name: valueId, description: '' };
            // Invert the score so highest ranked values have highest scores
            const score = (valueCount - index) / valueCount;
            
            return {
                axis: valueData.name,
                value: score,
                description: valueData.description,
                id: valueId
            };
        });
    }
    
    /**
     * Render the radar chart visualization
     */
    render() {
        if (!this.processedData || !this.container) return;
        
        // Clear any existing visualization
        this.container.innerHTML = '';
        
        // Create accessible title for the chart
        const chartTitle = document.createElement('h3');
        chartTitle.id = 'radar-chart-title';
        chartTitle.className = 'visualization-title';
        chartTitle.textContent = 'Your Values Radar Chart';
        this.container.appendChild(chartTitle);
        
        // Create description for screen readers
        const chartDesc = document.createElement('p');
        chartDesc.id = 'radar-chart-desc';
        chartDesc.className = 'sr-only';
        chartDesc.textContent = 'A radar chart showing the relative importance of your selected values. Higher values extend further from the center.';
        this.container.appendChild(chartDesc);
        
        // Create SVG container with proper roles
        const svgContainer = document.createElement('div');
        svgContainer.className = 'radar-chart-container';
        svgContainer.setAttribute('role', 'img');
        svgContainer.setAttribute('aria-labelledby', 'radar-chart-title');
        svgContainer.setAttribute('aria-describedby', 'radar-chart-desc');
        this.container.appendChild(svgContainer);
        
        // Check if D3 is available
        if (!window.d3) {
            console.error('D3.js is required for radar chart visualization');
            const errorMsg = document.createElement('p');
            errorMsg.className = 'visualization-error';
            errorMsg.textContent = 'D3.js is required for this visualization but was not found.';
            svgContainer.appendChild(errorMsg);
            return;
        }
        
        // D3 visualization code would go here
        // This is a placeholder that would be replaced with actual D3 radar chart implementation
        svgContainer.innerHTML = `
            <div class="radar-chart-placeholder" style="width:${this.config.width}px;height:${this.config.height}px;">
                <p>Radar Chart Visualization</p>
                <p>(Placeholder for D3.js implementation)</p>
            </div>
        `;
        
        // Add data table for accessibility
        this.createAccessibleDataTable();
    }
    
    /**
     * Create an accessible data table representation of the chart
     * This provides an alternative for screen reader users
     */
    createAccessibleDataTable() {
        if (!this.processedData) return;
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'radar-data-table-container';
        
        const tableTitle = document.createElement('h4');
        tableTitle.textContent = 'Values Priorities Data';
        tableTitle.className = 'sr-only';
        
        const table = document.createElement('table');
        table.className = 'radar-data-table';
        table.setAttribute('aria-label', 'Values priorities data table');
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const rankHeader = document.createElement('th');
        rankHeader.textContent = 'Rank';
        rankHeader.setAttribute('scope', 'col');
        
        const valueHeader = document.createElement('th');
        valueHeader.textContent = 'Value';
        valueHeader.setAttribute('scope', 'col');
        
        const strengthHeader = document.createElement('th');
        strengthHeader.textContent = 'Relative Importance';
        strengthHeader.setAttribute('scope', 'col');
        
        headerRow.appendChild(rankHeader);
        headerRow.appendChild(valueHeader);
        headerRow.appendChild(strengthHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Sort by value (highest first)
        const sortedData = [...this.processedData].sort((a, b) => b.value - a.value);
        
        sortedData.forEach((dataPoint, index) => {
            const row = document.createElement('tr');
            
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            
            const valueCell = document.createElement('td');
            valueCell.textContent = dataPoint.axis;
            
            const strengthCell = document.createElement('td');
            // Convert to percentage for readability
            const strengthPercentage = Math.round(dataPoint.value * 100);
            strengthCell.textContent = `${strengthPercentage}%`;
            
            row.appendChild(rankCell);
            row.appendChild(valueCell);
            row.appendChild(strengthCell);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(tableTitle);
        tableContainer.appendChild(table);
        
        // Add to container, but hide visually (available to screen readers)
        if (this.config.accessible) {
            tableContainer.className += ' sr-only';
            this.container.appendChild(tableContainer);
        }
    }
}

// Export the module
window.ValuesRadarChart = ValuesRadarChart;
