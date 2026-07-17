// ==================== 公共组件自动注入 ====================
(function() {
    // HTML 模板
    const html = `
        <!-- 图标组 -->
        <div id="iconGroup">
            <canvas id="menuIcon" width="50" height="50"></canvas>
            <nav id="subNav">
                <a href="index.html">首页</a>
                <a href="tools.html">工具</a>
                <a href="aboutMe.html">关于我</a>
            </nav>
            <canvas id="dinoIcon" width="50" height="50"></canvas>
        </div>
        
        <!-- 小恐龙跑酷组件 -->
        <div id="dinoBar">
            <dino-game width="100%" height="50" speed="3"></dino-game>
            <button class="close-btn" onclick="toggleDino()">✕</button>
        </div>
        
        <!-- 占位高度 -->
        <div id="topPlaceholder"></div>
    `;

    // 注入到页面顶部
    const container = document.getElementById('topBarContainer');
    if (container) {
        container.innerHTML = html;
    }

    // ==================== 画菜单图标（Canvas） ====================
    function drawMenuIcon() {
        const canvas = document.getElementById('menuIcon');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 50, 50);
        
        // 背景圆
        ctx.fillStyle = '#c4334c';
        ctx.beginPath();
        ctx.arc(25, 25, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 三条横线
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 16, 26, 3);
        ctx.fillRect(12, 23, 26, 3);
        ctx.fillRect(12, 30, 26, 3);
    }
    drawMenuIcon();

    // ==================== 画小恐龙图标（Canvas） ====================
    function drawDinoIcon() {
        const canvas = document.getElementById('dinoIcon');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 50, 50);
        
        // 背景圆
        ctx.fillStyle = '#c4334c';
        ctx.beginPath();
        ctx.arc(25, 25, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 小恐龙（白色）
        ctx.fillStyle = '#fff';
        // 身体
        ctx.fillRect(12, 18, 16, 18);
        // 头
        ctx.fillRect(24, 8, 12, 12);
        // 眼睛
        ctx.fillStyle = '#c4334c';
        ctx.fillRect(32, 10, 3, 3);
        // 腿
        ctx.fillStyle = '#fff';
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
        } else if (!e.target.closest('#menuIcon') && !e.target.closest('#subNav')) {
            subNav.classList.remove('show');
        }
    });

    // ==================== 小恐龙显示/隐藏 ====================
    window.toggleDino = function() {
        const bar = document.getElementById('dinoBar');
        const icon = document.getElementById('dinoIcon');
        const iconGroup = document.getElementById('iconGroup');
        const placeholder = document.getElementById('topPlaceholder');
        
        if (bar.style.display === 'none') {
            // 显示跑酷条，隐藏小恐龙图标，图标组回到 top:60px
            bar.style.display = 'block';
            icon.classList.remove('show');
            iconGroup.classList.remove('move-up');
            placeholder.style.height = '50px';
        } else {
            // 隐藏跑酷条，显示小恐龙图标，图标组移到 top:10px
            bar.style.display = 'none';
            icon.classList.add('show');
            iconGroup.classList.add('move-up');
            placeholder.style.height = '0px';
        }
    };

    // 小恐龙图标点击
    const dinoIconEl = document.getElementById('dinoIcon');
    if (dinoIconEl) {
        dinoIconEl.addEventListener('click', toggleDino);
    }
})();