window.loadHindiEngine = function(textAreaId) {
    const area = document.getElementById(textAreaId);
    if (!area) return;

    let isHindiActive = true;
    let lastEngWord = "";

    // Menu Create Karein (Cursor ke upar dikhne ke liye)
    let menu = document.getElementById('hindi-suggestions');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'hindi-suggestions';
        menu.style.cssText = "position:fixed; display:none; background:#fff; border:1px solid #ccc; box-shadow:0 4px 12px rgba(0,0,0,0.2); z-index:10000; border-radius:8px; width:160px; max-height:200px; overflow-y:auto;";
        document.body.appendChild(menu);
    }

    // Cursor position nikalne ka function
    function getCursorXY(input) {
        const { offsetLeft, offsetTop } = input;
        return { x: offsetLeft, y: offsetTop };
    }

    async function fetchHindi(word, callback) {
        try {
            const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&ime=transliteration_en_hi&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi`;
            const response = await fetch(url);
            const data = await response.json();
            if (data[0] === 'SUCCESS') callback(data[1][0][1]);
        } catch (err) { console.error("API Error"); }
    }

    function showMenu(suggestions, eng) {
        menu.innerHTML = "";
        [...suggestions, eng].forEach(opt => {
            const div = document.createElement('div');
            div.innerText = opt;
            div.style.cssText = "padding:10px; cursor:pointer; border-bottom:1px solid #eee; color:#333; font-family:sans-serif; background:#fff;";
            div.onclick = () => {
                const start = area.selectionStart;
                const text = area.value;
                const before = text.substring(0, text.lastIndexOf(' ', start - 1)).trim();
                area.value = (before ? before + " " : "") + opt + " ";
                menu.style.display = "none";
                area.focus();
            };
            menu.appendChild(div);
        });

        const rect = area.getBoundingClientRect();
        menu.style.left = rect.left + "px";
        menu.style.top = (rect.top + 100) + "px"; // Cursor ke paas adjust kiya
        menu.style.display = "block";
    }

    area.addEventListener('keydown', async function(e) {
        // Ctrl + H Toggle (Ab Ctrl+G Find nahi khulega)
        if (e.ctrlKey && e.key === 'h') {
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
            window.insertAtCursor('।');
            return;
        }

        // Transliteration on Space
        if (e.code === 'Space') {
            const text = area.value.substring(0, area.selectionStart);
            const words = text.trim().split(/\s+/);
            const word = words[words.length - 1];
            
            if (word && /[a-zA-Z]/.test(word)) {
                lastEngWord = word;
                fetchHindi(word, (res) => {
                    const start = area.selectionStart;
                    const lastIdx = area.value.lastIndexOf(word, start - 1);
                    area.value = area.value.substring(0, lastIdx) + res[0] + " " + area.value.substring(start);
                });
            }
        }

        // Backspace Suggestions
        if (e.code === 'Backspace') {
            setTimeout(() => {
                const text = area.value.substring(0, area.selectionStart);
                const words = text.trim().split(/\s+/);
                const last = words[words.length - 1];
                if (last && /[\u0900-\u097F]/.test(last)) {
                    fetchHindi(lastEngWord || last, (res) => showMenu(res, lastEngWord));
                }
            }, 50);
        }
    });

    document.addEventListener('click', (e) => { if(e.target !== area) menu.style.display="none"; });
};

// Cursor position par insert karne ka function
window.insertAtCursor = function(char) {
    const area = document.getElementById('hindiArea');
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const text = area.value;
    area.value = text.substring(0, start) + char + text.substring(end);
    area.selectionStart = area.selectionEnd = start + char.length;
    area.focus();
};

window.toggleEmoji = function() {
    const box = document.getElementById('emoji-box');
    box.style.display = box.style.display === 'none' ? 'grid' : 'none';
};
