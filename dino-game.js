// ==================== 自定义标签 <dino-game> ====================
class DinoGame extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        
        const container = document.createElement('div');
        container.style.cssText = 'width:100%;display:flex;justify-content:center;';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = parseInt(this.getAttribute('width')) || 800;
        this.canvas.height = parseInt(this.getAttribute('height')) || 200;
        this.canvas.style.border = '1px solid #ccc';
        this.canvas.style.background = '#fff';
        this.canvas.style.cursor = 'pointer';
        
        container.appendChild(this.canvas);
        shadow.appendChild(container);
        
        this.ctx = this.canvas.getContext('2d');
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.gameSpeed = parseInt(this.getAttribute('speed')) || 5;
        this.groundY = this.canvas.height - 30;
        
        this.dino = {
            x: 80, y: this.groundY, width: 40, height: 50,
            vy: 0, gravity: 0.7, jumpPower: -13, grounded: true
        };
        
        this.obstacles = [];
        this.frameCount = 0;
        this.spawnInterval = 100;
        
        this.canvas.addEventListener('click', () => this.handleInput());
        this.keyHandler = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.handleInput();
            }
        };
        document.addEventListener('keydown', this.keyHandler);
        
        this.resizeObserver = new ResizeObserver(() => {
            const w = parseInt(this.getAttribute('width')) || 800;
            const parentW = this.canvas.parentElement.clientWidth;
            this.canvas.width = Math.min(w, parentW - 20);
            this.groundY = this.canvas.height - 30;
        });
        this.resizeObserver.observe(container);
        
        this.gameLoop();
    }
    
    handleInput() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.gameOver = false;
            this.score = 0;
            this.obstacles = [];
            this.gameSpeed = parseInt(this.getAttribute('speed')) || 5;
            this.spawnInterval = 100;
        }
        if (!this.gameOver && this.dino.grounded) {
            this.dino.vy = this.dino.jumpPower;
            this.dino.grounded = false;
        }
        if (this.gameOver) {
            this.gameOver = false;
            this.score = 0;
            this.obstacles = [];
            this.gameSpeed = parseInt(this.getAttribute('speed')) || 5;
            this.spawnInterval = 100;
            this.dino.y = this.groundY;
            this.dino.vy = 0;
            this.dino.grounded = true;
        }
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        this.dino.vy += this.dino.gravity;
        this.dino.y += this.dino.vy;
        if (this.dino.y >= this.groundY) {
            this.dino.y = this.groundY;
            this.dino.vy = 0;
            this.dino.grounded = true;
        }
        this.frameCount++;
        if (this.frameCount >= this.spawnInterval) {
            this.frameCount = 0;
            const type = Math.random() > 0.7 ? 'bird' : 'cactus';
            this.obstacles.push({
                x: this.canvas.width,
                y: type === 'bird' ? this.groundY - 40 - Math.random() * 40 : this.groundY,
                width: type === 'bird' ? 30 : 15 + Math.random() * 15,
                height: type === 'bird' ? 20 : 30 + Math.random() * 20,
                type: type
            });
            this.spawnInterval = Math.max(50, this.spawnInterval - 1);
        }
        this.obstacles.forEach(o => o.x -= this.gameSpeed);
        this.obstacles = this.obstacles.filter(o => o.x + o.width > 0);
        const dr = { x: this.dino.x+5, y: this.dino.y+5, w: this.dino.width-10, h: this.dino.height-10 };
        for (let o of this.obstacles) {
            const or = { x: o.x+3, y: o.y+3, w: o.width-6, h: o.height-6 };
            if (dr.x < or.x+or.w && dr.x+dr.w > or.x && dr.y < or.y+or.h && dr.y+dr.h > or.y) {
                this.gameOver = true; break;
            }
        }
        this.score++;
        if (this.score % 200 === 0) this.gameSpeed += 0.5;
    }
    
    draw() {
        const ctx = this.ctx, cw = this.canvas.width, ch = this.canvas.height;
        ctx.clearRect(0, 0, cw, ch);
        ctx.beginPath(); ctx.moveTo(0, this.groundY+50); ctx.lineTo(cw, this.groundY+50);
        ctx.strokeStyle = '#535353'; ctx.lineWidth = 2; ctx.stroke();
        const dx = this.dino.x, dy = this.dino.y;
        ctx.fillStyle = '#535353';
        ctx.fillRect(dx, dy+10, this.dino.width, this.dino.height-10);
        ctx.fillRect(dx+this.dino.width-10, dy, 15, 15);
        ctx.fillStyle = '#fff'; ctx.fillRect(dx+this.dino.width, dy+2, 5, 5);
        ctx.fillStyle = '#535353';
        if (this.dino.grounded) {
            ctx.fillRect(dx+5, dy+this.dino.height, 8, 15);
            ctx.fillRect(dx+this.dino.width-13, dy+this.dino.height, 8, 15);
        } else {
            ctx.fillRect(dx+5, dy+this.dino.height-5, 8, 10);
            ctx.fillRect(dx+this.dino.width-13, dy+this.dino.height-10, 8, 10);
        }
        this.obstacles.forEach(o => {
            if (o.type === 'cactus') {
                ctx.fillStyle = '#2e7d32'; ctx.fillRect(o.x, o.y-o.height, o.width, o.height);
                ctx.fillStyle = '#1b5e20'; ctx.fillRect(o.x+o.width/2-2, o.y-o.height-8, 4, 8);
            } else {
                ctx.fillStyle = '#ff9800';
                ctx.beginPath();
                ctx.ellipse(o.x+o.width/2, o.y-o.height/2, o.width/2, o.height/2, 0, 0, Math.PI*2);
                ctx.fill();
            }
        });
        ctx.fillStyle = '#535353'; ctx.font = '16px sans-serif';
        ctx.fillText('分数: '+Math.floor(this.score/10), 10, 30);
        if (!this.gameStarted) ctx.fillText('点我开始', cw/2-40, ch/2);
        if (this.gameOver) ctx.fillText('游戏结束！点我重来', cw/2-80, ch/2);
    }
    
    gameLoop() {
        this.update(); this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    disconnectedCallback() {
        document.removeEventListener('keydown', this.keyHandler);
        this.resizeObserver.disconnect();
    }
}
customElements.define('dino-game', DinoGame);