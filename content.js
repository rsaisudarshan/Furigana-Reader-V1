let kuroshiroInstance = null;
let isProcessing = false;

async function initFurigana() {
    const KuroshiroClass = Kuroshiro.default || Kuroshiro;
    const AnalyzerClass = (typeof KuromojiAnalyzer === 'object' && KuromojiAnalyzer.default) 
                          ? KuromojiAnalyzer.default 
                          : KuromojiAnalyzer;

    kuroshiroInstance = new KuroshiroClass();
    const dictPath = chrome.runtime.getURL("dict/");
    
    try {
        await kuroshiroInstance.init(new AnalyzerClass({ dictPath: dictPath }));
        
        // 1. Initial pass over the static HTML that loaded first
        await processDOM(document.body);
        
        // 2. Setup the observer to watch for dynamic changes (infinite scrolling, client-side routing)
        setupMutationObserver();
    } catch (error) {
        console.error("Furigana Engine failed to load:", error);
    }
}

async function processDOM(rootNode) {
    if (!kuroshiroInstance) return;

    // Use a custom filter to actively reject nodes we have already converted
    const filter = {
        acceptNode: function(node) {
            const parent = node.parentElement;
            if (parent) {
                // Reject if it's already inside our custom span or standard ruby tags
                if (parent.classList.contains('furigana-injected') || 
                    parent.tagName === 'RUBY' || 
                    parent.tagName === 'RT') {
                    return NodeFilter.FILTER_REJECT;
                }
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    };

    const walk = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, filter, false);
    let node;
    const textNodes = [];

    while (node = walk.nextNode()) {
        const text = node.nodeValue.trim();
        if (text !== "" && /[\u4e00-\u9faf]/.test(text)) { 
            textNodes.push(node);
        }
    }

    for (const textNode of textNodes) {
        const originalText = textNode.nodeValue;
        
        try {
            const furiganaHTML = await kuroshiroInstance.convert(originalText, { mode: "furigana", to: "hiragana" });
            
            if (furiganaHTML !== originalText) {
                const span = document.createElement("span");
                span.className = "furigana-injected"; // Tag this element to prevent observer loops
                span.innerHTML = furiganaHTML;
                
                if (textNode.parentNode) {
                    textNode.parentNode.replaceChild(span, textNode);
                }
            }
        } catch (err) {
            console.warn("Conversion failed:", err);
        }
    }
}

function setupMutationObserver() {
    let debounceTimer;
    
    const observer = new MutationObserver((mutations) => {
        clearTimeout(debounceTimer);
        
        // Debounce: Wait 400ms after the DOM stops changing before parsing
        debounceTimer = setTimeout(async () => {
            if (isProcessing) return;
            isProcessing = true;

            const newNodesToProcess = [];

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    // Only process standard HTML elements. Ignore text fragments or our own injected ruby tags.
                    if (node.nodeType === Node.ELEMENT_NODE && 
                        !node.classList?.contains('furigana-injected') && 
                        node.tagName !== 'RUBY') {
                        newNodesToProcess.push(node);
                    }
                }
            }

            // Process the newly discovered elements
            for (const node of newNodesToProcess) {
                await processDOM(node);
            }

            isProcessing = false;
        }, 400); 
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

// Check storage and initialize
chrome.storage.local.get(['isFuriganaEnabled'], (result) => {
    if (result.isFuriganaEnabled === true) {
        initFurigana();
    }
});