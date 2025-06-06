// js/portal.js
'use strict';

// --- Global Constants --- START ---
const THEME_KEY = 'valuealign_theme';
const THEMES = ['light', 'dark', 'system'];
const FONT_SIZE_PREF_KEY = 'valuealign_font_size_class_preference';
const DEFAULT_FONT_SIZE_KEY = 'base'; // 'sm', 'base', 'lg'
const FONT_SIZE_CLASSES = {
    'sm': 'text-sm',    // Tailwind class for small text
    'base': 'text-base',  // Tailwind class for base text
    'lg': 'text-lg'     // Tailwind class for large text
};
const ACTIVE_BUTTON_CLASS = 'bg-va-accent'; // Add your preferred active class, e.g., 'bg-blue-500 text-white'
const ACTIVE_BUTTON_TEXT_CLASS = 'text-white'; // Add if your active bg doesn't contrast well with default text
// --- Global Constants --- END ---

// --- Theme Management --- START ---
function getThemePreference() {
    return localStorage.getItem(THEME_KEY) || 'system';
}

function setThemePreference(theme) {
    if (THEMES.includes(theme)) {
        localStorage.setItem(THEME_KEY, theme);
    } else {
        localStorage.setItem(THEME_KEY, 'system');
        // Theme was invalid, defaulting to system
    }
}

function applyTheme(theme) {
    const root = document.documentElement;
    console.log(`[Theme APPLY] === Applying theme: '${theme}' ===`);
    console.log(`[Theme APPLY] Current <html> classes BEFORE any changes:`, root.className);

    // Standardize: always remove 'dark' first.
    const darkClassExisted = root.classList.contains('dark');
    if (darkClassExisted) {
        root.classList.remove('dark');
        console.log(`[Theme APPLY] 'dark' class was present and has been REMOVED. <html> classes now:`, root.className);
    } else {
        console.log(`[Theme APPLY] 'dark' class was NOT present. <html> classes remain:`, root.className);
    }

    if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log(`[Theme APPLY] Theme is 'system'. System prefers dark: ${systemPrefersDark}`);
        if (systemPrefersDark) {
            root.classList.add('dark');
            console.log(`[Theme APPLY] System prefers dark. 'dark' class ADDED. <html> classes now:`, root.className);
        } else {
            console.log(`[Theme APPLY] System prefers light. 'dark' class remains REMOVED. <html> classes:`, root.className);
        }
    } else if (theme === 'dark') {
        root.classList.add('dark');
        console.log(`[Theme APPLY] Theme is 'dark'. 'dark' class ADDED. <html> classes now:`, root.className);
    } else { // theme === 'light'
        console.log(`[Theme APPLY] Theme is 'light'. 'dark' class remains REMOVED. <html> classes:`, root.className);
    }
    
    console.log(`[Theme APPLY] Finished applying theme '${theme}'. Final <html> classes:`, root.className);
    updateThemeButtonsState(theme); // Update button states after applying theme
}

function updateThemeButtonsState(activeTheme) {
    const settingsPanel = document.getElementById('desktop-settings-panel');
    if (!settingsPanel) {
        // Panel not found, likely because header hasn't been injected yet. This is okay.
        // console.log('[Theme UPDATE_BUTTONS] Settings panel not found during this call. Will try again when panel opens.');
        return;
    }

    console.log(`[Theme UPDATE_BUTTONS] Updating for active theme: '${activeTheme}'`);
    const themeButtons = settingsPanel.querySelectorAll('.theme-option-button');
    if (themeButtons.length === 0) {
        console.warn('[Theme UPDATE_BUTTONS] No theme option buttons found in panel.');
        return;
    }
    
    console.log(`[Theme UPDATE_BUTTONS] Found ${themeButtons.length} theme buttons.`);
    themeButtons.forEach(button => {
        const buttonThemeValue = button.dataset.themeValue;
        button.classList.remove(ACTIVE_BUTTON_CLASS, ACTIVE_BUTTON_TEXT_CLASS, 'font-semibold');
        if (buttonThemeValue === activeTheme) {
            button.classList.add(ACTIVE_BUTTON_CLASS, ACTIVE_BUTTON_TEXT_CLASS, 'font-semibold');
            console.log(`[Theme UPDATE_BUTTONS] Button for '${buttonThemeValue}' marked ACTIVE.`);
        }
    });
    console.log(`[Theme UPDATE_BUTTONS] Finished updating theme buttons.`);
}

