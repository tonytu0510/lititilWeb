function switchTab(name) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(name).classList.add('active');
            event.target.classList.add('active');
        }

        function crypto(action) {
            const text = document.getElementById('cryptoInput').value;
            const shift = 6931, start = 19968, count = 20992;
            let result = '';
            for (let char of text) {
                const code = char.charCodeAt(0);
                if (code >= start && code <= start + count) {
                    let newCode = action === 'encrypt' ? code + shift : code - shift;
                    if (newCode > start + count) newCode -= count;
                    if (newCode < start) newCode += count;
                    result += String.fromCharCode(newCode);
                } else {
                    result += char;
                }
            }
            document.getElementById('cryptoResult').innerText = result;
        }

        function compress(type) {
            const text = document.getElementById('compressInput').value;
            let result = '';
            if (type === 'letters') {
                for (let i = 0; i < text.length; i += 2) {
                    if (i + 1 < text.length) {
                        const a = text.charCodeAt(i) - 65, b = text.charCodeAt(i + 1) - 65;
                        const base = (a % 2 === 0 && b % 2 === 0) ? 2 : 3;
                        result += String.fromCharCode((a * base + b) % 26 + 65);
                    } else {
                        result += text[i];
                    }
                }
            } else {
                const start = 19968, count = 20992;
                for (let i = 0; i < text.length; i += 2) {
                    if (i + 1 < text.length) {
                        const a = text.charCodeAt(i) - start, b = text.charCodeAt(i + 1) - start;
                        const base = (a % 2 === 0 && b % 2 === 0) ? 2 : 3;
                        result += String.fromCharCode((a * base + b) % count + start);
                    } else {
                        result += text[i];
                    }
                }
            }
            document.getElementById('compressResult').innerText = result;
        }

        function formatText(type) {
            const text = document.getElementById('formatInput').value;
            let result = '';
            switch(type) {
                case 'upper': result = text.toUpperCase(); break;
                case 'lower': result = text.toLowerCase(); break;
                case 'camel':
                    result = text.split(/[\s-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
                    break;
                case 'pascal':
                    const words = text.split(/[\s-_]+/);
                    result = words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
                    break;
                case 'reverse':
                    result = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
                    break;
            }
            document.getElementById('formatResult').innerText = result;
        }