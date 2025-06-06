/**
 * Script to fix the member badge text
 * This script runs after the page loads and replaces any "FREE" badges with "Basic"
 */
document.addEventListener('DOMContentLoaded', function() {
  // Function to replace FREE with Basic
  function replaceFreeWithBasic() {
    // Look for elements with class "free" or text content "FREE"
    const elements = document.querySelectorAll('.free, [class*="free"]');
    elements.forEach(el => {
      if (el.textContent.trim() === 'FREE') {
        console.log('[fix-member-badge] Replacing FREE badge with Basic');
        el.textContent = 'BASIC';
      }
    });

    // Direct approach for the specific element in the screenshot
    const freeElement = document.querySelector('.bg-va-accent');
    if (freeElement && freeElement.textContent.trim() === 'FREE') {
      console.log('[fix-member-badge] Replacing FREE element with Basic');
      freeElement.textContent = 'BASIC';
    }
    
    // Also fix the member type badge if it exists
    const memberTypeBadge = document.getElementById('member-type-badge');
    if (memberTypeBadge && memberTypeBadge.textContent.includes('Free')) {
      console.log('[fix-member-badge] Fixing member type badge');
      memberTypeBadge.textContent = memberTypeBadge.textContent.replace('Free', 'Basic');
    }
  }
  
  // Run immediately after DOM loads
  replaceFreeWithBasic();
  
  // Also run after a short delay to catch dynamically added elements
  setTimeout(replaceFreeWithBasic, 500);
  setTimeout(replaceFreeWithBasic, 1000);
  
  // Set up a mutation observer to watch for changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        replaceFreeWithBasic();
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
});