function initializeTheme() {
    const currentTheme = getThemePreference();
    console.log(`[Theme INIT] Initializing theme. Stored preference: '${currentTheme}'`);
    applyTheme(currentTheme);
    console.log(`[Theme INIT] Theme initialization complete.`);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getThemePreference();
        console.log('[Theme] System OS preference changed. Current stored app theme:', storedTheme);
        if (storedTheme === 'system') {
            applyTheme('system'); // Re-apply and update button state
        }
    });
}
// --- Theme Management --- END ---

// --- Font Size Management --- START ---
function getFontSizeKeyPreference() {
    return localStorage.getItem(FONT_SIZE_PREF_KEY) || DEFAULT_FONT_SIZE_KEY;
}

function setFontSizeKeyPreference(sizeKey) {
    if (FONT_SIZE_CLASSES.hasOwnProperty(sizeKey)) {
        localStorage.setItem(FONT_SIZE_PREF_KEY, sizeKey);
    } else {
        localStorage.setItem(FONT_SIZE_PREF_KEY, DEFAULT_FONT_SIZE_KEY);
        console.warn(`[FontSize] Invalid font size key '${sizeKey}'. Defaulting to '${DEFAULT_FONT_SIZE_KEY}'.`);
    }
}

function applyFontSizeClass(sizeKey) {
    const root = document.documentElement;
    if (!FONT_SIZE_CLASSES.hasOwnProperty(sizeKey)) {
        console.warn(`[FontSize] Attempted to apply invalid font size key: '${sizeKey}'. Using default.`);
        sizeKey = DEFAULT_FONT_SIZE_KEY;
    }

    // Remove all possible font size classes first
    Object.values(FONT_SIZE_CLASSES).forEach(className => {
        if (className) root.classList.remove(className);
    });

    // Add the selected font size class
    const classToAdd = FONT_SIZE_CLASSES[sizeKey];
    if (classToAdd) {
        root.classList.add(classToAdd);
        console.log(`[FontSize] Applied font size class '${classToAdd}' to <html>.`);
    }
    updateFontSizeButtonsState(sizeKey);
}

function updateFontSizeButtonsState(activeSizeKey) {
    const fontSizeButtons = document.querySelectorAll('#desktop-settings-panel .font-size-option-button');
    fontSizeButtons.forEach(button => {
        button.classList.remove(ACTIVE_BUTTON_CLASS, ACTIVE_BUTTON_TEXT_CLASS, 'font-semibold'); // Reset styles
        if (button.dataset.fontsizeValue === activeSizeKey) {
            button.classList.add(ACTIVE_BUTTON_CLASS, ACTIVE_BUTTON_TEXT_CLASS, 'font-semibold'); // Mark as active
        }
    });
}

function initializeCurrentFontSize() {
    const currentSizeKey = getFontSizeKeyPreference();
    applyFontSizeClass(currentSizeKey); // This will also call updateFontSizeButtonsState
}
// --- Font Size Management --- END ---

