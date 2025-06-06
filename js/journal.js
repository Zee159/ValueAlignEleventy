// js/journal.js - Core journal functionality for ValueAlign Eleventy
"use strict";

class JournalManager {
    constructor() {
        // Journal prompts
        this.prompts = [
            "What small step did you take today that moved you closer to one of your core values?",
            "Describe a moment today when you felt most aligned with your values.",
            "What challenged your values today and how did you respond?",
            "What are you grateful for today that aligns with your core values?",
            "How did your actions today reflect your commitment to your values?",
            "What's one thing you learned today that helps you better understand your values?",
            "Reflect on a decision you made today through the lens of your values.",
            "How did you practice self-compassion today while working toward your values?",
            "What's one value you want to focus on tomorrow and why?",
            "How has your understanding of one of your values evolved recently?"
        ];
        
        // DOM elements
        this.promptText = document.getElementById('journal-prompt-text');
        this.journalTextarea = document.getElementById('journal-textarea');
        this.saveButton = document.getElementById('save-journal-btn');
        this.clearButton = document.getElementById('clear-journal-btn');
        this.wordCount = document.getElementById('journal-word-count');
        this.refreshPromptButton = document.getElementById('refresh-prompt-btn');
        this.emotionTaggingSection = document.getElementById('emotion-tagging-section');
        this.aiInsightsSection = document.getElementById('ai-insights-section');
        this.previousEntriesContainer = document.getElementById('previous-entries-container');
        this.noEntriesMessage = document.getElementById('no-entries-message');
        this.loadMoreButton = document.getElementById('load-more-entries');
        this.statusElement = document.getElementById('journal-status');
        
        // Initialize
        this.currentPrompt = 0;
        this.selectedEmotions = [];
        this.entries = [];
        this.displayedEntries = 0;
        this.entriesPerPage = 4;
        
        this.initPage();
    }
    
    /**
     * Initialize the journal page
     */
    initPage() {
        console.log('[JournalManager] Initializing journal page');
        
        // Use a small delay to ensure auth service is fully initialized
        setTimeout(() => {
            // Check if user is authenticated using modern auth system
            if (typeof window.authService !== 'object' || !window.authService) {
                console.error('[JournalManager] authService not found. auth-service.js might not be loaded correctly.');
                this.redirectToLogin();
                return;
            }
            
            // Get current user
            const user = window.authService.getCurrentUser();
            if (!user) {
                console.error('[JournalManager] No logged-in user data found.');
                this.redirectToLogin();
                return;
            }
            
            console.log('[JournalManager] User found:', user.email);
            this.initializeJournalForUser(user);
        }, 100);  // Small delay to ensure auth service is ready
    }
    
    /**
     * Redirect to login if not authenticated
     */
    redirectToLogin() {
        console.log('[JournalManager] Redirecting to login');
        
        // Save current page for redirect after login
        localStorage.setItem('auth_redirect_after_login', window.location.pathname);
        
        // Redirect to login
        window.location.href = '/login/';
    }
    
    /**
     * Initialize journal features after user is authenticated
     */
    initializeJournalForUser(user) {
        
        // Check if user has premium features
        this.isPremium = user.subscription && user.subscription.toLowerCase() !== 'free';
        
        // Show premium features if applicable
        if (this.isPremium) {
            this.emotionTaggingSection.classList.remove('hidden');
            this.aiInsightsSection.classList.remove('hidden');
            this.updateAccessibilityStatus('Premium journal features activated');
        }
        
        // Set random prompt
        this.setRandomPrompt();
        
        // Load saved entries
        this.loadEntries();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('[JournalManager] Journal page initialized');
    }
    
