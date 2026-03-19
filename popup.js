document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggleSwitch');

    // 1. Load the current state from Chrome Storage
    // We set it to default to 'false' (off) so it doesn't run everywhere initially
    chrome.storage.local.get(['isFuriganaEnabled'], (result) => {
        toggle.checked = result.isFuriganaEnabled || false;
    });

    // 2. Listen for clicks on the toggle
    toggle.addEventListener('change', () => {
        const isEnabled = toggle.checked;
        
        // Save the new state
        chrome.storage.local.set({ isFuriganaEnabled: isEnabled }, () => {
            
            // Query Chrome for the currently active tab and reload it
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
        });
    });
});