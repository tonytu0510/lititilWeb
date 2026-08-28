// ==================== 公共组件自动注入 ====================
(function() {
    // ==================== 游戏栏状态管理 ====================
    const DINO_STATE_KEY = 'dinoBarClosed';

    function isDinoBarClosed() {
        const stored = sessionStorage.getItem(DINO_STATE_KEY);
        if (stored === null) {
            return false; // 默认打开
        }
        return stored === 'true';
    }

    function setDinoBarClosed(closed) {
        sessionStorage.setItem(DINO_STATE_KEY, closed ? 'true' : 'false');
    }

    // ==================== 恢复游戏栏状态（页面加载时执行） ====================
    function restoreDinoState() {
        const bar = document.getElementById('dinoBar');
        const icon = document.getElementById('dinoIcon');
        const iconGroup = document.getElementById('iconGroup');
        const placeholder = document.getElementById('topPlaceholder');

        if (!bar) return;

        // 先全部隐藏，避免闪烁
        bar.style.display = 'none';
        if (icon) icon.classList.add('show');
        if (iconGroup) iconGroup.classList.add('move-up');
        if (placeholder) placeholder.style.height = '0px';

        const closed = isDinoBarClosed();

        if (!closed) {
            // 需要打开：下一帧再显示，确保隐藏已生效
            requestAnimationFrame(function() {
                bar.style.display = 'block';
                if (icon) icon.classList.remove('show');
                if (iconGroup) iconGroup.classList.remove('move-up');
                if (placeholder) placeholder.style.height = '50px';
            });
        }else{
            if (typeof updateSliderHeight === 'function') {
                updateSliderHeight();
            }
        }
    }

    // ==================== HTML 模板 ====================
    const html = `
        <!-- 图标组 -->
        <div id="iconGroup">
            <div id="menuWrapper">
                <canvas id="menuIcon" width="50" height="50"></canvas>
                <nav id="subNav">
                    <a href="index.html?M=1">首页</a>
                    <a href="tools.html">工具箱</a>
                    <a href="qrCode.html">二维码</a>
                    <a href="nestedInvolutionRingHuge.html">对合环</a>
                    <a href="chinaClock.html">RSTUV</a>
                    <a href="cosmos.html">太阳系</a>
                    <a href="fontAll.html">拆字</a>
                    <a href="namePairing.html">缘分测试</a>
                    <a href="panding.html">判证</a>
                    <a href="aboutMe.html">关于我</a>
                </nav>
            </div>
            <canvas id="dinoIcon" width="50" height="50"></canvas>
        </div>

        <!-- 小恐龙跑酷组件 -->
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

    // ==================== 画菜单图标 ====================
    function drawMenuIcon() {
        const canvas = document.getElementById('menuIcon');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 50, 50);
        ctx.fillStyle = '#871F78';
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
        ctx.fillStyle = '#871F78';
        ctx.fillRect(12, 18, 16, 18);
        ctx.fillRect(24, 8, 12, 12);
        ctx.fillStyle = '#fff';
        ctx.fillRect(32, 10, 3, 3);
        ctx.fillStyle = '#871F78';
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

    // ==================== 游戏说明弹窗 ====================
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