// --- Settings Cog Panel Management --- START ---
function initializeSettingsCog() {
    const desktopSettingsButton = document.getElementById('desktop-settings-button');
    const settingsPanel = document.getElementById('desktop-settings-panel');
    const mobileMenuSettingsButton = document.getElementById('mobile-menu-settings-button');
    const mobileMenu = document.getElementById('mobile-menu'); // To close mobile nav panel

    let settingsCogAvailable = false;

    if (settingsPanel) { // Panel must exist for any cog functionality
        if (desktopSettingsButton) {
            settingsCogAvailable = true;
            console.log('[SettingsCog] Initializing for desktop-settings-button.');
            desktopSettingsButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const isExpanded = desktopSettingsButton.getAttribute('aria-expanded') === 'true';
                desktopSettingsButton.setAttribute('aria-expanded', String(!isExpanded));
                settingsPanel.classList.toggle('hidden');
                console.log('[SettingsCog] Desktop button clicked. Panel hidden:', settingsPanel.classList.contains('hidden'));
                if (!isExpanded) { // If opening panel
                    updateThemeButtonsState(getThemePreference());
                    updateFontSizeButtonsState(getFontSizeKeyPreference());
                }
            });
        } else {
            console.warn('[SettingsCog] Desktop settings button not found.');
        }

        if (mobileMenuSettingsButton) {
            settingsCogAvailable = true;
            console.log('[SettingsCog] Initializing for mobile-menu-settings-button.');
            mobileMenuSettingsButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const isPanelCurrentlyHidden = settingsPanel.classList.contains('hidden');
                settingsPanel.classList.toggle('hidden'); // Toggle visibility
                
                // Sync desktop button's aria-expanded as it's the primary visual indicator for the panel
                if (desktopSettingsButton) {
                    desktopSettingsButton.setAttribute('aria-expanded', String(isPanelCurrentlyHidden)); // If panel WAS hidden, it's now open (true)
                }
                console.log('[SettingsCog] Mobile menu settings button clicked. Panel hidden:', settingsPanel.classList.contains('hidden'));
                
                if (isPanelCurrentlyHidden) { // If opening panel
                    updateThemeButtonsState(getThemePreference());
                    updateFontSizeButtonsState(getFontSizeKeyPreference());
                }

                // Close the mobile menu itself
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const mobileMenuButton = document.getElementById('mobile-menu-button');
                    if (mobileMenuButton) {
                        mobileMenuButton.setAttribute('aria-expanded', 'false');
                    }
                    console.log('[SettingsCog] Mobile menu closed by settings button.');
                }
            });
        } else {
            console.log('[SettingsCog] Mobile menu settings button not found (this is okay if not used on all headers).');
        }

        // Common logic for panel dismissal and theme/font buttons
        document.addEventListener('click', (event) => {
            if (!settingsPanel.classList.contains('hidden')) {
                let clickedOutside = !settingsPanel.contains(event.target);
                if (desktopSettingsButton) {
                    clickedOutside = clickedOutside && !desktopSettingsButton.contains(event.target);
                }
                if (mobileMenuSettingsButton) { // Also check mobile button
                    clickedOutside = clickedOutside && !mobileMenuSettingsButton.contains(event.target);
                }

                if (clickedOutside) {
                    if (desktopSettingsButton) {
                        desktopSettingsButton.setAttribute('aria-expanded', 'false');
                    }
                    settingsPanel.classList.add('hidden');
                    console.log('[SettingsCog] Clicked outside. Panel hidden:', settingsPanel.classList.contains('hidden'));
                }
            }
        });

        const themeButtonsInPanel = settingsPanel.querySelectorAll('.theme-option-button');
        const fontSizeButtonsInPanel = settingsPanel.querySelectorAll('.fontsize-option-button');

        themeButtonsInPanel.forEach(button => {
            button.addEventListener('click', () => {
                const themeValue = button.dataset.themeValue;
                setThemePreference(themeValue);
                applyTheme(themeValue);
                settingsPanel.classList.add('hidden');
                if (desktopSettingsButton) desktopSettingsButton.setAttribute('aria-expanded', 'false');
            });
        });

        fontSizeButtonsInPanel.forEach(button => {
            button.addEventListener('click', () => {
                const fontSizeValue = button.dataset.fontsizeValue;
                setFontSizeKeyPreference(fontSizeValue);
                applyFontSizeClass(fontSizeValue);
                settingsPanel.classList.add('hidden');
                if (desktopSettingsButton) desktopSettingsButton.setAttribute('aria-expanded', 'false');
            });
        });
        
    } else {
        console.warn('[SettingsCog] Settings panel (desktop-settings-panel) not found. All cog functionality disabled.');
    }

    if (settingsCogAvailable) {
         console.log('[SettingsCog] Settings cog initialized.');
    } else if (settingsPanel) { // Panel exists but no buttons
        console.warn('[SettingsCog] Settings panel found, but no control buttons (desktop or mobile) found for it.');
    }
    // If settingsPanel itself is not found, the warning is already issued above.
}
// --- Settings Cog Panel Management --- END --- 

