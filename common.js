// ==================== 公共组件自动注入 ====================
(function() {
    // HTML 模板
    const html = `
        <div id="topBar">
            <div class="inner">
                <button id="menuBtn">菜单</button>
                <nav id="subNav">
                    <a href="tools.html">工具</a>
                    <a href="aboutMe.html">关于我</a>
                </nav>
                <canvas id="dinoIcon" width="50" height="50"></canvas>
            </div>
            <div id="dinoBar">
                <dino-game width="100%" height="30" speed="3"></dino-game>
                <button class="close-btn" onclick="toggleDino()">✕</button>
            </div>
        </div>
        <div id="topPlaceholder"></div>
    `;

    // 注入到页面顶部
    const container = document.getElementById('topBarContainer');
    if (container) {
        container.innerHTML = html;
    }

    // 菜单交互
    document.addEventListener('click', function(e) {
        const menuBtn = document.getElementById('menuBtn');
        const subNav = document.getElementById('subNav');
        if (!menuBtn || !subNav) return;
        
        if (e.target === menuBtn) {
            subNav.classList.toggle('show');
        } else if (!e.target.closest('#topBar')) {
            subNav.classList.remove('show');
        }
    });

    // 小恐龙显示/隐藏
    window.toggleDino = function() {
        const bar = document.getElementById('dinoBar');
        const icon = document.getElementById('dinoIcon');
        const placeholder = document.getElementById('topPlaceholder');
        
        if (bar.style.display === 'none') {
            bar.style.display = 'block';
            icon.classList.remove('show');
            placeholder.style.height = '80px';
        } else {
            bar.style.display = 'none';
            icon.classList.add('show');
            placeholder.style.height = '50px';
        }
    };

    // 小恐龙图标点击
    const dinoIcon = document.getElementById('dinoIcon');
    if (dinoIcon) {
        dinoIcon.addEventListener('click', toggleDino);
    }

    // 画小恐龙图标
    function drawDinoIcon() {
        const canvas = document.getElementById('dinoIcon');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 50, 50);
        
        // 身体
        ctx.fillStyle = '#fff';
        ctx.fillRect(10, 15, 20, 25);
        // 头
        ctx.fillRect(25, 5, 15, 15);
        // 眼睛
        ctx.fillStyle = '#c4334c';
        ctx.fillRect(35, 8, 4, 4);
        // 腿
        ctx.fillStyle = '#fff';
        ctx.fillRect(12, 38, 6, 10);
        ctx.fillRect(22, 38, 6, 10);
    }
    drawDinoIcon();
})();