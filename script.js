document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const wordCount = document.getElementById('word-count');
    
    // Variables for autosave
    let saveTimeout;
    const AUTOSAVE_DELAY = 1500; // 1.5 seconds
    const WORD_LIMIT = 100;
    
    // Load content from localStorage first (for instant load)
    const loadFromLocalStorage = () => {
        const savedText = localStorage.getItem('definitionText');
        if (savedText) {
            editor.innerHTML = savedText;
            updateWordCount();
        }
    };
    
    // Load content from server (may override localStorage if newer)
    const loadFromServer = async () => {
        try {
            // Use absolute URL to ensure it works when accessing the page directly
            const response = await fetch('http://localhost:3000/api/text');
            if (!response.ok) {
                throw new Error('Failed to fetch from server');
            }
            
            const data = await response.json();
            
            // Only update if server has content and it's newer than local
            if (data.text) {
                const localTimestamp = localStorage.getItem('lastSaved') || 0;
                
                if (!localTimestamp || data.updatedAt > parseInt(localTimestamp)) {
                    editor.innerHTML = data.text;
                    localStorage.setItem('definitionText', data.text);
                    localStorage.setItem('lastSaved', data.updatedAt.toString());
                    updateWordCount();
                }
            }
        } catch (error) {
            console.error('Error loading from server:', error);
        }
    };
    
    // Count words and enforce limit
    const updateWordCount = () => {
        const text = editor.innerText.trim();
        const words = text ? text.split(/\s+/) : [];
        const count = words.length;
        
        wordCount.textContent = count;
        
        // Enforce word limit
        if (count > WORD_LIMIT) {
            // Split by words and rejoin only the first 100
            const limitedText = words.slice(0, WORD_LIMIT).join(' ');
            editor.innerText = limitedText;
            wordCount.textContent = WORD_LIMIT;
        }
    };
    
    // Save to localStorage and server
    const saveContent = async () => {
        const text = editor.innerHTML;
        const timestamp = Date.now();
        
        // Save to localStorage
        localStorage.setItem('definitionText', text);
        localStorage.setItem('lastSaved', timestamp.toString());
        
        // Save to server
        try {
            // Use absolute URL to ensure it works when accessing the page directly
            const response = await fetch('http://localhost:3000/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    updatedAt: timestamp
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save to server');
            }
            
            console.log('Content saved successfully');
        } catch (error) {
            console.error('Error saving to server:', error);
        }
    };
    
    // Debounced autosave
    const debouncedSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveContent, AUTOSAVE_DELAY);
    };
    
    // Event listeners
    editor.addEventListener('input', () => {
        updateWordCount();
        debouncedSave();
    });
    
    // Force uppercase on input
    editor.addEventListener('keyup', () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const start = range.startOffset;
        
        // Store selection position
        const selectionStart = range.startOffset;
        const selectionEnd = range.endOffset;
        
        // Convert to uppercase
        editor.innerHTML = editor.innerHTML.toUpperCase();
        
        // Restore selection
        try {
            if (selection.rangeCount > 0) {
                const textNode = editor.firstChild || editor;
                const newRange = document.createRange();
                newRange.setStart(textNode, selectionStart);
                newRange.setEnd(textNode, selectionEnd);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
        } catch (e) {
            console.log('Selection restoration error:', e);
        }
    });
    
    // Paste as plain text
    editor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        document.execCommand('insertText', false, text.toUpperCase());
    });
    
    // Initialize
    loadFromLocalStorage();
    loadFromServer();
});
