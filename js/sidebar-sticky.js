/**
 * Enhanced sidebar sticky functionality
 * This script ensures the sidebar stays visible while scrolling through portal content
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get the sidebar element
  const sidebar = document.getElementById('portal-sidebar');
  
  if (sidebar) {
    // Variables to track scroll position
    let lastScrollTop = 0;
    const headerHeight = 80; // Height of fixed header in pixels
    
    // Function to update sidebar position
    function updateSidebarPosition() {
      // Only apply sticky behavior on desktop screens
      if (window.innerWidth >= 1024) {
        const scrollTop = window.scrollY;
        const sidebarRect = sidebar.getBoundingClientRect();
        const sidebarHeight = sidebarRect.height;
        const viewportHeight = window.innerHeight;
        
        // Check if sidebar is taller than viewport
        const sidebarFitsInViewport = sidebarHeight < (viewportHeight - headerHeight);
        
        if (sidebarFitsInViewport) {
          // If sidebar fits in viewport, use standard sticky positioning
          sidebar.style.position = 'sticky';
          sidebar.style.top = headerHeight + 'px';
        } else {
          // If sidebar is taller than viewport, add scroll behavior
          if (scrollTop > lastScrollTop) {
            // Scrolling down
            if (sidebarRect.bottom < viewportHeight) {
              sidebar.style.position = 'sticky';
              sidebar.style.top = (headerHeight - (sidebarHeight - viewportHeight + headerHeight)) + 'px';
            }
          } else {
            // Scrolling up
            if (sidebarRect.top < headerHeight) {
              sidebar.style.position = 'sticky';
              sidebar.style.top = headerHeight + 'px';
            }
          }
        }
        
        lastScrollTop = scrollTop;
      } else {
        // Reset styles on mobile
        sidebar.style.position = '';
        sidebar.style.top = '';
      }
    }
    
    // Apply initial position
    updateSidebarPosition();
    
    // Update on scroll
    window.addEventListener('scroll', updateSidebarPosition);
    
    // Update on resize
    window.addEventListener('resize', updateSidebarPosition);
  }
});
