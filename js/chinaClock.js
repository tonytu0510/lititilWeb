const canvas = document.getElementById('clock');
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height / 2, r = 150;

        const zones = [
            { letter: 'R', name: '东五区', offset: -3, region: '新疆/西藏' },
            { letter: 'S', name: '东六区', offset: -2, region: '甘肃/青海' },
            { letter: 'T', name: '东七区', offset: -1, region: '四川/云南' },
            { letter: 'U', name: '东八区', offset: 0, region: '北京/上海' },
            { letter: 'V', name: '东九区', offset: 1, region: '黑龙江东部' }
        ];

        let selectedZone = zones[3];

        const userOffset = -new Date().getTimezoneOffset() / 60;
        let userZone = zones.find(z => z.offset === userOffset - 8);
        if (!userZone) userZone = zones[3];

        const zoneList = document.getElementById('zoneList');
        zones.forEach(z => {
            const div = document.createElement('div');
            div.className = 'zone' + (z.letter === userZone.letter ? ' active' : '');
            div.innerHTML = `<div class="letter">${z.letter}</div>${z.name}<br>${z.region}<div class="time" id="time${z.letter}"></div>`;
            div.addEventListener('click', () => {
                selectedZone = z;
                document.querySelectorAll('.zone').forEach(d => d.classList.remove('active'));
                div.classList.add('active');
                document.getElementById('displayZone').textContent = z.name + ' (' + z.letter + ') ' + z.region;
            });
            zoneList.appendChild(div);
        });

        function getZoneTime(zone) {
            const now = new Date();
            const utc = now.getTime() + now.getTimezoneOffset() * 60000;
            return new Date(utc + (8 + zone.offset) * 3600000);
        }

        function drawClock() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const now = getZoneTime(selectedZone);
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            // 北京时间
            const bjTime = getZoneTime(zones[3]);
            document.getElementById('beijingTime').textContent =
                String(bjTime.getHours()).padStart(2,'0') + ':' +
                String(bjTime.getMinutes()).padStart(2,'0') + ':' +
                String(bjTime.getSeconds()).padStart(2,'0');

            // 更新各时区时间显示
            zones.forEach(z => {
                const zt = getZoneTime(z);
                const el = document.getElementById('time' + z.letter);
                if (el) el.textContent = String(zt.getHours()).padStart(2,'0') + ':' + String(zt.getMinutes()).padStart(2,'0');
            });

            // 外圈
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 3;
            ctx.stroke();

            // 内圈装饰
            ctx.beginPath();
            ctx.arc(cx, cy, r - 40, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 刻度
            for (let i = 0; i < 12; i++) {
                const angle = (i * 30 - 90) * Math.PI / 180;
                const x1 = cx + Math.cos(angle) * (r - 15);
                const y1 = cy + Math.sin(angle) * (r - 15);
                const x2 = cx + Math.cos(angle) * (r - 30);
                const y2 = cy + Math.sin(angle) * (r - 30);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                const isMajor = i % 3 === 0;
                ctx.strokeStyle = isMajor ? '#f0d060' : 'rgba(255,255,255,0.3)';
                ctx.lineWidth = isMajor ? 3 : 1;
                ctx.stroke();
            }

            // RSTUV 字母刻度（均匀分布）
            for (let i = 0; i < 5; i++) {
                const angle = (i * 72 - 90) * Math.PI / 180;
                const lx = cx + Math.cos(angle) * (r - 50);
                const ly = cy + Math.sin(angle) * (r - 50);
                const isActive = zones[i].letter === selectedZone.letter;
                ctx.fillStyle = isActive ? '#f0d060' : 'rgba(255,255,255,0.5)';
                ctx.font = `bold ${isActive ? 28 : 20}px Georgia,serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(zones[i].letter, lx, ly);
            }

            // 时针
            const hourAngle = ((hours % 12) + minutes / 60) * 30 - 90;
            drawHand(hourAngle * Math.PI / 180, r * 0.48, 7, '#fff');

            // 分针
            const minAngle = (minutes + seconds / 60) * 6 - 90;
            drawHand(minAngle * Math.PI / 180, r * 0.68, 4, '#c8c8c8');

            // 秒针
            const secAngle = seconds * 6 - 90;
            drawHand(secAngle * Math.PI / 180, r * 0.78, 2, '#c4334c');

            // 中心点
            ctx.beginPath();
            ctx.arc(cx, cy, 9, 0, Math.PI * 2);
            ctx.fillStyle = '#f0d060';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#1a1a2e';
            ctx.fill();

            // 选中时区标签
            ctx.fillStyle = '#f0d060';
            ctx.font = 'bold 14px "Microsoft YaHei",sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(selectedZone.name, cx, cy + 35);

            requestAnimationFrame(drawClock);
        }

        function drawHand(angle, length, width, color) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        drawClock();