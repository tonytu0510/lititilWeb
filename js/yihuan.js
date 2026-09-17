const numTableData = [
            { num: '一', half: '一 + 一', companion: '十' },
            { num: '二', half: '一 + 一', companion: '干' },
            { num: '三', half: '一 + 一 + 一', companion: '王' },
            { num: '四', half: '一 + 一 + 一 + 一', companion: '田' },
            { num: '五', half: '一 + 一 + 一 + 一 + 一', companion: '午' },
            { num: '六', half: '亠 + 八', companion: '文' },
            { num: '七', half: '七 + 丨', companion: '化' },
            { num: '八', half: '八 + 丨', companion: '个' },
            { num: '九', half: '九 + 一', companion: '无' },
            { num: '十', half: '十 + 丨', companion: '卜' }
        ];

        function renderNumTable() {
            const tbody = document.getElementById('numTable');
            tbody.innerHTML = '';
            numTableData.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${item.num}</td><td>${item.half}</td><td>${item.companion}</td>`;
                tbody.appendChild(tr);
            });
        }

        renderNumTable();