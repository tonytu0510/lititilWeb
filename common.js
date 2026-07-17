// ==================== 公共组件自动注入 ====================
(function() {
    // HTML 模板
    const html = `
        <!-- 图标组 -->
        <div id="iconGroup">
            <!-- 菜单包装器（relative 定位，包含菜单图标和二级导航） -->
            <div id="menuWrapper">
                <canvas id="menuIcon" width="50" height="50"></canvas>
                <nav id="subNav">
                    <a href="index.html">首页</a>
                    <a href="tools.html">工具</a>
                    <a href="aboutMe.html">关于我</a>
                </nav>
            </div>
            <canvas id="dinoIcon" width="50" height="50"></canvas>
        </div>

        <!-- 小恐龙跑酷组件 -->
        <div id="dinoBar" style="position:relative">
       <!-- 关闭按钮（最左边） -->
       <button class="close-btn" id="topPlaceholder" onclick="toggleDino()">✕</button>
    <dino-game speed="3" style="position: absolute;left: 50px;top: 0;height: 50px;width: calc(100% - 230px)" id='dinoGameChangeWidth'></dino-game>
    
    <!-- 开始游戏按钮（最右边） -->
    <button id="startGameBtn" onclick="startDinoGame()" style="position:absolute;right:90px;top:13px;z-index:10;background:#fff;color:#c4334c;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-weight:bold;width:80px">开始游戏</button>
    
    <!-- 问号图标 -->
    <button id="helpBtn" onclick="showHelp()" style="position:absolute;right:40px;top:13px;z-index:10;background:#fff;color:#c4334c;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;font-weight:bold;width:30px">?</button>
</div>

<!-- 游戏说明弹窗 -->
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
        } else if (!e.target.closest('#menuWrapper') && !e.target.closest('#subNav')) {
            subNav.classList.remove('show');
        }
    });

    // ==================== 小恐龙显示/隐藏 ====================
window.toggleDino = function() {
    const bar = document.getElementById('dinoBar');
    const icon = document.getElementById('dinoIcon');
    const iconGroup = document.getElementById('iconGroup');
    const placeholder = document.getElementById('topPlaceholder');
    const startBtn = document.getElementById('startGameBtn');
    const dinoGameChangeWidth=document.getElementById('dinoGameChangeWidth')
    
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
        
        // 重置游戏到初始状态
        const dinoGame = document.querySelector('dino-game');
        if (dinoGame && dinoGame.resetGamePublic) {
            dinoGame.resetGamePublic();
        }
        // 显示开始按钮
        if (startBtn) {
	 dinoGameChangeWidth.style.width = 'calc(100% - 230px)';
	startBtn.style.display = 'block';
        }
    }
};

    // 小恐龙图标点击
    const dinoIconEl = document.getElementById('dinoIcon');
    if (dinoIconEl) {
        dinoIconEl.addEventListener('click', toggleDino);
    }
// 开始游戏（触发小恐龙的点击事件）
window.startDinoGame =  function () {
    const dinoGame = document.querySelector('dino-game');
    if (dinoGame) {
        // 获取 Shadow DOM 内部的 canvas
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
    // 隐藏开始按钮
    document.getElementById('startGameBtn').style.display = 'none';
    document.getElementById('dinoGameChangeWidth').style.width = 'calc(100% - 120px)';
}

// 显示游戏说明
window. showHelp = function() {
    document.getElementById('helpModal').style.display = 'block';
}

// 关闭游戏说明
window.closeHelp = function() {
    document.getElementById('helpModal').style.display = 'none';
}

// 点击弹窗外部关闭
document.addEventListener('click', function(e) {
    const modal = document.getElementById('helpModal');
    if (modal && modal.style.display === 'block') {
        if (!e.target.closest('#helpModal') && !e.target.closest('#helpBtn')) {
            modal.style.display = 'none';
        }
    }
});
})();