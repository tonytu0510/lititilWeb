const legendData = [
            { symbol: '逗号 ，', meaning: '换气、犹豫、话没说完' },
            { symbol: '句号 。', meaning: '收住、冷静、完整结束' },
            { symbol: '问号 ？', meaning: '试探、不安、想知道更多' },
            { symbol: '叹号 ！', meaning: '情绪上头、激动或愤怒' },
            { symbol: '空格', meaning: '停顿、空、克制或强调' },
            { symbol: '省略号 ……', meaning: '尾音、欲言又止、没说完' },
            { symbol: '顿号 、', meaning: '短暂并列、轻微停顿' },
            { symbol: '分号 ；', meaning: '分开但还有联系' },
        ];

        function renderLegend() {
            const el = document.getElementById('legend');
            el.innerHTML = '';
            legendData.forEach(item => {
                const div = document.createElement('div');
                div.className = 'legend-item';
                div.innerHTML = `<strong>${item.symbol}</strong>${item.meaning}`;
                el.appendChild(div);
            });
        }

        function analyzeText(text) {
            if (!text.trim()) {
                return '你什么都没打。这本身也是一种态度：空着，不说。';
            }

            const hasComma = /，|,/.test(text);
            const hasPeriod = /。|\./.test(text);
            const hasQuestion = /？|\?/.test(text);
            const hasExclaim = /！|!/.test(text);
            const hasSpace = /\s+/.test(text.trim());
            const hasEllipsis = /……|\.\.\./.test(text);
            const hasDun = /、/.test(text);
            const hasSemicolon = /；|;/.test(text);

            let reading = '';

            if (hasQuestion) {
                reading += '这句话在问，语气里带着不确定，或者想听你回答。\n';
            }
            if (hasExclaim) {
                reading += '情绪比较重，可能是激动、生气，也可能是真的在意。\n';
            }
            if (hasEllipsis) {
                reading += '话没说完，或者故意留着余地，心里还有后半句。\n';
            }
            if (hasComma) {
                reading += '有停顿，说明他边想边说，或者在强调前半句。\n';
            }
            if (hasDun) {
                reading += '有顿号，像是在列举，也像是在克制地停顿。\n';
            }
            if (hasSemicolon) {
                reading += '用分号，说明前后有关系，但又不是完全连在一起。\n';
            }
            if (hasSpace) {
                reading += '文字里有空格，可能是故意停顿，也可能是在克制情绪。\n';
            }
            if (hasPeriod && !hasQuestion && !hasExclaim) {
                reading += '句子收得比较完整，语气偏冷静，甚至有点结束对话的意思。\n';
            }

            if (!hasComma && !hasPeriod && !hasQuestion && !hasExclaim && !hasSpace && !hasEllipsis && !hasDun && !hasSemicolon) {
                reading = '没有明显标点和空格，要么很平静，要么懒得修饰，直直地把字丢出来。';
            }

            reading += '\n—— 他真正的意思，不一定在字面上，而在这些停顿里。';

            return reading;
        }

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            const text = document.getElementById('inputText').value;
            document.getElementById('result').textContent = analyzeText(text);
        });

        document.getElementById('inputText').addEventListener('input', () => {
            const text = document.getElementById('inputText').value;
            document.getElementById('result').textContent = analyzeText(text);
        });

        renderLegend();
        document.getElementById('result').textContent = analyzeText('我知道了');