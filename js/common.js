// ==================== 公共组件自动注入 ====================
(function() {
    // ==================== 游戏栏状态管理 ====================
    const DINO_STATE_KEY = 'dinoBarClosed';
    const MENU_STATE_KEY = 'arcMenuSelected';   // 新格式："inner-3" / "outer-5"

    function isDinoBarClosed() {
        const stored = sessionStorage.getItem(DINO_STATE_KEY);
        if (stored === null) {
            return false;
        }
        return stored === 'true';
    }

    function setDinoBarClosed(closed) {
        sessionStorage.setItem(DINO_STATE_KEY, closed ? 'true' : 'false');
    }

    function saveMenuIndex(ring, index) {
        sessionStorage.setItem(MENU_STATE_KEY, ring + '-' + index);
    }

    function getSavedMenuIndex() {
        const stored = sessionStorage.getItem(MENU_STATE_KEY);
        if (!stored) return { ring: 'inner', index: 0 };
        const parts = stored.split('-');
        const ring = (parts[0] === 'outer') ? 'outer' : 'inner';
        const idx = parseInt(parts[1]);
        return { ring, index: isNaN(idx) ? 0 : idx };
    }

    function restoreDinoState() {
        const bar = document.getElementById('dinoBar');
        const icon = document.getElementById('dinoIcon');
        const iconGroup = document.getElementById('iconGroup');
        const placeholder = document.getElementById('topPlaceholder');
        if (!bar) return;
        bar.style.display = 'none';
        if (icon) icon.classList.add('show');
        if (iconGroup) iconGroup.classList.add('move-up');
        if (placeholder) placeholder.style.height = '0px';
        const closed = isDinoBarClosed();
        if (!closed) {
            requestAnimationFrame(function() {
                bar.style.display = 'block';
                if (icon) icon.classList.remove('show');
                if (iconGroup) iconGroup.classList.remove('move-up');
                if (placeholder) placeholder.style.height = '50px';
            });
        } else {
            if (typeof updateSliderHeight === 'function') {
                updateSliderHeight();
            }
        }
    }

    // ==================== 环形菜单配置（只改这里） ====================
    const RING_CONFIG = {
        // 内环：高频
        inner: [
            { name: '首页',   href: 'index.html?M=1' },
            { name: '工具箱', href: 'tools.html' },
            { name: '笔记',   href: 'notes.html' },
            { name: '计算器', href: 'calc.html' },
            { name: '二维码', href: 'qrCode.html' },
            { name: '导航',   href: 'ringMenu.html' }
        ],
        // 外环：次常用
        outer: [
            { name: '对合环',   href: 'nestedInvolutionRingHuge.html' },
            { name: '太阳系',   href: 'cosmos.html' },
            { name: '文字游戏', href: 'wordplay.html' },
            { name: '缘分测试', href: 'namePairing.html' },
            { name: '拆字',     href: 'fontAll.html' },
            { name: '判证',     href: 'panding.html' },
            { name: '读呼吸',   href: 'BreathBetweenWords.html' },
            { name: '想法',     href: 'idea.html' }
        ]
    };

    // 半径系数（相对容器尺寸），改这里就能调环的大小
    const RING_RADIUS = {
        desktop: { inner: 0.42, outer: 0.65 },
        mobile:  { inner: 0.50, outer: 0.75 }
    };

    // 环展开动画延迟（ms）
    const RING_DELAY = { inner: 0, outer: 80 };

    // 悬浮球容器尺寸（CSS 里也有，这里同步一份用于 JS 计算）
    const RING_CONTAINER_SIZE = { desktop: 400, mobile: 260 };

    // 悬浮球附近安全半径：落在这一圈内不切换激活环
    const TRIGGER_SAFE_RADIUS = { desktop: 70, mobile: 60 };
    // ================================================================

    const html = `
        <style>
            #menuTrigger {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: #2a2a2a;
                border-radius: 50%;
                border: 1px solid #3d3d3d;
                color: #d0d0d0;
                font-size: 28px;
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.3s;
                box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                user-select: none;
            }
            #menuTrigger:hover {
                background: #3d3d3d;
            }
            #menuTrigger.active {
                background: #7cb8b8;
                color: #0d0d0d;
            }
            #menuContainer {
                position: fixed;
                bottom: 0;
                right: 0;
                width: 400px;
                height: 400px;
                pointer-events: none;
                z-index: 999;
                overflow: visible;
            }
            #menuContainer.active {
                pointer-events: auto;
            }
            .menu-item {
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: #2a2a2a;
                border: 1px solid #3d3d3d;
                color: #999;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                pointer-events: none;
                opacity: 0;
                user-select: none;
                font-family: 'Courier New', monospace;
                text-decoration: none;
                font-weight: 300;
                letter-spacing: 0.5px;
                will-change: right, bottom, opacity, transform;
            }
            .menu-item.active {
                background: #7cb8b8;
                color: #0d0d0d;
                border-color: #7cb8b8;
            }
            #menuContainer.active .menu-item {
                pointer-events: auto;
            }
            #currentLabel {
                position: fixed;
                bottom: 100px;
                right: 30px;
                color: #444;
                font-size: 13px;
                letter-spacing: 1px;
                z-index: 1001;
                pointer-events: none;
                text-align: right;
                line-height: 1.6;
                opacity: 0;
                transition: opacity 0.4s;
            }
            #currentLabel.show {
                opacity: 1;
            }
            #currentLabel .name {
                color: #7cb8b8;
                font-size: 16px;
            }
            #currentLabel .index {
                color: #555;
                font-size: 11px;
            }
            .currentLabelScoll{
                color:#555;
                font-size:11px;
            }
            @media (max-width: 500px) {
                #menuContainer {
                    width: 260px;
                    height: 260px;
                }
                .menu-item {
                    width: 34px;
                    height: 34px;
                    font-size: 9px;
                }
                .menu-item.inner {
                    width: 38px;
                    height: 38px;
                    font-size: 10px;
                }
                #menuTrigger {
                    width: 50px;
                    height: 50px;
                    font-size: 22px;
                    bottom: 20px;
                    right: 20px;
                }
                #currentLabel {
                    bottom: 80px;
                    right: 20px;
                    font-size: 11px;
                }
                .currentLabelScoll{
                    display:none
                }
                #currentLabel .index {
                    margin-bottom: 0;
                }
                #currentLabel .name {
                    margin-bottom: -4px;
                }
            }
        </style>

        <div id="currentLabel">
            <div class="index" id="currentIndex">1 / 6</div>
            <div class="name" id="currentName">首页</div>
            <div class="currentLabelScoll">滚轮/滑动切换</div>
        </div>

        <div id="menuTrigger">☰</div>

        <div id="iconGroup">
            <canvas id="dinoIcon" width="50" height="50"></canvas>
        </div>

        <div id="menuContainer"></div>

        <div id="dinoBar" style="position:relative; display:none;">
            <button class="close-btn" id="topPlaceholder">✕</button>
            <dino-game speed="3" style="position: absolute;left: 50px;top: 0;height: 50px;width: calc(100% - 230px)" id='dinoGameChangeWidth'></dino-game>
            <button id="startGameBtn" onclick="startDinoGame()" style="position:absolute;right:90px;top:13px;z-index:10;background:#fff;color:#c4334c;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;width:80px">开始游戏</button>
            <button id="helpBtn" onclick="showHelp()" style="position:absolute;right:40px;top:13px;z-index:10;background:#fff;color:#c4334c;border:none;height:22px;border-radius:50%;cursor:pointer;font-size:14px;font-weight:bold;width:30px;padding:0">?</button>
        </div>

        <div id="helpModal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10000;background:#fff;padding:20px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);max-width:400px;width:90%;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                <h3 style="margin:0;color:#c4334c;">游戏说明</h3>
                <button onclick="closeHelp()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#888;">✕</button>
            </div>
            <div style="line-height:1.8;color:#333;font-size:14px;">
                <p>🎮 <b>操作方式：</b>点击游戏区域、按空格键或上箭头键，控制小方块跳跃。</p>
                <p>🎯 <b>目标：</b>躲避从右边飞来的障碍物，坚持越久分数越高。</p>
                <p>💡 <b>提示：</b>障碍物速度会越来越快，挑战你的反应极限！</p>
            </div>
        </div>
    `;

    const container = document.getElementById('topBarContainer');
    if (container) {
        container.innerHTML = html;
    }

    // ==================== 圆弧菜单脚本（双环 · 按指针所在环滑动） ====================
    (function() {
        const containerEl = document.getElementById('menuContainer');
        const trigger = document.getElementById('menuTrigger');
        const currentName = document.getElementById('currentName');
        const currentIndex = document.getElementById('currentIndex');
        const label = document.getElementById('currentLabel');

        if (!containerEl || !trigger) return;

        let isOpen = false;
        let isDragging = false;

        // 每个环独立维护"当前选中项"
        const ringState = {
            inner: { selected: 0, offset: 0 },
            outer: { selected: 0, offset: 0 }
        };

        // 当前激活环：键盘操作目标、label 显示目标
        let activeRing = 'inner';

        // 从存档恢复
        (function initFromSaved() {
            const saved = getSavedMenuIndex();
            if (RING_CONFIG[saved.ring] && saved.index < RING_CONFIG[saved.ring].length) {
                ringState[saved.ring].selected = saved.index;
                activeRing = saved.ring;
            }
        })();

        // ---------- 判断桌面/手机 ----------
        function isMobile() {
            return document.documentElement.clientWidth <= 500;
        }

        function getContainerSize() {
            return isMobile() ? RING_CONTAINER_SIZE.mobile : RING_CONTAINER_SIZE.desktop;
        }

        function getRadius(ring) {
            const mode = isMobile() ? 'mobile' : 'desktop';
            return getContainerSize() * RING_RADIUS[mode][ring];
        }

        // ---------- 根据指针坐标判断落在哪个环 ----------
        function getRingByPointer(clientX, clientY) {
            const rect = containerEl.getBoundingClientRect();
            // 容器 right/bottom 对齐，圆心在右下角
            const cx = rect.right;
            const cy = rect.bottom;
            const dx = clientX - cx;
            const dy = clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 悬浮球附近：保持当前激活环，不强行切换
            const safe = isMobile() ? TRIGGER_SAFE_RADIUS.mobile : TRIGGER_SAFE_RADIUS.desktop;
            if (dist < safe) {
                return activeRing;
            }

            const innerR = getRadius('inner');
            const outerR = getRadius('outer');
            const innerHalf = isMobile() ? 19 : 22;
            const outerHalf = isMobile() ? 17 : 22;

            const dInner = Math.abs(dist - innerR);
            const dOuter = Math.abs(dist - outerR);

            // 优先落在项的覆盖范围内
            if (dInner <= innerHalf && dInner <= dOuter) return 'inner';
            if (dOuter <= outerHalf) return 'outer';
            // 都不在项内，取最近的环
            return dInner < dOuter ? 'inner' : 'outer';
        }

        // ---------- 构建菜单 ----------
        function buildMenu() {
            containerEl.querySelectorAll('.menu-item').forEach(el => el.remove());

            const currentPath = location.pathname.split('/').pop() || 'index.html';

            ['inner', 'outer'].forEach(ring => {
                const arr = RING_CONFIG[ring];
                const count = arr.length;
                const startAngle = -90 + (ring === 'outer' ? 180 / count : 0);

                arr.forEach((item, ringIdx) => {
                    const el = document.createElement('a');
                    el.className = 'menu-item ' + ring;
                    el.textContent = item.name.length > 4 ? item.name.slice(0, 4) : item.name;
                    el.title = item.name;
                    el.href = item.href;
                    el.dataset.ring = ring;
                    el.dataset.ringIndex = ringIdx;

                    if (item.href.split('?')[0] === currentPath) {
                        el.classList.add('active');
                    }

                    const baseAngle = startAngle + (360 * ringIdx / count);
                    el.dataset.baseAngle = baseAngle;

                    // 点击：切换选中 + 激活该环 + 跳转
                    el.addEventListener('click', function(e) {
                        e.preventDefault();
                        activeRing = ring;
                        ringState[ring].selected = ringIdx;
                        updateRingSelection(ring);
                        updateLabel();
                        saveMenuIndex(ring, ringIdx);
                        toggleMenu(false);
                        setTimeout(() => {
                            window.location.href = this.href;
                        }, 300);
                    });

                    el.style.opacity = '0';
                    el.style.transform = 'scale(0.3)';
                    el.style.transition = 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

                    containerEl.appendChild(el);
                });
            });

            updatePositions('inner');
            updatePositions('outer');
            updateRingSelection('inner');
            updateRingSelection('outer');
        }

        // ---------- 更新某个环的位置 ----------
        function updatePositions(ring) {
            const offset = ringState[ring].offset;
            const radius = getRadius(ring);

            const items = containerEl.querySelectorAll('.menu-item.' + ring);
            items.forEach(el => {
                const baseAngle = parseFloat(el.dataset.baseAngle);
                const angleDeg = baseAngle + offset;
                const rad = angleDeg * Math.PI / 180;
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                const half = isMobile() ? (ring === 'inner' ? 19 : 17) : 22;
                el.style.right = (x - half) + 'px';
                el.style.bottom = (y - half) + 'px';
            });
        }

        // ---------- 更新某个环的选中高亮 ----------
        function updateRingSelection(ring) {
            const selected = ringState[ring].selected;
            containerEl.querySelectorAll('.menu-item.' + ring).forEach((el, i) => {
                el.classList.toggle('active', i === selected && activeRing === ring);
            });
        }

        // ---------- 更新底部标签 ----------
        function updateLabel() {
            const arr = RING_CONFIG[activeRing];
            const idx = ringState[activeRing].selected;
            if (arr && arr[idx] && currentName && currentIndex) {
                currentName.textContent = arr[idx].name;
                currentIndex.textContent = (idx + 1) + ' / ' + arr.length;
            }
        }

        // ---------- 把某个环的选中项转到 45° 位置 ----------
        function switchToRingIndex(ring, ringIdx) {
            const arr = RING_CONFIG[ring];
            const count = arr.length;
            const startAngle = -90 + (ring === 'outer' ? 180 / count : 0);
            const baseAngle = startAngle + (360 * ringIdx / count);
            const targetAngle = 45;
            const offset = targetAngle - baseAngle;
            ringState[ring].offset = offset;
            ringState[ring].selected = ringIdx;
            updatePositions(ring);
            updateRingSelection(ring);
        }

        // ---------- 步进切换：只切当前激活环 ----------
        function stepSwitch(delta) {
            const ring = activeRing;
            const arr = RING_CONFIG[ring];
            const count = arr.length;
            const dir = delta > 0 ? 1 : -1;
            const cur = ringState[ring].selected;
            const next = (cur + dir + count) % count;
            switchToRingIndex(ring, next);
            updateLabel();
        }

        // ---------- 展开/收起 ----------
        function toggleMenu(open) {
            isOpen = open;
            containerEl.classList.toggle('active', open);
            trigger.classList.toggle('active', open);

            const items = containerEl.querySelectorAll('.menu-item');
            if (open) {
                // 两个环各自回到自己的选中位置
                switchToRingIndex('inner', ringState.inner.selected);
                switchToRingIndex('outer', ringState.outer.selected);
                updateRingSelection('inner');
                updateRingSelection('outer');
                updateLabel();

                items.forEach(el => {
                    const ring = el.dataset.ring;
                    const delay = RING_DELAY[ring] || 0;
                    setTimeout(() => {
                        el.style.opacity = '1';
                        el.style.transform = 'scale(1)';
                    }, delay);
                });
                if (label) label.classList.add('show');
            } else {
                items.forEach(el => {
                    const ring = el.dataset.ring;
                    const delay = ring === 'outer' ? 0 : 60;
                    setTimeout(() => {
                        el.style.opacity = '0';
                        el.style.transform = 'scale(0.3)';
                    }, delay);
                });
                setTimeout(() => {
                    if (!isOpen && label) label.classList.remove('show');
                }, 300);
            }
        }

        // ========== 事件绑定 ==========
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu(!isOpen);
        });

        document.addEventListener('click', function(e) {
            if (isOpen && !containerEl.contains(e.target) && e.target !== trigger) {
                toggleMenu(false);
            }
        });

        // 滚轮：按指针位置决定切哪个环
        containerEl.addEventListener('wheel', function(e) {
            if (!isOpen) return;
            e.preventDefault();
            e.stopPropagation();
            const ring = getRingByPointer(e.clientX, e.clientY);
            if (ring !== activeRing) {
                activeRing = ring;
                updateRingSelection('inner');
                updateRingSelection('outer');
                updateLabel();
            }
            stepSwitch(e.deltaY);
        }, { passive: false });

        // 禁用鼠标中键
        document.addEventListener('mousedown', function(e) {
            if (e.button === 1) {
                e.preventDefault();
                return false;
            }
        });

        // 鼠标拖拽：按按下位置决定切哪个环
        let dragStartY = 0;
        containerEl.addEventListener('mousedown', function(e) {
            if (!isOpen) return;
            if (e.button !== 0) return;
            const ring = getRingByPointer(e.clientX, e.clientY);
            if (ring !== activeRing) {
                activeRing = ring;
                updateRingSelection('inner');
                updateRingSelection('outer');
                updateLabel();
            }
            isDragging = true;
            dragStartY = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging || !isOpen) return;
            const dy = e.clientY - dragStartY;
            if (Math.abs(dy) > 15) {
                stepSwitch(dy);
                dragStartY = e.clientY;
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // 触摸滑动：按触摸起点决定切哪个环
        let touchStartY = 0;
        containerEl.addEventListener('touchstart', function(e) {
            if (!isOpen) return;
            const t = e.touches[0];
            const ring = getRingByPointer(t.clientX, t.clientY);
            if (ring !== activeRing) {
                activeRing = ring;
                updateRingSelection('inner');
                updateRingSelection('outer');
                updateLabel();
            }
            isDragging = true;
            touchStartY = t.clientY;
        }, { passive: true });

        containerEl.addEventListener('touchmove', function(e) {
            if (!isDragging || !isOpen) return;
            const dy = e.touches[0].clientY - touchStartY;
            if (Math.abs(dy) > 20) {
                stepSwitch(dy);
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        containerEl.addEventListener('touchend', function() {
            isDragging = false;
        }, { passive: true });

        // 键盘：操作当前激活环
        document.addEventListener('keydown', function(e) {
            if (!isOpen) return;
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                stepSwitch(-1);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                stepSwitch(1);
            } else if (e.key === 'Escape') {
                toggleMenu(false);
            } else if (e.key === 'Enter') {
                const ring = activeRing;
                const idx = ringState[ring].selected;
                const arr = RING_CONFIG[ring];
                if (arr && arr[idx]) {
                    window.location.href = arr[idx].href;
                }
            }
        });

        // ========== 初始化 ==========
        function initMenu() {
            buildMenu();
            toggleMenu(false);
        }

        // resize：不重建 DOM，只更新位置和高亮
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updatePositions('inner');
                updatePositions('outer');
                updateRingSelection('inner');
                updateRingSelection('outer');
                updateLabel();
                if (isOpen) {
                    switchToRingIndex('inner', ringState.inner.selected);
                    switchToRingIndex('outer', ringState.outer.selected);
                    updateRingSelection('inner');
                    updateRingSelection('outer');
                    updateLabel();
                }
            }, 300);
        });

        initMenu();
    })();

    // ==================== 画菜单图标 ====================
    function drawMenuIcon() {
        const canvas = document.getElementById('menuIcon');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 50, 50);
        ctx.fillStyle = '#f9ed69';
        ctx.beginPath();
        ctx.arc(25, 25, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 16, 26, 3);
        ctx.fillRect(12, 23, 26, 3);
        ctx.fillRect(12, 30, 26, 3);
    }
    drawMenuIcon();

    // ==================== 画小恐龙图标 ====================
    function drawDinoIcon() {
        const canvas = document.getElementById('dinoIcon');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 50, 50);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(25, 25, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f9ed69';
        ctx.fillRect(12, 18, 16, 18);
        ctx.fillRect(24, 8, 12, 12);
        ctx.fillStyle = '#fff';
        ctx.fillRect(32, 10, 3, 3);
        ctx.fillStyle = '#f9ed69';
        ctx.fillRect(14, 34, 5, 8);
        ctx.fillRect(21, 34, 5, 8);
    }
    drawDinoIcon();

    // ==================== 开始游戏 ====================
    window.startDinoGame = function() {
        const dinoGame = document.querySelector('dino-game');
        if (dinoGame) {
            const shadowRoot = dinoGame.shadowRoot;
            if (shadowRoot) {
                const canvas = shadowRoot.querySelector('canvas');
                if (canvas) {
                    canvas.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        composed: true
                    }));
                }
            }
        }
        const startBtn = document.getElementById('startGameBtn');
        const dinoGameChangeWidth = document.getElementById('dinoGameChangeWidth');
        if (startBtn) startBtn.style.display = 'none';
        if (dinoGameChangeWidth) dinoGameChangeWidth.style.width = 'calc(100% - 120px)';
    };

    window.showHelp = function() {
        document.getElementById('helpModal').style.display = 'block';
    };

    window.closeHelp = function() {
        document.getElementById('helpModal').style.display = 'none';
    };

    document.addEventListener('click', function(e) {
        const modal = document.getElementById('helpModal');
        if (modal && modal.style.display === 'block') {
            if (!e.target.closest('#helpModal') && !e.target.closest('#helpBtn')) {
                modal.style.display = 'none';
            }
        }
    });

    // ==================== 关闭按钮 ====================
    const closeBtn = document.querySelector('#dinoBar .close-btn');
    if (closeBtn) {
        setTimeout(function() {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const bar = document.getElementById('dinoBar');
                const icon = document.getElementById('dinoIcon');
                const iconGroup = document.getElementById('iconGroup');
                const placeholder = document.getElementById('topPlaceholder');

                if (bar) {
                    bar.style.display = 'none';
                    setDinoBarClosed(true);
                    if (icon) icon.classList.add('show');
                    if (iconGroup) iconGroup.classList.add('move-up');
                    if (placeholder) placeholder.style.height = '0px';

                    const dinoGame = document.querySelector('dino-game');
                    if (dinoGame && dinoGame.resetGamePublic) {
                        dinoGame.resetGamePublic();
                    }
                    const startBtn = document.getElementById('startGameBtn');
                    const dinoGameChangeWidth = document.getElementById('dinoGameChangeWidth');
                    if (startBtn) {
                        if (dinoGameChangeWidth) dinoGameChangeWidth.style.width = 'calc(100% - 230px)';
                        startBtn.style.display = 'block';
                    }
                    if (typeof updateSliderHeight === 'function') {
                        updateSliderHeight();
                    }
                }
            });
        }, 500);
    }

    // ==================== 小恐龙图标 ====================
    const dinoIcon = document.getElementById('dinoIcon');
    if (dinoIcon) {
        setTimeout(function() {
            dinoIcon.addEventListener('click', function() {
                const bar = document.getElementById('dinoBar');
                const icon = document.getElementById('dinoIcon');
                const iconGroup = document.getElementById('iconGroup');
                const placeholder = document.getElementById('topPlaceholder');

                if (bar) {
                    bar.style.display = 'block';
                    setDinoBarClosed(false);
                    if (icon) icon.classList.remove('show');
                    if (iconGroup) iconGroup.classList.remove('move-up');
                    if (placeholder) placeholder.style.height = '50px';

                    if (typeof updateSliderHeight === 'function') {
                        updateSliderHeight();
                    }
                }
            });
        }, 500);
    }

    // ==================== 页面加载时恢复状态 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restoreDinoState);
    } else {
        restoreDinoState();
    }

})();

