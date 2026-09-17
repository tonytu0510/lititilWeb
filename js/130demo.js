const numberDisplay = document.getElementById('numberDisplay');
    const suffixDisplay = document.getElementById('suffixDisplay');
    const clearBtn = document.getElementById('clearBtn');
    let suffixCount = 0;
    const maxSuffix = 8;

    function updateDisplay() {
        let displayText = '';
        for (let i = 0; i < suffixCount; i++) {
            displayText += '·';
        }
        const remaining = maxSuffix - suffixCount;
        for (let i = 0; i < remaining; i++) {
            displayText += '·';
        }
        const chars = displayText.split('');
        for (let i = 0; i < chars.length; i++) {
            if (i === 0 || i === 3 || i === 6) {
                chars[i] = `<span class="highlight">${chars[i]}</span>`;
            }
        }
        suffixDisplay.innerHTML = chars.join('');
    }

    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', function() {
            if (suffixCount < maxSuffix) {
                suffixCount++;
                updateDisplay();
            }
        });
    });

    clearBtn.addEventListener('click', function() {
        suffixCount = 0;
        updateDisplay();
    });

    // 键盘数字输入支持
    document.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '9' || e.key === '*' || e.key === '#') {
            if (suffixCount < maxSuffix) {
                suffixCount++;
                updateDisplay();
            }
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            suffixCount = Math.max(0, suffixCount - 1);
            updateDisplay();
        }
    });

    updateDisplay();