    /**
     * Update accessibility status for screen readers
     * @param {string} message - The message to announce
     */
    updateAccessibilityStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }
    
    /**
     * Set a random journal prompt
     */
    setRandomPrompt() {
        const randomIndex = Math.floor(Math.random() * this.prompts.length);
        if (this.promptText) {
            this.promptText.textContent = this.prompts[randomIndex];
            this.currentPrompt = randomIndex;
            this.updateAccessibilityStatus('New journal prompt loaded');
        }
    }
    
    /**
     * Update word count display
     */
    updateWordCount() {
        if (this.wordCount && this.journalTextarea) {
            const text = this.journalTextarea.value.trim();
            const count = text ? text.split(/\s+/).length : 0;
            this.wordCount.textContent = `${count} word${count !== 1 ? 's' : ''}`;
        }
    }
    
    /**
     * Setup event listeners for the journal page
     */
    setupEventListeners() {
        // Set random prompt when refresh button is clicked
        if (this.refreshPromptButton) {
            this.refreshPromptButton.addEventListener('click', () => {
                this.setRandomPrompt();
            });
        }
        
        // Update word count as user types
        if (this.journalTextarea) {
            this.journalTextarea.addEventListener('input', () => {
                this.updateWordCount();
            });
        }
        
        // Save journal entry
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => {
                this.saveJournalEntry();
            });
        }
        
        // Clear journal entry
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearJournalEntry();
            });
        }
        
        // Setup emotion tag selection
        const emotionTags = document.querySelectorAll('.emotion-tag');
        emotionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.toggleEmotionTag(tag);
            });
        });
        
        // Handle custom emotion tag
        const addEmotionTag = document.querySelector('.add-emotion-tag');
        if (addEmotionTag) {
            addEmotionTag.addEventListener('click', () => {
                this.addCustomEmotionTag();
            });
        }
        
        // Generate AI insights
        const generateInsightsBtn = document.getElementById('generate-insights-btn');
        if (generateInsightsBtn) {
            generateInsightsBtn.addEventListener('click', () => {
                this.generateInsights();
            });
        }
        
        // Load more entries
        if (this.loadMoreButton) {
            this.loadMoreButton.addEventListener('click', () => {
                this.loadMoreEntries();
            });
        }
    }
    
    /**
     * Toggle emotion tag selection
     * @param {HTMLElement} tag - The emotion tag button element
     */
    toggleEmotionTag(tag) {
        const emotion = tag.dataset.emotion;
        const isSelected = tag.getAttribute('aria-pressed') === 'true';
        
        if (isSelected) {
            // Remove from selected emotions
            this.selectedEmotions = this.selectedEmotions.filter(e => e !== emotion);
            tag.setAttribute('aria-pressed', 'false');
            tag.classList.remove('bg-va-accent');
            tag.classList.add('bg-gray-200', 'dark:bg-gray-600');
        } else {
            // Add to selected emotions
            this.selectedEmotions.push(emotion);
            tag.setAttribute('aria-pressed', 'true');
            tag.classList.remove('bg-gray-200', 'dark:bg-gray-600');
            tag.classList.add('bg-va-accent');
        }
    }
    
    /**
     * Add a custom emotion tag
     */
    addCustomEmotionTag() {
        const customEmotion = prompt("Enter a custom emotion:");
        if (customEmotion && customEmotion.trim()) {
            // Create new emotion tag button
            const container = document.getElementById('emotion-tags-container');
            const newTag = document.createElement('button');
            newTag.className = 'emotion-tag bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-va-primary dark:focus:ring-green-500';
            newTag.setAttribute('data-emotion', customEmotion.trim());
            newTag.setAttribute('aria-pressed', 'false');
            newTag.setAttribute('role', 'button');
            newTag.textContent = customEmotion.trim();
            
            // Add event listener
            newTag.addEventListener('click', () => {
                this.toggleEmotionTag(newTag);
            });
            
            // Add to container before the "Add Custom" button
            const addButton = document.querySelector('.add-emotion-tag');
            container.insertBefore(newTag, addButton);
            
            this.updateAccessibilityStatus(`Added custom emotion: ${customEmotion.trim()}`);
        }
    }
    
    /**
     * Save journal entry
     */
    saveJournalEntry() {
        const text = this.journalTextarea.value.trim();
        if (!text) {
            alert("Please write something before saving.");
            this.updateAccessibilityStatus("Please write something before saving your journal entry.");
            return;
        }
        
        // Create new entry object
        const newEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            text: text,
            prompt: this.promptText.textContent,
            emotions: [...this.selectedEmotions]
        };
        
        // Add to entries array
        this.entries.unshift(newEntry);
        
        // Save to localStorage
        this.saveEntriesToStorage();
        
        // Update UI
        this.clearJournalEntry();
        this.displayEntries();
        
        // Show success message
        alert("Journal entry saved successfully!");
        this.updateAccessibilityStatus("Journal entry saved successfully");
    }
    
    /**
     * Clear journal entry form
     */
    clearJournalEntry() {
        if (this.journalTextarea) {
            this.journalTextarea.value = '';
            this.updateWordCount();
        }
        
        // Reset selected emotions
        this.selectedEmotions = [];
        document.querySelectorAll('.emotion-tag').forEach(tag => {
            tag.setAttribute('aria-pressed', 'false');
            tag.classList.remove('bg-va-accent');
            tag.classList.add('bg-gray-200', 'dark:bg-gray-600');
        });
        
        // Hide AI insights if visible
        const insightsResult = document.getElementById('ai-insights-result');
        if (insightsResult) {
            insightsResult.classList.add('hidden');
        }
        
        this.updateAccessibilityStatus("Journal entry form cleared");
    }
    
    /**
     * Load journal entries from storage
     */
    loadEntries() {
        const savedEntries = localStorage.getItem('journalEntries');
        if (savedEntries) {
            try {
                this.entries = JSON.parse(savedEntries);
                this.displayEntries();
            } catch (error) {
                console.error('[JournalManager] Error loading saved entries:', error);
                this.entries = [];
            }
        }
    }
    
    /**
     * Save entries to localStorage
     */
    saveEntriesToStorage() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
    }
    
    /**
     * Display journal entries
     */
    displayEntries() {
        if (!this.previousEntriesContainer) return;
        
        // Clear container
        this.previousEntriesContainer.innerHTML = '';
        
        if (this.entries.length === 0) {
            // Show no entries message
            if (this.noEntriesMessage) {
                this.noEntriesMessage.classList.remove('hidden');
            }
            if (this.loadMoreButton) {
                this.loadMoreButton.classList.add('hidden');
            }
            return;
        }
        
        // Hide no entries message
        if (this.noEntriesMessage) {
            this.noEntriesMessage.classList.add('hidden');
        }
        
        // Display entries
        const entriesToShow = Math.min(this.entriesPerPage, this.entries.length);
        for (let i = 0; i < entriesToShow; i++) {
            this.addEntryToDOM(this.entries[i]);
        }
        
        // Update displayed entries count
        this.displayedEntries = entriesToShow;
        
        // Show/hide load more button
        if (this.loadMoreButton) {
            if (this.displayedEntries < this.entries.length) {
                this.loadMoreButton.classList.remove('hidden');
            } else {
                this.loadMoreButton.classList.add('hidden');
            }
        }
    }
    
    /**
     * Load more entries
     */
    loadMoreEntries() {
        if (this.displayedEntries >= this.entries.length) return;
        
        const moreToLoad = Math.min(this.entriesPerPage, this.entries.length - this.displayedEntries);
        
        for (let i = 0; i < moreToLoad; i++) {
            this.addEntryToDOM(this.entries[this.displayedEntries + i]);
        }
        
        // Update displayed entries count
        this.displayedEntries += moreToLoad;
        
        // Hide load more button if all entries displayed
        if (this.displayedEntries >= this.entries.length && this.loadMoreButton) {
            this.loadMoreButton.classList.add('hidden');
        }
        
        this.updateAccessibilityStatus(`Loaded ${moreToLoad} more journal entries`);
    }
    
    /**
     * Add entry to DOM
     * @param {Object} entry - Journal entry object
     */
    addEntryToDOM(entry) {
        // Get template
        const template = document.getElementById('journal-entry-template');
        if (!template) return;
        
        // Clone template
        const entryElement = template.content.cloneNode(true);
        
        // Set entry content
        const titleElement = entryElement.querySelector('h3');
        const dateElement = entryElement.querySelector('p');
        const contentElement = entryElement.querySelector('.entry-content');
        const emotionsContainer = entryElement.querySelector('.entry-emotions');
        const article = entryElement.querySelector('article');
        
        // Add unique ID for accessibility
        const entryId = `journal-entry-${entry.id}`;
        article.id = entryId;
        
        // Format date
        const entryDate = new Date(entry.date);
        const formattedDate = entryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Set entry data
        if (titleElement) {
            const promptPreview = entry.prompt ? entry.prompt.substring(0, 50) + (entry.prompt.length > 50 ? '...' : '') : 'Journal Entry';
            titleElement.textContent = promptPreview;
            titleElement.id = `title-${entryId}`;
            article.setAttribute('aria-labelledby', `title-${entryId}`);
        }
        
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
        
        if (contentElement) {
            // Truncate content if too long
            const maxChars = 150;
            const displayText = entry.text.length > maxChars 
                ? entry.text.substring(0, maxChars) + '...' 
                : entry.text;
            
            contentElement.textContent = displayText;
        }
        
        // Add emotions if present
        if (emotionsContainer && entry.emotions && entry.emotions.length > 0) {
            emotionsContainer.setAttribute('aria-label', 'Tagged emotions');
            entry.emotions.forEach(emotion => {
                const tag = document.createElement('span');
                tag.className = 'inline-block bg-va-accent-light dark:bg-gray-700 text-va-primary dark:text-green-400 text-xs px-2 py-1 rounded-full';
                tag.textContent = emotion;
                emotionsContainer.appendChild(tag);
            });
        } else if (emotionsContainer) {
            emotionsContainer.classList.add('hidden');
        }
        
        // Set up edit button
        const editButton = entryElement.querySelector('.edit-entry-btn');
        if (editButton) {
            editButton.setAttribute('aria-label', `Edit journal entry from ${formattedDate}`);
            editButton.addEventListener('click', () => {
                this.editEntry(entry.id);
            });
        }
        
        // Set up delete button
        const deleteButton = entryElement.querySelector('.delete-entry-btn');
        if (deleteButton) {
            deleteButton.setAttribute('aria-label', `Delete journal entry from ${formattedDate}`);
            deleteButton.addEventListener('click', () => {
                this.deleteEntry(entry.id);
            });
        }
        
        // Add to container
        this.previousEntriesContainer.appendChild(entryElement);
    }
    
    /**
     * Edit journal entry
     * @param {string} entryId - ID of entry to edit
     */
    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;
        
        // Populate form with entry data
        if (this.journalTextarea) {
            this.journalTextarea.value = entry.text;
            this.updateWordCount();
        }
        
        if (this.promptText && entry.prompt) {
            this.promptText.textContent = entry.prompt;
        }
        
        // Set selected emotions
        this.selectedEmotions = [...(entry.emotions || [])];
        document.querySelectorAll('.emotion-tag').forEach(tag => {
            const emotion = tag.dataset.emotion;
            const isSelected = this.selectedEmotions.includes(emotion);
            tag.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
            if (isSelected) {
                tag.classList.remove('bg-gray-200', 'dark:bg-gray-600');
                tag.classList.add('bg-va-accent');
            } else {
                tag.classList.remove('bg-va-accent');
                tag.classList.add('bg-gray-200', 'dark:bg-gray-600');
            }
        });
        
        // Scroll to top of form
        window.scrollTo({top: 0, behavior: 'smooth'});
        
        // Update button text to indicate editing mode
        if (this.saveButton) {
            this.saveButton.textContent = 'Update Entry';
            this.saveButton.setAttribute('data-edit-id', entry.id);
        }
        
        this.updateAccessibilityStatus(`Editing journal entry from ${new Date(entry.date).toLocaleDateString()}`);
    }
    
    /**
     * Delete journal entry
     * @param {string} entryId - ID of entry to delete
     */
    deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            return;
        }
        
        // Find entry index
        const entryIndex = this.entries.findIndex(e => e.id === entryId);
        if (entryIndex === -1) return;
        
        // Remove entry
        this.entries.splice(entryIndex, 1);
        
        // Save updated entries
        this.saveEntriesToStorage();
        
        // Update UI
        this.displayEntries();
        
        this.updateAccessibilityStatus('Journal entry deleted');
    }
    
    /**
     * Generate AI insights for journal entry
     */
    generateInsights() {
        const text = this.journalTextarea.value.trim();
        if (!text) {
            alert("Please write a journal entry first.");
            this.updateAccessibilityStatus("Please write a journal entry first before generating insights.");
            return;
        }
        
        // Display loading state
        const insightsResult = document.getElementById('ai-insights-result');
        insightsResult.classList.remove('hidden');
        insightsResult.innerHTML = '<p class="text-sm text-gray-700 dark:text-gray-300">Analyzing your entry...</p>';
        this.updateAccessibilityStatus("Analyzing your journal entry");
        
        // In a real implementation, we would call an API here
        // For now, simulate a delay then show mock insights
        setTimeout(() => {
            // Mock insights based on entry length
            const insights = this.getMockInsights(text);
            
            insightsResult.innerHTML = `
                <div class="space-y-3">
                    <p class="text-sm text-gray-700 dark:text-gray-300">${insights.main}</p>
                    <h4 class="text-sm font-semibold text-va-primary dark:text-green-400">Key Themes:</h4>
                    <ul class="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 space-y-1" role="list">
                        ${insights.themes.map(theme => `<li role="listitem">${theme}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            this.updateAccessibilityStatus("AI insights generated for your journal entry");
        }, 1500);
    }
    
    /**
     * Get mock insights for demo purposes
     * @param {string} text - Journal entry text
     * @returns {Object} Mock insights object
     */
    getMockInsights(text) {
        const wordCount = text.split(/\s+/).length;
        
        if (wordCount < 30) {
            return {
                main: "Your entry is brief. Consider expanding your thoughts to unlock deeper insights.",
                themes: ["Conciseness", "Direct expression"]
            };
        } else if (wordCount < 100) {
            return {
                main: "Your entry shows thoughtful reflection. You're engaging well with your values.",
                themes: ["Self-awareness", "Value exploration", "Personal growth"]
            };
        } else {
            return {
                main: "Your detailed entry shows deep introspection. Your commitment to understanding your values is evident.",
                themes: ["Deep reflection", "Comprehensive analysis", "Value integration", "Action orientation"]
            };
        }
    }
}

// Initialize the journal manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.journalManager = new JournalManager();
});