// --- User and Auth Management (largely unchanged, ensure no conflicts) --- 

// Function to get the logged-in user from localStorage
function getLoggedInUser() {
    const userString = localStorage.getItem('loggedInUser');
    if (userString) {
        try {
            return JSON.parse(userString);
        } catch (e) {
            console.error('Error parsing loggedInUser from localStorage:', e);
            localStorage.removeItem('loggedInUser');
            return null;
        }
    }
    return null;
}

// Function to check login status - DOES NOT redirect (authManager handles that)
function checkLoginStatus() {
    console.log('[Portal] checkLoginStatus: Checking login via authManager instead of portal.js logic');
    
    // Get authentication state from the globally available authManager object
    if (window.authManager) {
        const isAuthenticated = window.authManager.isAuthenticated();
        const user = window.authManager.getCurrentUser();
        console.log('[Portal] checkLoginStatus: authManager says authenticated =', isAuthenticated);
        return isAuthenticated && user;
    }
    
    // Fallback to localStorage if authManager isn't available
    console.log('[Portal] checkLoginStatus: authManager unavailable, checking localStorage directly');
    return localStorage.getItem('valuealign_authenticated') === 'true';
}

// Helper function to check if AI features should be enabled for the current user
function aiEnabled() {
    const loggedInUser = getLoggedInUser();
    return loggedInUser && loggedInUser.plan === 'plus';
}

// Function to handle logout
function handleLogout() {
    console.log('Logging out user...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// --- Utility Functions --- START ---
function updateFooterYear() {
    const yearElement = document.getElementById('currentYearFooter');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}
// --- Utility Functions --- END ---

// --- Navigation and Menu Initializers (ensure no conflicts) ---
function setActiveNavigationLinks() {
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || currentPage === 'ValueAlign_Website_Prototype') {
        currentPage = 'dashboard.html';
    }

    const setActive = (links) => {
        links.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            link.classList.remove('text-va-primary', 'font-semibold', 'border-b-2', 'border-va-primary', 'bg-gray-100', 'dark:bg-gray-700', 'dark:text-va-accent-dark'); 
            link.classList.remove(ACTIVE_BUTTON_CLASS, ACTIVE_BUTTON_TEXT_CLASS); // Also remove settings active classes if they were somehow applied
            
            if (linkPage === currentPage) {
                link.classList.add('text-va-primary', 'dark:text-va-accent-dark', 'font-semibold');
                if (link.closest('.main-nav-links')) {
                    link.classList.add('border-b-2', 'border-va-primary');
                }
            } else {
                 // Ensure non-active links have default styling
                link.classList.add('text-va-nav-text', 'dark:text-gray-300');
                link.classList.remove('text-va-primary', 'dark:text-va-accent-dark');
            }
        });
    };

    const desktopNavLinks = document.querySelectorAll('.main-nav-links a');
    const mobileNavLinks = document.querySelectorAll('#mobile-main-nav a');
    const accountLinks = document.querySelectorAll('#desktop-user-menu-dropdown a, #mobile-menu .flex-shrink-0.p-4 a'); // Simplified selector

    if(desktopNavLinks.length > 0) setActive(desktopNavLinks);
    if(mobileNavLinks.length > 0) setActive(mobileNavLinks);
    // For account links, we might not want the same 'active' styling, or a different one.
    // For now, let's assume they don't get the primary 'active page' styling.
    // setActive(accountLinks); 
}


function initializeMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel'); // The actual sliding panel
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const closeButton = document.getElementById('close-mobile-menu-button');
    const mobileMenuContainer = document.getElementById('mobile-menu'); // Parent div that gets 'hidden' toggled

    if (!menuButton || !mobileMenuContainer) { // Made panel, overlay, and closeButton optional
        console.warn('[MobileMenu] One or more mobile menu elements not found. Mobile menu functionality may be limited.');
        return;
    }

    const openMenu = () => {
        mobileMenuContainer.classList.remove('hidden'); // Show the main container
        // For slide-in effect, you might need classes that trigger transitions.
        // Assuming 'hidden' on mobileMenuPanel or specific transform classes manage visibility.
        // This example assumes toggling 'hidden' on the main container is enough, 
        // and CSS handles the panel's appearance.
        menuButton.setAttribute('aria-expanded', 'true');
        // If your panel slides from off-screen, ensure its initial state is off-screen
        // and then transition it on-screen. Tailwind typically uses translate classes.
        // For simplicity, we'll assume 'hidden' on mobileMenuContainer is the primary control.
    };

    const closeMenu = () => {
        mobileMenuContainer.classList.add('hidden'); // Hide the main container
        menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        if (mobileMenuContainer.classList.contains('hidden')) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeMenu);
    }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMenu);
    }

    // Close menu if Esc key is pressed
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenuContainer.classList.contains('hidden')) {
            closeMenu();
        }
    });
    console.log('[MobileMenu] Mobile menu initialized.');
}

function initializeDesktopUserMenu() {
    const menuButton = document.getElementById('desktop-user-menu-button');
    const dropdownMenu = document.getElementById('desktop-user-menu-dropdown');
    // const themeLink = document.getElementById('desktop-theme-link'); // Removed
    const logoutLink = document.getElementById('desktop-logout-link');

    if (!menuButton || !dropdownMenu) {
        console.warn('[DesktopMenu] User menu button or dropdown panel not found.');
        return;
    }

    // if (themeLink) { // Removed
    //     themeLink.addEventListener('click', cycleThemeAndApply);
    // }
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            handleLogout();
        });
    }

    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true' || false;
        menuButton.setAttribute('aria-expanded', String(!isExpanded));
        dropdownMenu.classList.toggle('hidden');

        // Close settings panel if open
        const settingsPanel = document.getElementById('desktop-settings-panel');
        const settingsButton = document.getElementById('desktop-settings-button');
        if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
            settingsPanel.classList.add('hidden');
            if(settingsButton) settingsButton.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('click', (event) => {
        if (dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
            if (!dropdownMenu.contains(event.target) && !menuButton.contains(event.target)) {
                menuButton.setAttribute('aria-expanded', 'false');
                dropdownMenu.classList.add('hidden');
            }
        }
    });
    console.log('[DesktopMenu] Desktop user menu initialized.');
}

function initializeLoggedInPortalState(user) {
    if (!user) return;

    const usernameDesktop = document.getElementById('portal-username-desktop');
    const usernameMobile = document.getElementById('portal-username-mobile');
    const logoutButtonMobile = document.getElementById('portal-logout-button-mobile');

    if (usernameDesktop) {
        usernameDesktop.textContent = user.firstName || user.username || 'Member';
    }
    if (usernameMobile) {
        usernameMobile.textContent = user.firstName || user.username || 'User';
    }
    if (logoutButtonMobile) {
        logoutButtonMobile.addEventListener('click', (event) => {
            event.preventDefault();
            handleLogout();
        });
    }
    // Any other UI updates based on logged-in user
    console.log('[PortalState] Logged-in portal state initialized for user:', user.username);
}

