// ==================== 公共组件自动注入 ====================
(function() {
    // ==================== 游戏栏状态管理 ====================
    const DINO_STATE_KEY = 'dinoBarClosed';
    const MENU_STATE_KEY = 'arcMenuSelectedIndex';

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

    function saveMenuIndex(index) {
        sessionStorage.setItem(MENU_STATE_KEY, index.toString());
    }

    function getSavedMenuIndex() {
        const stored = sessionStorage.getItem(MENU_STATE_KEY);
        if (stored === null) return 0;
        const idx = parseInt(stored);
        return isNaN(idx) ? 0 : idx;
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

    const menuData = [
        { name: '首页', href: 'index.html?M=1' },
        { name: '工具箱', href: 'tools.html' },
        { name: '二维码', href: 'qrCode.html' },
        { name: '对合环', href: 'nestedInvolutionRingHuge.html' },
        { name: 'RSTUV', href: 'chinaClock.html' },
        { name: '太阳系', href: 'cosmos.html' },
        { name: '拆字', href: 'fontAll.html' },
        { name: '缘分测试', href: 'namePairing.html' },
        { name: '判证', href: 'panding.html' },
        { name: '130演示', href: '130demo.html' },
        { name: '笔记', href: 'notes.html' },
        { name: '布线笔记', href: 'cable.html' },
        { name: '关于我', href: 'aboutMe.html' },
        { name: '声明', href: 'statement.html' }
    ];

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
                overflow: hidden;
            }
            #menuContainer.active {
                pointer-events: auto;
            }
            #menuBg {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 0.35s ease;
            }
            #menuContainer.active #menuBg {
                opacity: 1;
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
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                pointer-events: none;
                opacity: 0;
                user-select: none;
                font-family: 'Courier New', monospace;
                text-decoration: none;
                font-weight: 300;
                letter-spacing: 0.5px;
                will-change: right, bottom, opacity;
                margin-left: -22px;
                margin-top: -22px;
            }
            .menu-item.active {
                background: #7cb8b8;
                color: #0d0d0d;
                border-color: #7cb8b8;
            }
            #menuContainer.active .menu-item {
                pointer-events: auto;
                opacity: 1;
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
            @media (max-width: 500px) {
                #menuContainer {
                    width: 300px;
                    height: 300px;
                }
                .menu-item {
                    width: 36px;
                    height: 36px;
                    font-size: 10px;
                    margin-left: -18px;
                    margin-top: -18px;
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
            }
        </style>

        <div id="currentLabel">
            <div class="index" id="currentIndex">1 / 14</div>
            <div class="name" id="currentName">首页</div>
            <div style="color:#555;font-size:11px;">滚轮/滑动切换</div>
        </div>

        <button id="menuTrigger">☰</button>

        <div id="iconGroup">
            <canvas id="dinoIcon" width="50" height="50"></canvas>
        </div>

        <div id="menuContainer">
            <div id="menuBg"></div>
        </div>

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

    // ==================== 圆弧菜单脚本 ====================
    (function() {
        const containerEl = document.getElementById('menuContainer');
        const trigger = document.getElementById('menuTrigger');
        const currentName = document.getElementById('currentName');
        const currentIndex = document.getElementById('currentIndex');
        const label = document.getElementById('currentLabel');

        let isOpen = false;
        let selectedIndex = 0;
        let isDragging = false;
        let rotationOffset = 0;
        let isInitialized = false;

        const savedIndex = getSavedMenuIndex();

        function buildMenu() {
            const count = menuData.length;
            const size = containerEl.offsetWidth || 400;
            const radius = size * 0.55;

            containerEl.querySelectorAll('.menu-item').forEach(el => el.remove());

            menuData.forEach((item, index) => {
                const el = document.createElement('a');
                el.className = 'menu-item';
                el.textContent = item.name.length > 4 ? item.name.slice(0, 4) : item.name;
                el.title = item.name;
                el.href = item.href;
                el.dataset.index = index;

                const baseAngle = -90 + (360 * index / count);
                el.dataset.baseAngle = baseAngle;

                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    const idx = parseInt(this.dataset.index);
                    selectItem(idx);
                    saveMenuIndex(idx);
                    toggleMenu(false);
                    setTimeout(() => {
                        window.location.href = this.href;
                    }, 300);
                });

                containerEl.appendChild(el);
            });

            updatePositions(0);
            const targetIdx = (savedIndex >= 0 && savedIndex < menuData.length) ? savedIndex : 0;
            switchToIndex(targetIdx);
            isInitialized = true;
        }

        function updatePositions(offsetDeg) {
            const count = menuData.length;
            const size = containerEl.offsetWidth || 400;
            const radius = size * 0.55;
            const items = containerEl.querySelectorAll('.menu-item');

            items.forEach((el, index) => {
                const baseAngle = parseFloat(el.dataset.baseAngle);
                const angleDeg = baseAngle + offsetDeg;
                const rad = angleDeg * Math.PI / 180;
                const x = radius * Math.cos(rad);
                const y = radius * Math.sin(rad);

                el.style.right = (x - 22) + 'px';
                el.style.bottom = (y - 22) + 'px';
            });
        }

        function selectItem(index) {
            const items = containerEl.querySelectorAll('.menu-item');
            items.forEach((el, i) => {
                el.classList.toggle('active', i === index);
            });
            selectedIndex = index;
            if (menuData[index]) {
                currentName.textContent = menuData[index].name;
                currentIndex.textContent = (index + 1) + ' / ' + menuData.length;
            }
            label.classList.add('show');
        }

        function switchToIndex(index) {
            const count = menuData.length;
            const targetAngle = 45;
            const baseAngle = -90 + (360 * index / count);
            const offset = targetAngle - baseAngle;
            rotationOffset = offset;
            updatePositions(offset);
            selectItem(index);
            saveMenuIndex(index);
        }

        function stepSwitch(delta) {
            const count = menuData.length;
            const dir = delta > 0 ? 1 : -1;
            const next = (selectedIndex + dir + count) % count;
            switchToIndex(next);
        }

        function toggleMenu(open) {
            isOpen = open;
            containerEl.classList.toggle('active', open);
            trigger.classList.toggle('active', open);
            if (!open) {
                setTimeout(() => {
                    if (!isOpen) label.classList.remove('show');
                }, 300);
            } else {
                label.classList.add('show');
                setTimeout(() => {
                    switchToIndex(selectedIndex);
                }, 50);
            }
        }

        // ========== 事件绑定（仅针对 menuContainer 区域） ==========
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu(!isOpen);
        });

        document.addEventListener('click', function(e) {
            if (isOpen && !containerEl.contains(e.target) && e.target !== trigger) {
                toggleMenu(false);
            }
        });

        // ========== 滚轮事件：只对 menuContainer 生效 ==========
        containerEl.addEventListener('wheel', function(e) {
            if (!isOpen) return;
            e.preventDefault();
            e.stopPropagation();
            stepSwitch(e.deltaY);
        }, { passive: false });

        // ========== 禁用鼠标中键（全局） ==========
        document.addEventListener('mousedown', function(e) {
            if (e.button === 1) {
                e.preventDefault();
                return false;
            }
        });

        // ========== 鼠标拖拽：只在 menuContainer 上生效 ==========
        let dragStartY = 0;
        containerEl.addEventListener('mousedown', function(e) {
            if (!isOpen) return;
            if (e.button !== 0) return;
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

        // ========== 触摸滑动：只在 menuContainer 上生效 ==========
        let touchStartY = 0;
        containerEl.addEventListener('touchstart', function(e) {
            if (!isOpen) return;
            isDragging = true;
            touchStartY = e.touches[0].clientY;
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

        // ========== 键盘支持 ==========
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
                const items = containerEl.querySelectorAll('.menu-item');
                if (items[selectedIndex]) {
                    items[selectedIndex].click();
                }
            }
        });

        // ========== 初始化 ==========
        function initMenu() {
            buildMenu();
            toggleMenu(false);
        }

        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initMenu, 300);
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

    // ==================== 菜单交互 ====================
    document.addEventListener('click', function(e) {
        const menuIcon = document.getElementById('menuIcon');
        const subNav = document.getElementById('subNav');
        if (!menuIcon || !subNav) return;
        if (e.target === menuIcon) {
            subNav.classList.toggle('show');
        } else if (!e.target.closest('#menuWrapper') && !e.target.closest('#subNav')) {
            subNav.classList.remove('show');
        }
    });

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

// ==================== 百度统计 ====================
var _hmt = _hmt || [];
(function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?726197c7cdeb238883e13623049915fa";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();