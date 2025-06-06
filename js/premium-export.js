/**
 * Premium PDF Export Module
 * Extends the basic PDF export with enhanced features for premium members
 * Includes custom branding, templates, and advanced formatting options
 */

class PremiumExport {
    /**
     * Initialize premium export features
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Reference to main assessment
        this.assessment = options.assessment || null;
        
        // PDF generation library (injected or default)
        this.pdfLib = options.pdfLib || window.html2pdf;
        
        // Default branding options
        this.branding = {
            logo: options.logo || '/images/valuealign-logo.png',
            primaryColor: options.primaryColor || '#1a56db',
            secondaryColor: options.secondaryColor || '#7e3af2',
            font: options.font || 'Arial, sans-serif',
            template: options.template || 'standard'
        };
        
        // Available templates
        this.templates = {
            standard: { name: 'Standard', class: 'template-standard' },
            executive: { name: 'Executive', class: 'template-executive' },
            minimalist: { name: 'Minimalist', class: 'template-minimalist' },
            creative: { name: 'Creative', class: 'template-creative' }
        };
        
        // Attach to PremiumFeatures if available
        if (window.PremiumFeatures) {
            window.PremiumFeatures.prototype.exportModule = this;
        }
    }
    
    /**
     * Generate a premium-quality PDF with custom branding and template
     * @param {Object} data - The assessment data to export
     * @param {Object} options - Export options (template, branding, etc)
     * @returns {Promise} - Promise that resolves with the PDF blob
     */
    generatePDF(data, options = {}) {
        // Check if we have a valid assessment reference
        if (!this.assessment) {
            console.error('No assessment reference provided');
            return Promise.reject('No assessment reference provided');
        }
        
        // Merge options with defaults
        const exportOptions = {
            ...this.branding,
            ...options
        };
        
        // Create the export container with proper accessibility
        const exportContainer = document.createElement('div');
        exportContainer.setAttribute('role', 'document');
        exportContainer.setAttribute('aria-label', 'Values Assessment PDF Export');
        
        // Apply the selected template
        const templateClass = this.templates[exportOptions.template]?.class || this.templates.standard.class;
        exportContainer.className = `premium-export-container ${templateClass}`;
        
        // Create header with logo and branding
        const header = this.createHeader(exportOptions);
        exportContainer.appendChild(header);
        
        // Create title section
        const titleSection = document.createElement('div');
        titleSection.className = 'export-title-section';
        
        const title = document.createElement('h1');
        title.className = 'export-title';
        title.textContent = 'Values Assessment Results';
        
        const subtitle = document.createElement('p');
        subtitle.className = 'export-subtitle';
        subtitle.textContent = `Generated on ${new Date().toLocaleDateString()}`;
        
        titleSection.appendChild(title);
        titleSection.appendChild(subtitle);
        exportContainer.appendChild(titleSection);
        
        // Add priorities values section
        const valuesSection = this.createValuesSection(data);
        exportContainer.appendChild(valuesSection);
        
        // Add reflection section if available
        if (data.reflectionResponses && Object.keys(data.reflectionResponses).length > 0) {
            const reflectionSection = this.createReflectionSection(data);
            exportContainer.appendChild(reflectionSection);
        }
        
        // Add footer with branding
        const footer = this.createFooter(exportOptions);
        exportContainer.appendChild(footer);
        
        // Add to DOM temporarily (not visible)
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        document.body.appendChild(exportContainer);
        
        // Generate PDF with html2pdf or equivalent
        if (this.pdfLib) {
            const pdfOptions = {
                margin: 10,
                filename: 'ValueAlign-Assessment.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Return promise for PDF generation
            return this.pdfLib(exportContainer, pdfOptions)
                .then(pdf => {
                    // Clean up the DOM
                    document.body.removeChild(exportContainer);
                    return pdf;
                })
                .catch(error => {
                    console.error('PDF generation failed:', error);
                    document.body.removeChild(exportContainer);
                    throw error;
                });
        } else {
            document.body.removeChild(exportContainer);
            return Promise.reject('PDF generation library not available');
        }
    }
    
    /**
     * Create header with logo and branding for PDF
     * @param {Object} options - Branding options
     * @returns {HTMLElement} The header element
     */
    createHeader(options) {
        const header = document.createElement('header');
        header.className = 'export-header';
        header.style.backgroundColor = options.primaryColor;
        header.style.color = '#ffffff';
        
        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'export-logo-container';
        
        // Logo image
        const logo = document.createElement('img');
        logo.src = options.logo;
        logo.alt = 'ValueAlign Logo';
        logo.className = 'export-logo';
        
        logoContainer.appendChild(logo);
        header.appendChild(logoContainer);
        
        return header;
    }
    
    /**
     * Create values section with visualizations
     * @param {Object} data - Assessment data
     * @returns {HTMLElement} Values section element
     */
    createValuesSection(data) {
        const valuesSection = document.createElement('section');
        valuesSection.className = 'export-values-section';
        valuesSection.setAttribute('role', 'region');
        valuesSection.setAttribute('aria-labelledby', 'values-section-title');
        
        const sectionTitle = document.createElement('h2');
        sectionTitle.id = 'values-section-title';
        sectionTitle.textContent = 'Your Top Values';
        sectionTitle.className = 'export-section-title';
        
        valuesSection.appendChild(sectionTitle);
        
        // Create values list
        const valuesList = document.createElement('ol');
        valuesList.className = 'export-values-list';
        valuesList.setAttribute('role', 'list');
        
        // Add each value
        if (data.prioritizedValues && data.prioritizedValues.length > 0) {
            // Try to get value metadata
            const valuesData = window.valuesData || [];
            
            data.prioritizedValues.forEach((valueId, index) => {
                const valueData = valuesData.find(v => v.id === valueId) || { name: valueId, description: '' };
                
                const valueItem = document.createElement('li');
                valueItem.className = 'export-value-item';
                valueItem.setAttribute('role', 'listitem');
                
                const valueRank = document.createElement('span');
                valueRank.className = 'export-value-rank';
                valueRank.textContent = `${index + 1}. `;
                
                const valueName = document.createElement('span');
                valueName.className = 'export-value-name';
                valueName.textContent = valueData.name;
                
                const valueDesc = document.createElement('p');
                valueDesc.className = 'export-value-description';
                valueDesc.textContent = valueData.description;
                
                valueItem.appendChild(valueRank);
                valueItem.appendChild(valueName);
                valueItem.appendChild(valueDesc);
                valuesList.appendChild(valueItem);
            });
        } else {
            // No values selected
            const noValues = document.createElement('p');
            noValues.textContent = 'No values have been prioritized yet.';
            valuesList.appendChild(noValues);
        }
        
        valuesSection.appendChild(valuesList);
        return valuesSection;
    }
    
    /**
     * Create reflection section with user responses
     * @param {Object} data - Assessment data including reflections
     * @returns {HTMLElement} Reflection section element
     */
    createReflectionSection(data) {
        const reflectionSection = document.createElement('section');
        reflectionSection.className = 'export-reflection-section';
        reflectionSection.setAttribute('role', 'region');
        reflectionSection.setAttribute('aria-labelledby', 'reflection-section-title');
        
        const sectionTitle = document.createElement('h2');
        sectionTitle.id = 'reflection-section-title';
        sectionTitle.textContent = 'Your Value Reflections';
        sectionTitle.className = 'export-section-title';
        
        reflectionSection.appendChild(sectionTitle);
        
        // Process reflections by value
        const reflectionsByValue = {};
        const valuesData = window.valuesData || [];
        
        // Group reflections by value
        Object.entries(data.reflectionResponses).forEach(([key, response]) => {
            if (!response) return; // Skip empty responses
            
            const [valueId, promptIndex] = key.split('-');
            
            if (!reflectionsByValue[valueId]) {
                reflectionsByValue[valueId] = [];
            }
            
            reflectionsByValue[valueId][promptIndex] = response;
        });
        
        // Render each value's reflections
        Object.entries(reflectionsByValue).forEach(([valueId, responses]) => {
            const valueData = valuesData.find(v => v.id === valueId) || { name: valueId, description: '' };
            
            const valueReflection = document.createElement('div');
            valueReflection.className = 'export-value-reflection';
            
            const valueTitle = document.createElement('h3');
            valueTitle.className = 'export-value-title';
            valueTitle.textContent = valueData.name;
            
            valueReflection.appendChild(valueTitle);
            
            // Standard reflection prompts
            const prompts = [
                `How does ${valueData.name} guide your decisions?`,
                `When have you demonstrated this value recently?`,
                `What obstacles prevent you from fully living this value?`
            ];
            
            // Add each reflection response
            responses.forEach((response, index) => {
                if (!response) return; // Skip empty responses
                
                const promptContainer = document.createElement('div');
                promptContainer.className = 'export-reflection-prompt';
                
                const promptLabel = document.createElement('h4');
                promptLabel.className = 'export-prompt-label';
                promptLabel.textContent = prompts[index] || `Reflection ${index + 1}`;
                
                const promptResponse = document.createElement('p');
                promptResponse.className = 'export-prompt-response';
                promptResponse.textContent = response;
                
                promptContainer.appendChild(promptLabel);
                promptContainer.appendChild(promptResponse);
                valueReflection.appendChild(promptContainer);
            });
            
            reflectionSection.appendChild(valueReflection);
        });
        
        return reflectionSection;
    }
    
    /**
     * Create footer with branding
     * @param {Object} options - Branding options
     * @returns {HTMLElement} Footer element
     */
    createFooter(options) {
        const footer = document.createElement('footer');
        footer.className = 'export-footer';
        
        const footerText = document.createElement('p');
        footerText.className = 'export-footer-text';
        footerText.textContent = 'ValueAlign Premium Assessment';
        
        const footerDate = document.createElement('p');
        footerDate.className = 'export-footer-date';
        footerDate.textContent = new Date().toLocaleDateString();
        
        footer.appendChild(footerText);
        footer.appendChild(footerDate);
        
        return footer;
    }
}

// Export the module
window.PremiumExport = PremiumExport;