// --- Main DOMContentLoaded Listener --- START ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log(`[Portal DEBUG] Page loaded: ${window.location.pathname}`);
    
    initializeTheme();
    initializeCurrentFontSize(); // New font size initialization

    // Listen for authManager initialization event or check immediately if already available
    if (window.authManager && window.authManager.isInitialized) {
        console.log("[Portal] AuthManager already initialized, checking auth status immediately");
        checkAndInitializePortalState();
    } else {
        console.log("[Portal] Waiting for authManager to initialize...");
        // Create a custom event listener for auth manager initialization
        document.addEventListener('authManagerInitialized', () => {
            console.log("[Portal] AuthManager initialization event received");
            checkAndInitializePortalState();
        }, { once: true });
        
        // Add a safety timeout just in case the event is never fired
        setTimeout(() => {
            console.log("[Portal] Safety timeout reached for authManager initialization");
            checkAndInitializePortalState();
        }, 500);
    }
    
    // Helper function to check auth status and initialize portal state
    function checkAndInitializePortalState() {
        const isAuthenticated = checkLoginStatus();
        console.log("[Portal DEBUG] Authentication check result:", isAuthenticated);
        
        if (isAuthenticated && window.authManager) {
            const user = window.authManager.getCurrentUser();
            if (user) {
                initializeLoggedInPortalState(user);
                return;
            }
        }
        
        // If we're not authenticated, load the not-logged-in UI (but don't redirect - auth-manager handles that)
        console.log("[Portal] Not authenticated or no user. Loading logged-out UI.");
    }

    updateFooterYear();

    // Older DOMContentLoaded: Header loading and initialization logic removed to prevent duplication.
    // This section is now handled by the newer DOMContentLoaded listener (around line 500+)
    // and the window.initializePortalFeaturesForLoggedInUser function.

    const footerPlaceholder = document.getElementById('portal-footer-placeholder');
    if (footerPlaceholder) {
        fetch('_portal_footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                updateFooterYear(); // Initialize footer year after loading footer
                console.log('[Portal] Footer dynamically loaded.');
            })
            .catch(error => console.error('Error loading footer:', error));
    }

    console.log('[Portal] DOMContentLoaded complete. All initializations attempted.');
});
// --- Main DOMContentLoaded Listener --- END ---



// NEW function to be called once loggedInUser is confirmed and available
let portalStateInitCallCount = 0;
function initializeLoggedInPortalState(user) {
    portalStateInitCallCount++;
    console.log(`[Portal TRACE ${portalStateInitCallCount}] initializeLoggedInPortalState (NEW) CALLED for user:`, user ? user.firstName : 'undefined', 'Call count:', portalStateInitCallCount);
    console.log('[Portal] Initializing logged-in state with user:', user);
    const portalHeaderPlaceholder = document.getElementById('portal-header-placeholder');

    if (portalHeaderPlaceholder) {
        fetch('_portal_header_loggedin.html')
            .then(response => response.ok ? response.text() : Promise.reject('Failed to load logged-in header'))
            .then(data => {
                console.log(`[Portal TRACE ${portalStateInitCallCount}] (NEW) About to set innerHTML for portalHeaderPlaceholder. Current innerHTML: ${portalHeaderPlaceholder.innerHTML}`);
                portalHeaderPlaceholder.innerHTML = data;
                console.log(`[Portal TRACE ${portalStateInitCallCount}] (NEW) FINISHED setting innerHTML for portalHeaderPlaceholder. New innerHTML: ${portalHeaderPlaceholder.innerHTML}`);
                console.log(`[Portal TRACE ${portalStateInitCallCount}] (NEW) About to call initializeSettingsCog().`);
                initializeSettingsCog();
                console.log(`[Portal TRACE ${portalStateInitCallCount}] (NEW) FINISHED initializeSettingsCog().`);
                initializeMobileMenu(); 
                initializeDesktopUserMenu();
                setActiveNavigationLinks(); 
                const desktopUsernameEl = document.getElementById('portal-username-desktop');
                if (desktopUsernameEl) {
                    const displayName = user.first_name || user.username || 'Member';
                    desktopUsernameEl.textContent = displayName;
                }
                const mobileUsernameEl = document.getElementById('portal-username-mobile');
                if (mobileUsernameEl) {
                    const displayName = user.first_name || user.username || 'User Name'; // Keep generic or use user data
                    mobileUsernameEl.textContent = displayName;
                }
            })
            .catch(error => console.error('Error loading logged-in portal header:', error));
    }
    // Footer loading is handled in DOMContentLoaded as it's common
}