// ==================== 回到顶部 / 滚动向下 按钮（合并容器 + 长按直达底部 + 单屏隐藏） ====================
(function() {
    const backToTopHtml = `
        <style>
            .scroll-nav {
                position: fixed;
                right: 26px;
                top: 50%;
                transform: translateY(-50%);
                width: 42px;
                border-radius: 30px;
                background: rgba(43, 43, 43, 0.75);
                border: 1px solid #555;
                z-index: 1000;
                font-family: 'Courier New', monospace;
                user-select: none;
                overflow: hidden;
                transition: background 0.2s, opacity 0.3s;
            }
            .scroll-nav-btn {
                width: 100%;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #f5efe8;
                font-size: 36px;
                line-height: 1;
                cursor: pointer;
                background: transparent;
                border: none;
                padding: 0;
                transition: background 0.2s;
            }
            .scroll-nav-btn:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            .scroll-nav-btn.longpress-active {
                background: #7cb8b8;
                color: #0d0d0d;
            }
            .scroll-nav-divider {
                height: 1px;
                margin: 0 10px;
                background: #555;
            }
            #backToTopBtn {
                display: none;
            }
            /* 单屏时整个容器隐藏（向下按钮隐藏，回到顶部也隐藏） */
            .scroll-nav.hidden {
                display: none !important;
            }
            /* 回到顶部按钮隐藏时，只留向下按钮，容器还是完整圆角 */
            .scroll-nav.no-backtop .scroll-nav-divider {
                display: none;
            }
            @media (max-width: 500px) {
                .scroll-nav {
                    right: 20px;
                    width: 42px;
                }
                .scroll-nav-btn {
                    height: 50px;
                    font-size: 22px;
                }
            }
        </style>
        <div class="scroll-nav" id="scrollNav">
            <button class="scroll-nav-btn" id="backToTopBtn" title="回到顶部">↑</button>
            <div class="scroll-nav-divider" id="scrollNavDivider"></div>
            <button class="scroll-nav-btn" id="scrollDownBtn" title="滚动向下 (长按直达底部)">↓</button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', backToTopHtml);

    const scrollNav = document.getElementById('scrollNav');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const scrollDownBtn = document.getElementById('scrollDownBtn');
    const divider = document.getElementById('scrollNavDivider');

    if (!scrollNav || !backToTopBtn || !scrollDownBtn) return;

    // ---------- 判断是否只有一屏（没有滚动空间） ----------
    function isSingleScreen() {
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;
        return fullHeight <= windowHeight + 1;
    }

    // ---------- 更新容器和按钮的显示状态 ----------
    function updateButtonsVisibility() {
        const singleScreen = isSingleScreen();

        // 单屏：整个容器隐藏
        if (singleScreen) {
            scrollNav.classList.add('hidden');
            return;
        }
        scrollNav.classList.remove('hidden');

        // 非单屏：根据滚动位置决定是否显示回到顶部按钮
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop > 0) {
            backToTopBtn.style.display = 'flex';
            divider.style.display = 'block';
            scrollNav.classList.remove('no-backtop');
        } else {
            backToTopBtn.style.display = 'none';
            divider.style.display = 'none';
            scrollNav.classList.add('no-backtop');
        }
    }

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---------- 滚动向下按钮：单击滚一屏，长按直达底部 ----------
    let pressTimer = null;
    let isLongPress = false;
    const LONG_PRESS_DURATION = 600;

    function startPress(e) {
        e.preventDefault();
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        isLongPress = false;
        scrollDownBtn.classList.add('longpress-active');

        pressTimer = setTimeout(() => {
            isLongPress = true;
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
            scrollDownBtn.classList.remove('longpress-active');
            pressTimer = null;
        }, LONG_PRESS_DURATION);
    }

    function endPress(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        scrollDownBtn.classList.remove('longpress-active');

        if (!isLongPress) {
            if (e.type === 'mouseleave' || e.type === 'touchcancel') {
                isLongPress = false;
                return;
            }
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
        setTimeout(() => {
            isLongPress = false;
        }, 0);
    }

    scrollDownBtn.addEventListener('mousedown', startPress);
    scrollDownBtn.addEventListener('mouseup', endPress);
    scrollDownBtn.addEventListener('mouseleave', endPress);

    scrollDownBtn.addEventListener('touchstart', startPress, { passive: false });
    scrollDownBtn.addEventListener('touchend', endPress);
    scrollDownBtn.addEventListener('touchcancel', endPress);

    scrollDownBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (e.detail === 0) {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
    });

    window.addEventListener('scroll', updateButtonsVisibility);
    window.addEventListener('resize', updateButtonsVisibility);

    let resizeObserverTimer = null;
    const observer = new MutationObserver(function() {
        if (resizeObserverTimer) clearTimeout(resizeObserverTimer);
        resizeObserverTimer = setTimeout(() => {
            updateButtonsVisibility();
        }, 100);
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    updateButtonsVisibility();

    window.addEventListener('beforeunload', function() {
        if (pressTimer) clearTimeout(pressTimer);
        if (resizeObserverTimer) clearTimeout(resizeObserverTimer);
    });
})();

// ==================== 百度统计 ====================
var _hmt = _hmt || [];
(function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?726197c7cdeb238883e13623049915fa";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();