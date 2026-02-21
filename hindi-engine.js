/**
 * Professional Hindi Engine v4.0 (Voice + Transliteration + Dark Mode Support)
 */
async function loadHindiEngine(textAreaId) {
    const area = document.getElementById(textAreaId);
    if (!area) return;

    let isHindiActive = true;

    // 1. Transliteration Logic (English to Hindi)
    area.addEventListener('keydown', async (e) => {
        if (!isHindiActive) return;
        if (e.code === 'Space' || e.code === 'Enter') {
            const cursorPos = area.selectionStart;
            const textBeforeCursor = area.value.substring(0, cursorPos);
            const textAfterCursor = area.value.substring(cursorPos);
            const words = textBeforeCursor.split(/\s+/);
            const lastWord = words[words.length - 1];

            if (lastWord.length > 0) {
                try {
                    const response = await fetch(`https://inputtools.google.com/request?text=${lastWord}&ime=transliteration_en_hi&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi`);
                    const data = await response.json();
                    if (data[0] === 'SUCCESS') {
                        const hindiWord = data[1][0][1][0];
                        const newBeforeCursor = textBeforeCursor.substring(0, textBeforeCursor.lastIndexOf(lastWord)) + hindiWord;
                        area.value = newBeforeCursor + (e.code === 'Space' ? ' ' : '\n') + textAfterCursor;
                        const newPos = newBeforeCursor.length + 1;
                        area.setSelectionRange(newPos, newPos);
                        e.preventDefault();
                    }
                } catch (err) { console.error("Service Error"); }
            }
        }
    });

    // Ctrl + G Toggle Switch
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            isHindiActive = !isHindiActive;
            document.getElementById('typing-status').innerText = isHindiActive ? "Hindi Active" : "English Active";
            document.getElementById('typing-status').style.color = isHindiActive ? "#34c759" : "#ff3b30";
        }
    });

    // 2. Voice Recognition Logic
    const micBtn = document.getElementById('micBtn');
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.onstart = () => { micBtn.innerHTML = "🛑 Listening..."; micBtn.style.background = "#000"; };
        recognition.onresult = (event) => {
            area.value += event.results[0][0].transcript + " ";
            document.getElementById('count').innerText = area.value.length;
        };
        recognition.onend = () => { micBtn.innerHTML = "🎤 Speak Hindi"; micBtn.style.background = "#ff3b30"; };
        micBtn.onclick = () => { recognition.start(); };
    } else { micBtn.style.display = 'none'; }
}

async function searchDict() {
    const word = document.getElementById('dictInput').value;
    const out = document.getElementById('dictOut');
    if (!word) return;
    out.innerText = "Searching...";
    try {
        const res = await fetch(`https://inputtools.google.com/request?text=${word}&ime=transliteration_en_hi&num=5`);
        const data = await res.json();
        if (data[0] === 'SUCCESS') {
            out.innerHTML = "<b>Sahi Shabd:</b> " + data[1][0][1].join(", ");
        }
    } catch (e) { out.innerText = "Error!"; }
}