// --- Main DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize portal features
    console.log("[Portal DEBUG] Raw localStorage 'accessToken' at very start of DOMContentLoaded:", localStorage.getItem('accessToken'));
    initializeCurrentFontSize();
    initializeTheme();

    const user = getLoggedInUser();
    const accessToken = localStorage.getItem('accessToken');
    const currentPagePath = window.location.pathname;
    const isDashboardPage = currentPagePath.endsWith('/dashboard') || currentPagePath.endsWith('/dashboard.html');
    const portalHeaderPlaceholder = document.getElementById('portal-header-placeholder');

    if (user) {
        console.log('[Portal TRACE DOMContentLoaded] Calling initializeLoggedInPortalState directly because user object exists.');
        initializeLoggedInPortalState(user);
    } else if (accessToken && isDashboardPage) {
        console.log('[Portal] On dashboard, accessToken found but loggedInUser not yet in localStorage. Waiting for dashboard.js to initialize portal state.');
        // dashboard.js will call window.initializePortalFeaturesForLoggedInUser
        // Optionally load a minimal/loading header here if needed
    } else if (!user && currentPagePath.includes('/portal_') && !currentPagePath.endsWith('/login.html') && !currentPagePath.endsWith('/register.html')) {
        // No user (and not on dashboard waiting for async user) and on a protected portal page
        // REMOVED: No longer doing authentication checks here - auth-manager.js handles this
        console.log('[Portal] Portal page detected. Authentication checks delegated to auth-manager.js');
        // Note: We deliberately do NOT redirect here, letting auth-manager.js handle all auth checks
        // This prevents redirect loops and conflicting authentication logic
    } else {
        // User is not logged in (and not on dashboard waiting for async user) OR on a public page.
        // Load logged-out header.
        console.log('[Portal] User not logged in (or on public page). Loading logged-out header.');
        if (portalHeaderPlaceholder) {
            console.log('[Portal DEBUG] Attempting to fetch _portal_header_loggedout.html');
            fetch('_portal_header_loggedout.html')
                .then(response => {
                    console.log('[Portal DEBUG] Fetched _portal_header_loggedout.html response. Status:', response.status, 'OK:', response.ok);
                    if (!response.ok) {
                        console.error('[Portal ERROR] Failed to load _portal_header_loggedout.html. Status:', response.status);
                        return Promise.reject(`Failed to load _portal_header_loggedout.html. Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    portalHeaderPlaceholder.innerHTML = data;
                    initializeMobileMenu(); 
                    setActiveNavigationLinks();
                    initializeSettingsCog(); // Initialize settings cog for logged-out pages
                })
                .catch(error => {
                    console.error('[Portal CRITICAL] CRITICAL Error loading _portal_header_loggedout.html or processing its data:', error);
                });
        }
    }

    const portalFooterPlaceholder = document.getElementById('portal-footer-placeholder');
    if (portalFooterPlaceholder) {
        fetch('_portal_footer.html')
            .then(response => response.ok ? response.text() : Promise.reject('Failed to load footer'))
            .then(data => {
                portalFooterPlaceholder.innerHTML = data;
                updateFooterYear();
            })
            .catch(error => console.error('Error loading portal footer:', error));
    }
    // Expose the initialization function globally for dashboard.js or other scripts to call
    console.log('[Portal TRACE DOMContentLoaded] Exposing initializeLoggedInPortalState to window object.');
    window.initializePortalFeaturesForLoggedInUser = function(userFromDashboard) {
        console.log('[Portal TRACE window.initializePortalFeaturesForLoggedInUser] Called from dashboard.js (or other). User:', userFromDashboard ? userFromDashboard.firstName : 'undefined');
        initializeLoggedInPortalState(userFromDashboard);
    };
});

// ... (rest of the code remains the same)
