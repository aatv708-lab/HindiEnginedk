window.loadHindiEngine = function(textAreaId) {
    const area = document.getElementById(textAreaId);
    if (!area) return;

    let isHindiActive = true;
    let lastEngWord = "";

    // 1. Suggestion Menu Create Karein
    let menu = document.getElementById('hindi-suggestions');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'hindi-suggestions';
        menu.style.cssText = "position:absolute; display:none; background:#fff; border:1px solid #ccc; box-shadow:0 4px 12px rgba(0,0,0,0.15); z-index:10000; border-radius:8px; width:160px; overflow:hidden;";
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

    function showMenu(suggestions, eng) {
        menu.innerHTML = "";
        [...suggestions, eng].forEach(opt => {
            const div = document.createElement('div');
            div.innerText = opt;
            div.style.cssText = "padding:10px; cursor:pointer; border-bottom:1px solid #eee; color:#333; font-family:sans-serif;";
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

    area.addEventListener('keydown', async function(e) {
        // Ctrl + G Logic
        if (e.ctrlKey && e.key === 'g') {
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
            area.setRangeText('।', area.selectionStart, area.selectionEnd, 'end');
            return;
        }

        // Transliteration on Space
        if (e.code === 'Space') {
            const words = area.value.trim().split(/\s+/);
            const word = words[words.length - 1];
            if (word && /[a-zA-Z]/.test(word)) {
                lastEngWord = word;
                fetchHindi(word, (res) => {
                    const txt = area.value;
                    const lastIdx = txt.lastIndexOf(word);
                    area.value = txt.substring(0, lastIdx) + res[0] + " ";
                });
            }
        }

        // Backspace Suggestions
        if (e.code === 'Backspace') {
            setTimeout(() => {
                const words = area.value.trim().split(/\s+/);
                const last = words[words.length - 1];
                if (last && /[\u0900-\u097F]/.test(last)) {
                    fetchHindi(lastEngWord || last, (res) => showMenu(res, lastEngWord));
                }
            }, 10);
        }
    });

    document.addEventListener('click', (e) => { if(e.target !== area) menu.style.display="none"; });
};

// Global Helpers
window.insertChar = function(char) {
    const a = document.getElementById('hindiArea');
    a.setRangeText(char, a.selectionStart, a.selectionEnd, 'end');
    a.focus();
};

window.searchDict = async function() {
    const word = document.getElementById('dictInput').value;
    const out = document.getElementById('dictOut');
    if (!word) return;
    out.innerText = "Searching...";
    try {
        const res = await fetch(`https://inputtools.google.com/request?text=${word}&ime=transliteration_en_hi&num=5`);
        const data = await res.json();
        if (data[0] === 'SUCCESS') out.innerHTML = "<b>Suggestions:</b> " + data[1][0][1].join(", ");
    } catch (e) { out.innerText = "Error!"; }
};
