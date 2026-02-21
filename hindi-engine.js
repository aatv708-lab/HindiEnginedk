// Hindi Engine v7.0 - Special Symbols & Purna Viram Support
window.loadHindiEngine = function(textAreaId) {
    const area = document.getElementById(textAreaId);
    if (!area) return;

    let isHindiActive = true;

    area.addEventListener('keydown', async function(e) {
        if (!isHindiActive) return;

        // 1. Auto Purna Viram (Dot to ।)
        if (e.key === '.') {
            e.preventDefault();
            const start = area.selectionStart;
            const end = area.selectionEnd;
            area.setRangeText('।', start, end, 'end');
            return;
        }

        // 2. Transliteration on Space or Enter
        if (e.code === 'Space' || e.code === 'Enter') {
            const cursorPos = area.selectionStart;
            const textBefore = area.value.substring(0, cursorPos);
            const textAfter = area.value.substring(cursorPos);
            
            const words = textBefore.split(/\s+/);
            const lastWord = words[words.length - 1];

            // Agar sirf symbols ya numbers hain toh convert mat karo
            if (lastWord && /[a-zA-Z]/.test(lastWord)) {
                try {
                    const response = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(lastWord)}&ime=transliteration_en_hi&num=1`);
                    const data = await response.json();
                    if (data[0] === 'SUCCESS') {
                        const hindiWord = data[1][0][1][0];
                        const newBefore = textBefore.substring(0, textBefore.lastIndexOf(lastWord)) + hindiWord;
                        area.value = newBefore + (e.code === 'Space' ? ' ' : '\n') + textAfter;
                        const newPos = newBefore.length + 1;
                        area.setSelectionRange(newPos, newPos);
                        e.preventDefault();
                    }
                } catch (err) { console.error("API Error"); }
            }
        }
    });
};

// Tool Buttons Logic
window.insertChar = function(char) {
    const area = document.getElementById('hindiArea');
    const start = area.selectionStart;
    const end = area.selectionEnd;
    area.setRangeText(char, start, end, 'end');
    area.focus();
};
