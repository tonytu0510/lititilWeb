const rows = [
            ['Q','W','E','R','T','Y','U','I','O','P'],
            ['A','S','D','F','G','H','J','K','L'],
            ['Z','X','C','V','B','N','M']
        ];

        function renderKeyboardBg() {
            const container = document.getElementById('keyboardBg');
            rows.forEach(row => {
                const rowEl = document.createElement('div');
                rowEl.className = 'kb-bg-row';
                row.forEach(key => {
                    const keyEl = document.createElement('span');
                    keyEl.className = 'kb-bg-key';
                    keyEl.textContent = key;
                    rowEl.appendChild(keyEl);
                });
                container.appendChild(rowEl);
            });
        }

        renderKeyboardBg();