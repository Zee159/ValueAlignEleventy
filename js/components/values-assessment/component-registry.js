/**
 * Component Registry for Values Assessment
 * Maps component names to module paths and adapts existing components
 * to work with the enhanced UI controller
 */

// Reference the BaseComponent from the global scope
// BaseComponent should be loaded before this script
const BaseComponent = window.BaseComponent;

/**
 * Component adapter that wraps existing components to make them
 * compatible with the BaseComponent interface
 */
class ComponentAdapter extends BaseComponent {
  /**
   * Create a component adapter
   * @param {Object} options Configuration options
   * @param {Function} options.ComponentClass The original component class constructor
   */
  constructor(options = {}) {
    super(options);
    
    this.ComponentClass = options.ComponentClass;
    this.instance = null;
    
    this.log('ComponentAdapter initialized');
  }
  
  /**
   * Initialize the wrapped component
   */
  initialize() {
    try {
      if (!this.ComponentClass) {
        throw new Error('ComponentClass is required');
      }
      
      // Create an instance of the original component
      this.instance = new this.ComponentClass({
        ui: this.ui,
        service: this.service,
        container: this.container,
        content: this.content,
        logger: this.logger
      });
      
      this.log('Wrapped component initialized');
      this.isInitialized = true;
    } catch (error) {
      this.logError('Error initializing wrapped component', error);
      throw error;
    }
  }
  
  /**
   * Render the wrapped component
   */
  render() {
    if (!this.instance) {
      this.initialize();
    }
    
    try {
      const result = this.instance.render();
      this.isRendered = true;
      return result;
    } catch (error) {
      this.logError('Error rendering wrapped component', error);
      throw error;
    }
  }
  
  /**
   * Clean up the wrapped component
   */
  destroy() {
    try {
      // Call the original component's destroy method if it exists
      if (this.instance && typeof this.instance.destroy === 'function') {
        this.instance.destroy();
      }
      
      this.instance = null;
      super.destroy();
    } catch (error) {
      this.logError('Error destroying wrapped component', error);
    }
  }
  
  /**
   * Update the wrapped component
   */
  update(data) {
    try {
      // Call the original component's update method if it exists
      if (this.instance && typeof this.instance.update === 'function') {
        return this.instance.update(data);
      }
      
      // Default to re-rendering
      return this.render();
    } catch (error) {
      this.logError('Error updating wrapped component', error);
      return this.render();
    }
  }
  
  /**
   * Focus the wrapped component
   */
  focus() {
    try {
      // Call the original component's focus method if it exists
      if (this.instance && typeof this.instance.focus === 'function') {
        this.instance.focus();
        return;
      }
      
      // Fall back to base focus behavior
      super.focus();
    } catch (error) {
      this.logError('Error focusing wrapped component', error);
      super.focus();
    }
  }
}

/**
 * Component registry mapping step names to their module paths
 * and providing adaptation for existing components
 */
class ComponentRegistry {
  /**
   * Create a component registry
   */
  constructor() {
    // Map of step names to component module paths
    this.componentMap = {
      'introduction': '/js/components/values-assessment/introduction.js',
      'selection': '/js/components/values-assessment/selection.js',
      'prioritization': '/js/components/values-assessment/prioritization.js',
      'reflection': '/js/components/values-assessment/reflection.js',
      'summary': '/js/components/values-assessment/results-summary.js', // Using existing results summary
      'ai-insights': '/js/components/values-assessment/results-content.js' // For premium users
    };
    
    // Cache of loaded component classes
    this.componentCache = new Map();
  }
  
  /**
   * Get the module path for a component
   * @param {string} componentName The component name
   * @returns {string|null} The module path or null if not found
   */
  getModulePath(componentName) {
    return this.componentMap[componentName] || null;
  }
  
  /**
   * Get all registered component names
   * @returns {Array<string>} Array of component names
   */
  getComponentNames() {
    return Object.keys(this.componentMap);
  }
  
  /**
   * Register a new component or override an existing one
   * @param {string} componentName The component name
   * @param {string} modulePath The module path
   */
  registerComponent(componentName, modulePath) {
    this.componentMap[componentName] = modulePath;
    
    // Clear cache for this component
    if (this.componentCache.has(componentName)) {
      this.componentCache.delete(componentName);
    }
  }
  
  /**
   * Load a component class from its module
   * @param {string} componentName The component name
   * @returns {Promise<Function>} Promise resolving to the component class
   */
  async loadComponentClass(componentName) {
    // Check cache first
    if (this.componentCache.has(componentName)) {
      return this.componentCache.get(componentName);
    }
    
    // Get the module path
    const modulePath = this.getModulePath(componentName);
    if (!modulePath) {
      throw new Error(`Component not registered: ${componentName}`);
    }
    
    try {
      // Import the module
      const module = await import(modulePath);
      
      // Extract the component class (assuming it's the first export)
      const componentClass = Object.values(module)[0];
      
      // Cache the component class
      this.componentCache.set(componentName, componentClass);
      
      return componentClass;
    } catch (error) {
      console.error(`[ComponentRegistry] Error loading component: ${componentName}`, error);
      throw error;
    }
  }
  
  /**
   * Create an instance of a component
   * @param {string} componentName The component name
   * @param {Object} options Options to pass to the component
   * @returns {Promise<ComponentAdapter>} Promise resolving to a component instance
   */
  async createComponent(componentName, options = {}) {
    try {
      // Load the component class
      const ComponentClass = await this.loadComponentClass(componentName);
      
      // Return an adapter wrapping the component
      return new ComponentAdapter({
        ...options,
        ComponentClass
      });
    } catch (error) {
      console.error(`[ComponentRegistry] Error creating component: ${componentName}`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const componentRegistry = new ComponentRegistry();

// Export for ES modules
export { componentRegistry, ComponentAdapter, ComponentRegistry };

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.ComponentRegistry = ComponentRegistry;
  window.componentRegistry = componentRegistry;
  window.ComponentAdapter = ComponentAdapter;
}
