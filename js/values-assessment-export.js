/**
 * ValueAlign Core Values Assessment Export Functionality
 * Provides PDF export capabilities for assessment results
 * With full keyboard and screen reader accessibility
 */

class AssessmentExporter {
    /**
     * Create a new assessment exporter
     * @param {Function} announceCallback - Function to announce messages to screen readers
     */
    constructor(announceCallback) {
        this.announce = announceCallback || function(message, priority) {};
    }
    
    /**
     * Export values assessment as PDF document
     * @param {Object} data - Assessment data including values and reflections
     * @returns {Promise<boolean>} - Promise resolving to true on success, false on fallback
     */
    exportAsPDF(data) {
        // Announce for screen readers
        this.announce('Preparing your values assessment for export. Please wait.', 'polite');
        
        // Create a container for the PDF content
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-export-container';
        pdfContainer.style.padding = '30px';
        pdfContainer.style.fontFamily = 'Arial, sans-serif';
        pdfContainer.style.maxWidth = '800px';
        pdfContainer.style.margin = '0 auto';
        pdfContainer.style.backgroundColor = '#fff';
        
        let todayDate = new Date();
        let formattedDate = todayDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Add content to the PDF container
        pdfContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
                <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Core Values Assessment</h1>
                <p style="font-size: 18px; color: #666;">ValueAlign &bull; ${formattedDate}</p>
            </div>
            
            <div style="margin-bottom: 40px;">
                <h2 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">Your Top Values</h2>
                <div id="pdf-values-list" style="margin-bottom: 30px;"></div>
                
                <h2 style="color: #2563eb; font-size: 24px; margin-bottom: 20px;">Your Reflections</h2>
                <div id="pdf-reflections"></div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 14px; color: #666;">
                <p>This assessment was created using the ValueAlign Core Values Assessment tool.</p>
                <p>&copy; ValueAlign ${new Date().getFullYear()}</p>
            </div>
        `;
        
        // Add values to PDF
        const valuesListContainer = pdfContainer.querySelector('#pdf-values-list');
        if (valuesListContainer && data.prioritizedValues && data.prioritizedValues.length) {
            data.prioritizedValues.forEach((valueId, index) => {
                const valueData = window.valuesData ? window.valuesData.find(v => v.id === valueId) : null;
                if (!valueData) return;
                
                const valueItem = document.createElement('div');
                valueItem.style.marginBottom = '15px';
                valueItem.style.padding = '15px';
                valueItem.style.borderLeft = index < 3 ? '4px solid #3b82f6' : '1px solid #ccc';
                valueItem.style.borderRadius = '4px';
                valueItem.style.backgroundColor = '#f9fafb';
                
                valueItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h3 style="margin: 0; font-size: 20px; color: #111;">${valueData.name}</h3>
                        <span style="background-color: #e0e7ff; color: #4f46e5; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${index + 1}</span>
                    </div>
                    <p style="margin: 0; color: #4b5563;">${valueData.description}</p>
                `;
                
                valuesListContainer.appendChild(valueItem);
            });
        }
        
        // Add reflections to PDF
        const reflectionsContainer = pdfContainer.querySelector('#pdf-reflections');
        if (reflectionsContainer && data.reflectionResponses) {
            // Add individual value reflections
            if (data.prioritizedValues && data.prioritizedValues.length) {
                const valueReflections = document.createElement('div');
                valueReflections.style.marginBottom = '30px';
                
                valueReflections.innerHTML = `<h3 style="color: #4b5563; font-size: 20px; margin-bottom: 15px;">Values in Detail</h3>`;
                
                data.prioritizedValues.slice(0, 5).forEach((valueId, index) => {
                    const valueData = window.valuesData ? window.valuesData.find(v => v.id === valueId) : null;
                    if (!valueData) return;
                    
                    const reflection = data.reflectionResponses[`reflection-${valueId}`] || 'No reflection provided';
                    
                    const reflectionItem = document.createElement('div');
                    reflectionItem.style.marginBottom = '20px';
                    reflectionItem.style.padding = '15px';
                    reflectionItem.style.backgroundColor = '#f9fafb';
                    reflectionItem.style.borderRadius = '4px';
                    
                    reflectionItem.innerHTML = `
                        <h4 style="margin: 0 0 10px 0; color: #111; font-size: 18px;">${valueData.name}</h4>
                        <p style="margin: 0; white-space: pre-wrap;">${reflection}</p>
                    `;
                    
                    valueReflections.appendChild(reflectionItem);
                });
                
                reflectionsContainer.appendChild(valueReflections);
            }
            
            // Add general reflections
            const promptTitles = {
                'reflection-action': 'How Your Values Show Up in Action',
                'reflection-conflict': 'Values in Tension or Conflict',
                'reflection-alignment': 'Values Alignment in Work and Life'
            };
            
            const generalReflections = document.createElement('div');
            generalReflections.style.marginBottom = '20px';
            
            Object.keys(promptTitles).forEach(promptKey => {
                const reflection = data.reflectionResponses[promptKey];
                if (reflection) {
                    const reflectionItem = document.createElement('div');
                    reflectionItem.style.marginBottom = '25px';
                    
                    reflectionItem.innerHTML = `
                        <h3 style="color: #4b5563; font-size: 20px; margin-bottom: 10px;">${promptTitles[promptKey]}</h3>
                        <div style="padding: 15px; background-color: #f9fafb; border-radius: 4px;">
                            <p style="margin: 0; white-space: pre-wrap;">${reflection}</p>
                        </div>
                    `;
                    
                    generalReflections.appendChild(reflectionItem);
                }
            });
            
            reflectionsContainer.appendChild(generalReflections);
        }
        
        return this.generatePDF(pdfContainer);
    }
    
    /**
     * Generate PDF from container
     * @param {HTMLElement} container - Container with content for PDF
     */
    generatePDF(container) {
        // Create a temporary container in the document to generate the PDF
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.appendChild(container);
        document.body.appendChild(tempContainer);
        
        // Return promise that resolves when PDF is generated
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if html2pdf is available
                if (typeof html2pdf !== 'undefined') {
                    // Use html2pdf if available
                    this.announce('Generating PDF. This may take a moment.', 'polite');
                    
                    const options = {
                        margin: 10,
                        filename: 'ValueAlign_Core_Values_Assessment.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };
                    
                    html2pdf(container, options)
                        .then(() => {
                            document.body.removeChild(tempContainer);
                            this.announce('PDF export complete', 'polite');
                            resolve(true);
                        })
                        .catch(error => {
                            console.error('PDF generation failed:', error);
                            this.announce('There was a problem exporting your PDF. Using print dialog instead.', 'polite');
                            this.fallbackToPrint(tempContainer);
                            resolve(false);
                        });
                } else {
                    // Fallback to print dialog if html2pdf is not available
                    this.announce('PDF export module not available. Using print dialog instead.', 'polite');
                    this.fallbackToPrint(tempContainer);
                    resolve(false);
                }
            }, 100);
        });
    }
    
    /**
     * Fallback print method when html2pdf is not available
     * @param {HTMLElement} container - Container with content to print
     */
    fallbackToPrint(container) {
        // Let the user know we're using print instead
        this.announce('Opening print dialog. Please use your browser\'s print function to save as PDF.', 'assertive');
        
        // Store the current body content
        const originalContent = document.body.innerHTML;
        
        // Set print content
        document.body.innerHTML = container.innerHTML;
        
        // Print
        window.print();
        
        // Restore original content
        document.body.innerHTML = originalContent;
        
        // Reload the page to reinitialize
        window.location.reload();
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AssessmentExporter = AssessmentExporter;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssessmentExporter;
}
