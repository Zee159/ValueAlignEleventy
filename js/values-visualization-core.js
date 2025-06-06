/**
 * ValueAlign Visualization Core Module
 * Provides visualization capabilities for values assessment data
 * This is the core module that loads all visualization components
 */

class ValuesVisualization {
    /**
     * Initialize the visualization module
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Store reference to assessment if provided
        this.assessmentRef = options.assessment || null;
        
        // Element to render visualizations in
        this.container = options.container || document.getElementById('visualization-container');
        
        // Config options
        this.config = {
            colors: options.colors || ['#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6'],
            showLegend: options.showLegend !== undefined ? options.showLegend : true,
            animate: options.animate !== undefined ? options.animate : true,
            accessible: options.accessible !== undefined ? options.accessible : true
        };
        
        // Flag for initialization status
        this.initialized = false;
        
        // Initialize visualization components when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize visualization components
     */
    init() {
        if (this.initialized) return;
        
        // Check if container exists
        if (!this.container) {
            console.error('Visualization container not found');
            return;
        }
        
        // Check if required modules are loaded
        if (this.checkDependencies()) {
            console.log('Visualization dependencies loaded');
            this.initialized = true;
            
            // Load additional visualization components
            this.loadComponents();
        } else {
            console.error('Visualization dependencies missing');
        }
    }
    
    /**
     * Check required dependencies for visualization
     * @returns {boolean} Whether all dependencies are available
     */
    checkDependencies() {
        // Required modules for visualization
        const required = {
            d3: typeof window.d3 !== 'undefined',
            premiumFeatures: typeof window.PremiumFeatures !== 'undefined'
        };
        
        return Object.values(required).every(Boolean);
    }
    
    /**
     * Load additional visualization components
     */
    loadComponents() {
        // This will be implemented in separate component files
        console.log('Loading visualization components...');
        
        // We'll dynamically load other components here
        this.loadScript('js/values-visualization-radar.js')
            .then(() => this.loadScript('js/values-visualization-trends.js'))
            .then(() => {
                console.log('All visualization components loaded');
                this.announce('Visualization dashboard ready');
            })
            .catch(err => {
                console.error('Failed to load visualization components:', err);
            });
    }
    
    /**
     * Dynamically load a script
     * @param {string} src - Script URL to load
     * @returns {Promise} Promise that resolves when script is loaded
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        });
    }
    
    /**
     * Make an announcement for screen readers
     * @param {string} message - The message to announce
     * @param {string} priority - Priority level (polite or assertive)
     */
    announce(message, priority = 'polite') {
        // Use main assessment announcer if available
        if (this.assessmentRef && typeof this.assessmentRef.announce === 'function') {
            this.assessmentRef.announce(message, priority);
            return;
        }
        
        // Fallback announcer
        const announcer = document.getElementById('visualization-announcer') || 
                          document.getElementById('status-announcer');
        
        if (announcer) {
            announcer.textContent = message;
            announcer.setAttribute('aria-live', priority);
        } else {
            console.log('Announcement:', message);
        }
    }
    
    /**
     * Create a radar chart visualization of values
     * @param {Object} data - Values assessment data
     */
    createRadarChart(data) {
        // This will be implemented in values-visualization-radar.js
        if (window.ValuesRadarChart) {
            const radarChart = new window.ValuesRadarChart(this.container, data, this.config);
            radarChart.render();
        } else {
            console.error('Radar chart component not loaded');
        }
    }
    
    /**
     * Create values trends visualization over time
     * @param {Array} history - Historical assessment data
     */
    createTrendsChart(history) {
        // This will be implemented in values-visualization-trends.js
        if (window.ValuesTrendsChart) {
            const trendsChart = new window.ValuesTrendsChart(this.container, history, this.config);
            trendsChart.render();
        } else {
            console.error('Trends chart component not loaded');
        }
    }
}

// Export the module
window.ValuesVisualization = ValuesVisualization;
