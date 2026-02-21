// Hindi Engine v5.0 - Final Fix
window.loadHindiEngine = function(textAreaId) {
    const area = document.getElementById(textAreaId);
    if (!area) return;

    let isHindiActive = true;

    // 1. Transliteration Logic
    area.addEventListener('keydown', async function(e) {
        if (!isHindiActive) return;
        
        if (e.code === 'Space' || e.code === 'Enter') {
            const cursorPos = area.selectionStart;
            const text = area.value;
            const textBeforeCursor = text.substring(0, cursorPos);
            const textAfterCursor = text.substring(cursorPos);
            
            const words = textBeforeCursor.trim().split(/\s+/);
            const lastWord = words[words.length - 1];

            if (lastWord && lastWord.length > 0) {
                try {
                    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(lastWord)}&ime=transliteration_en_hi&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi`;
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data[0] === 'SUCCESS' && data[1][0][1].length > 0) {
                        const hindiWord = data[1][0][1][0];
                        const lastIndex = textBeforeCursor.lastIndexOf(lastWord);
                        const newBefore = textBeforeCursor.substring(0, lastIndex) + hindiWord;
                        
                        area.value = newBefore + (e.code === 'Space' ? ' ' : '\n') + textAfterCursor;
                        const newPos = newBefore.length + 1;
                        area.setSelectionRange(newPos, newPos);
                        e.preventDefault();
                    }
                } catch (err) {
                    console.error("API Fetch Error");
                }
            }
        }
    });

    // 2. Ctrl + G Toggle
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            isHindiActive = !isHindiActive;
            const statusBox = document.getElementById('typing-status');
            if(statusBox) {
                statusBox.innerText = isHindiActive ? "Hindi Active" : "English Active";
                statusBox.style.color = isHindiActive ? "#34c759" : "#ff3b30";
            }
        }
    });

    // 3. Voice Recognition Fix
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'hi-IN';
            recognition.onstart = () => { micBtn.innerHTML = "🛑 Sun rha hu..."; micBtn.style.background = "#000"; };
            recognition.onresult = (event) => {
                area.value += event.results[0][0].transcript + " ";
                document.getElementById('count').innerText = area.value.length;
            };
            recognition.onend = () => { micBtn.innerHTML = "🎤 Speak Hindi"; micBtn.style.background = "#ff3b30"; };
            micBtn.onclick = () => { recognition.start(); };
        } else {
            micBtn.innerHTML = "Voice Not Supported";
        }
    }
};

// Dictionary
window.searchDict = async function() {
    const word = document.getElementById('dictInput').value;
    const out = document.getElementById('dictOut');
    if (!word) return;
    out.innerText = "Khoj rha hu...";
    try {
        const res = await fetch(`https://inputtools.google.com/request?text=${word}&ime=transliteration_en_hi&num=5`);
        const data = await res.json();
        if (data[0] === 'SUCCESS') {
            out.innerHTML = "<b>Sahi Shabd:</b> " + data[1][0][1].join(", ");
        }
    } catch (e) { out.innerText = "Error!"; }
};
