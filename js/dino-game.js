// ==================== 自定义标签 <dino-game> 左右跑酷版 ====================
console.log('dino-game 执行了');
console.log('topBarContainer：', document.getElementById('topBarContainer'));
class DinoGame extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const container = document.createElement('div');
        container.style.cssText = 'width:100%;height:100%;position:relative;';
        
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'width:100%;height:100%;display:block;';
        
        container.appendChild(this.canvas);
        const style = document.createElement('style');
        style.textContent = `
        :host {
            display: block;
            position: absolute;
            left: 50px;
            top: 0;
            height: 50px;
            width: calc(100% - 230px);
        }
        div {
            width: 100%;
            height: 100%;
            position: relative;
        }
        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
            
        /* ========== 图标组（右上角固定） ========== */
        #iconGroup {
            position: fixed;
            top: 60px;
            right: 10px;
            z-index: 1000;
            width: 140px
        }

        /* 小恐龙关闭时，图标组移到距离上部10px */
        #iconGroup.move-up {
            top: 10px;
        }

        /* 菜单包装器（relative 定位） */
        #menuWrapper {
            float: right;
        }

        /* 菜单图标 */
        #menuIcon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: transform 0.3s;
            position: relative;
        }

        #menuIcon:hover {
            transform: scale(1.1);
        }

        /* 小恐龙图标 */
        #dinoIcon {
            float: right;
            display: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: transform 0.3s;
        }

        #dinoIcon.show {
            display: block;
            margin-right: 10px;
        }

        #dinoIcon:hover {
            transform: scale(1.1);
        }

        /* 二级导航（absolute 定位在菜单图标下方） */
        #subNav {
            display: none;
            position: absolute;
            background: var(--bg);
            border: 1px solid var(--light-gray);
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1001;
            width: 160px;
            right: 0;
            top: 55px;
        }

        #subNav.show {
            display: block;
        }

        #subNav a {
            display: block;
            padding: 10px 20px;
            text-decoration: none;
            color: var(--text);
            transition: background 0.3s;
        }

        #subNav a:hover {
            background: #f9ed69;
            color: #fff;
        }

        /* 小恐龙跑酷条（全宽） */
        #dinoBar {
            width: 100%;
            height: 50px;
            /*background: linear-gradient(90deg, var(--primary), var(--secondary));*/
            background: linear-gradient(40deg, #6a2c70 0%,#b83b5e 40%,#f08a5d 70%,#f9ed69 100%);

            position: fixed;
            top: 0;
            left: 0;
            z-index: 999;
            overflow: hidden;
        }

        #dinoBar .close-btn {
            position: absolute;
            left: 0;
            top: 0;
            background: none;
            border: none;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            z-index: 10;
            width:50px;
            height:50px
        }
        `;
        shadow.appendChild(style);
        shadow.appendChild(container);
        
        this.ctx = this.canvas.getContext('2d');
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.gameSpeed = 3;
        
        // 玩家（上下移动）
        this.player = {
            x: 50,
            y: 25,
            width: 30,
            height: 7,
            vy: 0,
            gravity: 0.5,
            jumpPower: -10
        };
        
        // 障碍物（从右向左移动）
        this.obstacles = [];
        this.frameCount = 0;
        this.spawnInterval = 80;
        
        // 地面
        this.groundY = 0;
        
        this.canvas.addEventListener('click', (e) => this.handleInput(e));
        this.keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.playerJump();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        this.resize();
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(container);
        
        this.gameLoop();
        // 公开方法：重置游戏到初始状态
        this.resetGamePublic = function() {
            this.gameStarted = false;
            this.gameOver = false;
            this.score = 0;
            this.obstacles = [];
            this.gameSpeed = 3;
            this.spawnInterval = 80;
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
        }
    }
    
    resize() {

        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 50;//rect.height
        this.groundY = this.canvas.height - 5;
        this.player.y = this.groundY - this.player.height;
    }
    
    handleInput(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const btnWidth = 120;
        const btnHeight = 30;
        const btnX = this.canvas.width - btnWidth - 10;
        const btnY = this.canvas.height / 2 - btnHeight / 2;
        
        // 检查是否点击了“开始游戏”按钮
        if (!this.gameStarted && x >= btnX && x <= btnX + btnWidth && 
            e.clientY - rect.top >= btnY && e.clientY - rect.top <= btnY + btnHeight) {
            this.startGame();
        } else if (!this.gameStarted) {
            this.startGame();
        } else if (this.gameOver) {
            this.resetGame();
        } else {
            this.playerJump();
        }
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.gameSpeed = 3;
        this.spawnInterval = 80;
    }
    
    resetGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.obstacles = [];
        this.gameSpeed = 3;
        this.spawnInterval = 80;
    }
    
    playerJump() {
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.vy = this.player.jumpPower;
        }
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        // 玩家物理
        this.player.vy += this.player.gravity;
        this.player.y += this.player.vy;
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
        }
        if (this.player.y <= 0) {
            this.player.y = 0;
            this.player.vy = 0;
        }
        
        // 障碍物
        this.frameCount++;
        if (this.frameCount >= this.spawnInterval) {
            this.frameCount = 0;
            const obstacleY = Math.random() * (this.canvas.height - 30);
            this.obstacles.push({
                x: this.canvas.width,
                y: obstacleY,
                width: 15 + Math.random() * 15,
                height: 5 + Math.random() * 15
            });
            this.spawnInterval = Math.max(40, this.spawnInterval - 1);
        }
        
        this.obstacles.forEach(o => o.x -= this.gameSpeed);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
        
        // 碰撞检测
        const pr = { 
            x: this.player.x, 
            y: this.player.y, 
            w: this.player.width, 
            h: this.player.height 
        };
        for (let o of this.obstacles) {
            const or = { x: o.x, y: o.y, w: o.width, h: o.height };
            if (pr.x < or.x + or.w && pr.x + pr.w > or.x && 
                pr.y < or.y + or.h && pr.y + pr.h > or.y) {
                this.gameOver = true;
                break;
            }
        }
        
        this.score++;
        if (this.score % 300 === 0) this.gameSpeed += 0.5;
    }
    
    draw() {
        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        
        ctx.clearRect(0, 0, cw, ch);
        
        // 地面线
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(cw, this.groundY);
        ctx.stroke();
        
        // 玩家
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        ctx.fillStyle = '#c4334c';
        ctx.fillRect(this.player.x + this.player.width - 8, this.player.y + 2, 5, 5);
        
        // 障碍物
        ctx.fillStyle = '#c4bb33';
        this.obstacles.forEach(o => {
            ctx.fillRect(o.x, o.y, o.width, o.height);
        });
        
        // 分数
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('分数: ' + Math.floor(this.score / 10), 10, 15);

        // 开始按钮（最右边）
        //if (!this.gameStarted) {
        //    const btnWidth = 120;
        //    const btnHeight = 30;
        //    const btnX = cw - btnWidth - 10;
        //    const btnY = ch / 2 - btnHeight / 2;

        //    ctx.fillStyle = '#c4334c';
        //    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
        //    ctx.fillStyle = '#fff';
        //    ctx.font = '14px sans-serif';
        //    ctx.textAlign = 'center';
        //    ctx.fillText('开始游戏', btnX + btnWidth / 2, btnY + 20);
        //    ctx.textAlign = 'start';
        //}
        
        // 游戏结束提示
        if (this.gameOver) {
            ctx.fillStyle = '#fff';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('游戏结束！点击重来', cw / 2, ch / 2);
            ctx.textAlign = 'start';
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    disconnectedCallback() {
        document.removeEventListener('keydown', this.keyHandler);
        this.resizeObserver.disconnect();
    }
}
customElements.define('dino-game', DinoGame);
console.log('define 后，dino-game 标签：', document.querySelector('dino-game'));