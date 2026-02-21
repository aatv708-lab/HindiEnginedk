window.loadHindiEngine = function(textAreaId) {
    const area = document.getElementById(textAreaId);
    if (!area) return;

    let isHindiActive = true;
    let lastEngWord = "";

    // 1. Suggestion Menu Setup
    let menu = document.getElementById('hindi-suggestions');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'hindi-suggestions';
        menu.style.cssText = "position:absolute; display:none; background:#fff; border:1px solid #ccc; box-shadow:0 4px 12px rgba(0,0,0,0.2); z-index:10000; border-radius:8px; width:160px; overflow:hidden;";
        document.body.appendChild(menu);
    }

    // 2. Transliteration Function
    async function fetchHindi(word, callback) {
        try {
            const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&ime=transliteration_en_hi&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi`;
            const response = await fetch(url);
            const data = await response.json();
            if (data[0] === 'SUCCESS') callback(data[1][0][1]);
        } catch (err) { console.error("API Error"); }
    }

    // Menu dikhane ka logic
    function showMenu(suggestions, eng) {
        menu.innerHTML = "";
        [...suggestions, eng].forEach(opt => {
            const div = document.createElement('div');
            div.innerText = opt;
            div.style.cssText = "padding:10px; cursor:pointer; border-bottom:1px solid #eee; color:#333; font-family:sans-serif; background:#fff;";
            div.onclick = () => {
                const words = area.value.trim().split(/\s+/);
                words[words.length - 1] = opt;
                area.value = words.join(" ") + " ";
                menu.style.display = "none";
                area.focus();
            };
            menu.appendChild(div);
        });
        const rect = area.getBoundingClientRect();
        menu.style.left = rect.left + "px";
        menu.style.top = (rect.top + window.scrollY + 60) + "px";
        menu.style.display = "block";
    }

    // 3. Main Event Listener
    area.addEventListener('keydown', async function(e) {
        // Toggle Shortcut: CTRL + Q (Kyuki H aur G occupied hain)
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            e.preventDefault();
            isHindiActive = !isHindiActive;
            const status = document.getElementById('typing-status');
            if(status) {
                status.innerText = isHindiActive ? "Hindi Active" : "English Active";
                status.style.color = isHindiActive ? "#34c759" : "#ff3b30";
            }
            return;
        }

        if (!isHindiActive) return;

        // Auto Purna Viram
        if (e.key === '.') {
            e.preventDefault();
            const start = area.selectionStart;
            area.setRangeText('।', start, area.selectionEnd, 'end');
            area.setSelectionRange(start + 1, start + 1);
            return;
        }

        // Space Transliteration
        if (e.code === 'Space') {
            const textBefore = area.value.substring(0, area.selectionStart);
            const words = textBefore.trim().split(/\s+/);
            const word = words[words.length - 1];
            
            if (word && /[a-zA-Z]/.test(word)) {
                lastEngWord = word;
                fetchHindi(word, (res) => {
                    const currentPos = area.selectionStart;
                    const lastIdx = textBefore.lastIndexOf(word);
                    const newBefore = textBefore.substring(0, lastIdx) + res[0];
                    area.value = newBefore + " " + area.value.substring(currentPos);
                    area.setSelectionRange(newBefore.length + 1, newBefore.length + 1);
                });
            }
        }

        // Backspace Suggestions
        if (e.code === 'Backspace') {
            setTimeout(() => {
                const textBefore = area.value.substring(0, area.selectionStart);
                const words = textBefore.trim().split(/\s+/);
                const last = words[words.length - 1];
                if (last && /[\u0900-\u097F]/.test(last)) {
                    fetchHindi(lastEngWord || last, (res) => showMenu(res, lastEngWord));
                }
            }, 100);
        }
    });

    // Helper functions ko window me bind karein
    window.insertAtCursor = function(char) {
        const start = area.selectionStart;
        const end = area.selectionEnd;
        const text = area.value;
        area.value = text.substring(0, start) + char + text.substring(end);
        area.setSelectionRange(start + char.length, start + char.length);
        area.focus();
    };
};
