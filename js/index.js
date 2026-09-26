/* =========================================================
   全局变量与轮播逻辑
   ========================================================= */
let current = 0, indexTime = 10000, otherTime = 4200, time = indexTime;
const slides = document.querySelectorAll('.slide'), dots = document.querySelectorAll('#dots span');
const slider = document.getElementById('slider');
let TimeOutTimer = null, H5Scal = null, radioY = null, H5PrintFont = null;
const canvas1 = document.getElementById('canvas1');

function showSlide(n) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[n].classList.add('active');
    dots[n].classList.add('active');
    current = n;
    if (n === 0) { canvas1._textIndex = 0; canvas1._textTimer = performance.now(); }
    resetTimer();
    redrawAllCanvas();
}
function nextSlide() { showSlide((current + 1) % 9); }
function isIndexTime() { time = current === 0 ? indexTime : otherTime; return time; }
function prevSlide() { showSlide((current - 1 + 9) % 9); }
function goTo(n) { showSlide(n); }
function initTimer(t) { clearTimeout(TimeOutTimer); TimeOutTimer = setTimeout(function () { nextSlide(); initTimer(isIndexTime()); }, t); }
function resetTimer() { clearTimer(); initTimer(isIndexTime()); }
function clearTimer() { clearTimeout(TimeOutTimer); TimeOutTimer = null; }
initTimer(time);

const slideElements = document.getElementsByClassName('slide');
for (let i = 0; i < slideElements.length; i++) {
    slideElements[i].onmouseover = function () { clearTimer(); };
    slideElements[i].onmouseout = function () { resetTimer(); };
}

/* 触摸滑动 */
let touchStartX = 0, touchStartY = 0, touchMoved = false;
slider.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; touchMoved = false;
}, {passive: true});
slider.addEventListener('touchmove', function () { touchMoved = true; }, {passive: true});
slider.addEventListener('touchend', function (e) {
    if (!touchMoved) return;
    const ex = e.changedTouches[0].clientX, ey = e.changedTouches[0].clientY;
    const dx = touchStartX - ex, dy = touchStartY - ey;
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) { if (dx > 0) nextSlide(); else prevSlide(); resetTimer(); }
    touchMoved = false;
});

/* =========================================================
   小恐龙栏高度联动
   ========================================================= */
function updateSliderHeight() {
    const db = document.getElementById('dinoBar');
    if (db && slider) {
        if (db.style.display === 'none') slider.classList.add('full');
        else slider.classList.remove('full');
    }
    if (typeof window.refreshArcMenu === 'function') {
        setTimeout(window.refreshArcMenu, 50);
    }
}

(function waitForDinoBar() {
    function bind(db) {
        const ob = new MutationObserver(function (ms) {
            ms.forEach(function (m) { if (m.attributeName === 'style') updateSliderHeight(); });
        });
        ob.observe(db, { attributes: true });
        updateSliderHeight();
    }
    const db = document.getElementById('dinoBar');
    if (db) { bind(db); return; }
    let tries = 0;
    const timer = setInterval(function() {
        tries++;
        const db2 = document.getElementById('dinoBar');
        if (db2) { clearInterval(timer); bind(db2); }
        else if (tries > 60) clearInterval(timer);
    }, 50);
})();

/* =========================================================
   核心工具：尺寸同步 / 百分比 / 图片 / 文字
   ========================================================= */
function setupCanvas(canvas) {
    const W = slider.offsetWidth;
    const H = slider.offsetHeight;
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const targetW = Math.round(W * dpr);
    const targetH = Math.round(H * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, W, H };
}
function px(p, W) { return W * p; }
function py(p, H) { return H * p; }
function ps(p) { return Math.min(slider.offsetWidth, slider.offsetHeight) * p; }

const imageCache = {};
function drawImageSafe(url, x, y, w, h, ctx) {
    if (imageCache[url]) { ctx.drawImage(imageCache[url], x, y, w, h); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imageCache[url] = img; ctx.drawImage(img, x, y, w, h); };
    img.src = url;
}
function transSize(n, W) { return H5PrintFont * Math.ceil(n * 12) * (W / 100) + 'px'; }
function transPosition(n, W) { return H5PrintFont * n * (W / 100); }
function transPositionH(n, H) { return H5PrintFont * n * (H / 100); }

function typewriterDraw(ctx, text, index, W, H, x, y, baseSize, gcs, gco) {
    if (index <= 0) return;
    const dt = text.substring(0, index);
    ctx.save(); ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
    let cx2 = x, cy2 = y, mh = null;
    for (let i = 0; i < dt.length; i++) {
        const ch = dt[i], fs = gcs(i);
        ctx.font = 'bold ' + fs + ' Georgia,serif';
        const off = gco(i);
        ctx.fillText(ch, cx2 + off.x, y + off.y);
        cx2 += ctx.measureText(ch).width;
        cy2 = y + off.y;
        const {actualBoundingBoxAscent: a, actualBoundingBoxDescent: d} = ctx.measureText(text);
        mh = parseInt(a) + parseInt(d);
    }
    if (index < text.length) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx2 + 5, cy2, transPosition(baseSize, W), mh - 7);
    }
    ctx.restore();
}

/* =========================================================
   ★ 封装 1：粒子初始化（兼容 _particles / _stars / _sym）
   ========================================================= */
function initParticles(canvas, key, list, opts) {
    opts = opts || {};
    if (canvas[key]) return;
    const count = opts.count || 150;
    const useSymbol = opts.useSymbol;
    const sizeMin = opts.sizeMin || 7;
    const sizeMax = opts.sizeMax || 20;
    const speedMin = opts.speedMin || 0.004;
    const speedMax = opts.speedMax || 0.02;
    canvas[key] = [];
    for (let i = 0; i < count; i++) {
        const item = {
            xp: Math.random(),
            yp: Math.random(),
            size: Math.random() * (sizeMax - sizeMin) + sizeMin,
            alpha: Math.random(),
            twinkleSpeed: Math.random() * (speedMax - speedMin) + speedMin,
            twinkleDir: 1
        };
        if (useSymbol) item.symbol = list[Math.floor(Math.random() * list.length)];
        else item.text = list[Math.floor(Math.random() * list.length)];
        canvas[key].push(item);
    }
}

/* =========================================================
   ★ 封装 2：粒子绘制（兼容普通文字粒子、symbol、_stars 圆点）
   ========================================================= */
function drawParticles(ctx, W, H, list, style) {
    style = style || {};
    const alphaMin = style.alphaMin !== undefined ? style.alphaMin : 0.1;
    const alphaMax = style.alphaMax !== undefined ? style.alphaMax : 0.85;
    const fontFamily = style.fontFamily || "'Microsoft YaHei',serif";
    const drawFn = style.drawFn;
    list.forEach(p => {
        p.alpha += p.twinkleSpeed * p.twinkleDir;
        if (p.alpha >= alphaMax) p.twinkleDir = -1;
        if (p.alpha <= alphaMin) p.twinkleDir = 1;
        if (drawFn) {
            drawFn(ctx, p, W, H);
        } else {
            ctx.fillStyle = style.color
                ? style.color(p, W, H)
                : `rgba(255,255,255,${p.alpha})`;
            ctx.font = `${p.size}px ${fontFamily}`;
            ctx.fillText(p.symbol !== undefined ? p.symbol : p.text, px(p.xp, W), py(p.yp, H));
        }
    });
}

/* =========================================================
   ★ 封装 3：静态几何点初始化（带缓存）
   ========================================================= */
function initStaticPoints(canvas, key, builder) {
    if (canvas[key]) return;
    canvas[key] = [];
    builder(function (item) { canvas[key].push(item); });
}

/* =========================================================
   ★ 封装 4：静态几何点绘制
   ========================================================= */
function drawStaticPoints(ctx, W, H, list, style) {
    style = style || {};
    const boldCount = style.boldCount || 12;
    const normalFont = style.normalFont || 13;
    const boldFont = style.boldFont || 18;
    const fontFamily = style.fontFamily || "'Georgia',serif";
    const boldColor = style.boldColor || 'rgba(255,255,255,0.95)';
    const normalColor = style.normalColor || 'rgba(200,200,200,0.7)';
    const getText = style.getText || (p => p.text !== undefined ? p.text : p.symbol);
    ctx.textAlign = 'center';
    list.forEach((p, i) => {
        const ic = i < boldCount;
        ctx.fillStyle = ic ? boldColor : normalColor;
        ctx.font = `bold ${ic ? boldFont : normalFont}px ${fontFamily}`;
        ctx.fillText(getText(p), px(p.xp, W), py(p.yp, H));
    });
}

/* =========================================================
   ★ 封装 5：底部标题（副标题 + 主标题）
   ========================================================= */
function drawCaption(ctx, W, H, text, subColor, mainColor, subSize, mainSize) {
    ctx.textAlign = 'center';
    subSize = subSize || Math.min(H * 0.035, 18);
    mainSize = mainSize || Math.min(H * 0.06, 28);
    ctx.fillStyle = subColor || 'rgba(255,255,255,0.8)';
    ctx.font = `${subSize}px 'Microsoft YaHei'`;
    ctx.fillText(text, W / 2, py(0.82, H));
    ctx.fillStyle = mainColor || '#ffffff';
    ctx.font = `${mainSize}px 'Microsoft YaHei'`;
    ctx.fillText(text, W / 2, py(0.92, H));
}

/* =========================================================
   绘制小工具（drawCanvas1 用到的桌/人/狗/树）
   ========================================================= */
function drawTable(ctx, x, y, tableW, unit) {
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(x, y - unit * 0.5, tableW, unit * 0.3);
    ctx.fillRect(x, y - unit * 0.6, tableW, unit * 0.13);
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x, y - unit * 0.2, tableW, unit * 0.23);
    ctx.fillStyle = '#3e2515';
    ctx.fillRect(x + unit * 0.33, y + unit * 0.03, unit * 0.23, unit * 0.5);
    ctx.fillRect(x + tableW - unit * 0.56, y + unit * 0.03, unit * 0.23, unit * 0.5);
    ctx.fillStyle = '#4a2c14';
    ctx.fillRect(x, y - unit * 0.47, unit * 0.3, unit * 1.17);
    ctx.fillRect(x + tableW - unit * 0.3, y - unit * 0.47, unit * 0.3, unit * 1.17);
}
function drawPerson(ctx, x, y, unit) {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(x - unit * 0.5, y - unit * 0.6, unit * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - unit * 0.7, y - unit * 0.32, unit * 0.4, unit * 0.6);
    ctx.fillStyle = '#2a2a4e';
    ctx.beginPath(); ctx.arc(x - unit * 0.5, y - unit * 1.0, unit * 0.36, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(x + unit * 0.5, y - unit * 0.7, unit * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + unit * 0.3, y - unit * 0.38, unit * 0.44, unit * 0.68);
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = unit * 0.12;
    ctx.beginPath(); ctx.moveTo(x - unit * 0.5, y - unit * 0.2); ctx.quadraticCurveTo(x, y - unit * 0.1, x + unit * 0.5, y - unit * 0.24); ctx.stroke();
}
function drawDog(ctx, x, y, unit) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.ellipse(x, y - unit * 0.25, unit * 0.55, unit * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + unit * 0.45, y - unit * 0.55, unit * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + unit * 0.65, y - unit * 0.65, unit * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + unit * 0.125, y, unit * 0.15, unit * 0.25);
    ctx.fillRect(x - unit * 0.3, y, unit * 0.15, unit * 0.25);
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(x + unit * 0.5, y - unit * 0.75, unit * 0.15, unit * 0.2);
}
function drawTree(ctx, x, y, unit) {
    ctx.fillStyle = '#2a1a3e';
    ctx.beginPath(); ctx.arc(x, y - unit * 0.45, unit * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - unit * 0.2, y - unit * 0.2, unit * 0.4, unit * 0.5);
    ctx.fillRect(x - unit * 0.25, y + unit * 0.25, unit * 0.15, unit * 0.3);
    ctx.fillRect(x + unit * 0.1, y + unit * 0.25, unit * 0.15, unit * 0.3);
}

/* =========================================================
   各场景绘制函数
   ========================================================= */
function drawCanvas1(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    H5Scal = ('ontouchstart' in window) ? 0.3 : 1;
    radioY = ('ontouchstart' in window) ? 0.98 : 1;
    H5PrintFont = ('ontouchstart' in window) ? 2.3 : 1;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0a2e'); bgGrad.addColorStop(0.5, '#1a1a4e'); bgGrad.addColorStop(1, '#2a1a3e');
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

    if (!canvas._stars) {
        canvas._stars = [];
        for (let i = 0; i < 200; i++) canvas._stars.push({
            xp: Math.random(), yp: Math.random() * 0.7,
            r: Math.random() * 2 + 0.5,
            alpha: Math.random(), twinkleSpeed: Math.random() * 0.02 + 0.005, twinkleDir: 1
        });
    }
    canvas._stars.forEach(s => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 1) s.twinkleDir = -1;
        if (s.alpha <= 0.2) s.twinkleDir = 1;
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.beginPath();
        ctx.arc(px(s.xp, W), py(s.yp, H), s.r, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#fffde7'; ctx.beginPath(); ctx.arc(px(0.8, W), py(0.15, H), ps(0.09), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0a2e'; ctx.beginPath(); ctx.arc(px(0.82, W), py(0.13, H), ps(0.08), 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#000'; ctx.fillRect(0, py(0.92, H), W, py(0.08, H));

    drawTable(ctx, px(0.03, W), py(0.9, H), ps(0.4), ps(0.06));
    drawTable(ctx, px(0.83, W), py(0.92, H), ps(0.4), ps(0.06));
    drawPerson(ctx, px(0.055, W), py(0.82, H), ps(0.05));
    drawPerson(ctx, px(0.85, W), py(0.84, H), ps(0.05));
    drawDog(ctx, px(0.48, W), py(0.9, H), ps(0.04));
    drawTree(ctx, px(0.15, W), py(0.88, H), ps(0.05));

    let r = 1 * H5Scal;
    drawImageSafe('svg/1.svg', W / 2 - 942 * r / 2, (H - 1032 * r + 150) * radioY, 942 * r, 1032 * r, ctx);
    drawImageSafe('svg/2.svg', 430 * r / 2 - 100, (H - 430 * r - 40) * radioY, 430 * r, 430 * r, ctx);
    drawImageSafe('svg/3.svg', W / 2 - 90 * r + (W / 2 - 90 * r) / 2, (H - 280 * r - 30) * radioY, 180 * r, 280 * r, ctx);
    drawImageSafe('svg/4.svg', W - 300 * r + 50, (H - 340 * r + 30) * radioY, 300 * r, 340 * r, ctx);

    const text = "I LOVE LJ,AI LI'On fear！", msPerChar = 300;
    if (!canvas._textIndex) canvas._textIndex = 0;
    if (!canvas._textTimer) canvas._textTimer = performance.now();
    canvas._textLength = text.length;
    if (canvas._textIndex < text.length) {
        const elapsed = performance.now() - canvas._textTimer;
        if (elapsed >= (canvas._textIndex + 1) * msPerChar) canvas._textIndex++;
    }
    typewriterDraw(ctx, text, canvas._textIndex, W, H, W * 0.09, H * 0.25, 0.3,
        i => (i === 0 || i === 1 || i === 2 ? transSize(0.3, W) : i === 12 || i === 13 || i === 14 || i === 15 || i === 16 ? transSize(0.3, W) : i === text.length - 1 ? transSize(0.2, W) : transSize(0.164, W)),
        i => (i === 0 || i === 1 || i === 2 ? { x: 0, y: transPosition(-1.6, W) } : i === 12 || i === 13 || i === 14 || i === 15 || i === 16 ? { x: 0, y: transPosition(-2.9, W) } : i === text.length - 1 ? { x: 0, y: transPosition(-0.24, W) } : { x: 0, y: 0 }));
}

function drawCanvas2(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const SCALE = 0.38;
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#2a1a1a'); grad.addColorStop(0.5, '#2a1a1f'); grad.addColorStop(1, '#2a1a22');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['🍳','🥘','🍲','🥟','🥢','🥄','🔪','🍽️','🥣','🍚','锅','碗','瓢','盆','筷','勺','铲','灶','炉','煲','米','油','盐','酱','醋','茶','面','菜','肉','汤','📺','📻','📞','☎️','🛋️','💡','🪑','📰','🖼️','🚪','电视','电话','沙发','茶几','台灯','遥控','空调','窗帘','地毯','时钟','花瓶','相框','书架','报纸','🌸','🌺','🌻','🌹','🌷','🌼','💐','🥀','🌾','🌿','康乃馨','玫瑰','百合','菊花','牡丹','荷花','梅花','兰花','桃花','杏花','茉莉','桂花','水仙','杜鹃','月季','🏠','🏡','👨','👩','👧','👦','👶','👴','👵','❤️','💕','💗','💖','💝','💞','💓','🫶','爸','妈','儿','女','家','爱','暖','归','盼','等'], { count: 170, sizeMin: 7, sizeMax: 20 });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.15, alphaMax: 0.7,
        fontFamily: "'Microsoft YaHei',serif",
        color: p => `rgba(255,200,180,${p.alpha * 0.55})`
    });

    const size = Math.min(W, H) * SCALE, cx = W * 0.5, cy = H * 0.4;
    initStaticPoints(canvas, '_flowerPoints', function (push) {
        const ps2 = ['❤️','💕','💗','💖','💝','家','爱','暖','妈','爸','归','盼'];
        for (let l = 0; l < 5; l++) {
            const lr = size * (0.35 + l * 0.15), pt = 8 + l * 3;
            for (let i = 0; i < pt; i++) {
                const a = (Math.PI * 2 * i) / pt + l * 0.2, d = lr + Math.sin(i * 3) * size * 0.06;
                push({ xp: (cx + Math.cos(a) * d) / W, yp: (cy + Math.sin(a) * d) / H, text: ps2[(i + l * 3) % ps2.length] });
            }
        }
        const cs = ['🌺','康乃馨','🏠','❤️','💗'];
        for (let i = 0; i < 12; i++) {
            const a = (Math.PI * 2 * i) / 12, d = size * 0.12 + Math.random() * size * 0.08;
            push({ xp: (cx + Math.cos(a) * d) / W, yp: (cy + Math.sin(a) * d) / H, text: cs[i % cs.length] });
        }
        const ss = ['🌸','🌿','🌾','💚'];
        for (let i = 0; i < 8; i++) push({ xp: (cx - size * 0.3 + (size * 0.6 * i) / 7) / W, yp: (cy + size * 0.7 + Math.abs(i - 3.5) * size * 0.1) / H, text: ss[i % 4] });
        const sts = ['🌿','🌾','💚','家','爱','根'];
        for (let i = 0; i < 12; i++) push({ xp: (cx + Math.sin(i * 0.3) * 6) / W, yp: (cy + size * 0.78 + i * (H * 0.35 / 11)) / H, text: sts[i % 6] });
        for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 6; i++) push({ xp: (cx + s * (size * 0.2 + i * 4)) / W, yp: (cy + size * 0.85 + i * 10) / H, text: s === -1 ? '🍃' : '🌿' });
        const pts = ['锅','碗','瓢','盆','🍳','🥘','🍲','🥣'];
        for (let r = 0; r < 4; r++) {
            const pw = size * 0.5 + r * size * 0.05, py2 = cy + size * 1.05 + r * 8, cnt = 8 + r;
            for (let i = 0; i < cnt; i++) push({ xp: (cx - pw + (pw * 2 * i) / (cnt - 1)) / W, yp: py2 / H, text: pts[(i + r * 2) % pts.length] });
        }
    });
    drawStaticPoints(ctx, W, H, canvas._flowerPoints, {
        boldCount: 15,
        boldFont: 18, normalFont: 13,
        fontFamily: "'Microsoft YaHei',serif",
        boldColor: 'rgba(255,190,170,0.95)',
        normalColor: 'rgba(240,170,150,0.75)'
    });
    drawCaption(ctx, W, H, '家是港湾，爱是归途', 'rgba(255,200,180,0.8)', '#f5d0c0');
}

function drawCanvas3(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const SCALE = 0.38;
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#0a1a2e'); grad.addColorStop(0.5, '#0a1a35'); grad.addColorStop(1, '#0a1a3a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['🎒','📚','📖','📝','✏️','📏','📐','✂️','🖊️','📓','书包','课本','作业','考试','试卷','铅笔','橡皮','尺子','上课','下课','自习','晨读','晚修','早操','课间','同桌','语文','数学','英语','物理','化学','生物','历史','地理','黑板','讲台','粉笔','课桌','操场','🍔','🍕','🍜','🍻','🥤','🍚','🍗','🍖','🍺','🍵','吃饭','食堂','泡面','火锅','撸串','喝酒','干杯','🎮','🎯','🎱','🎳','🀄','♠️','🎪','🎤','🎧','🎸','开黑','通宵','网吧','游戏','王者','吃鸡','篮球','足球','乒乓','羽毛','跑步','游泳','兄弟','哥们','闺蜜','死党','老铁','同窗','室友','校友','牵手','并肩','陪伴','温暖','信任','支持','懂你','默契','🏫','🚌','🚲','🚶','🏃','校车','单车','宿舍','教室','图书馆','军训','运动会','毕业','散伙饭','合影','😂','😭','😡','😤','🥰','😎','哭过','笑过','闹过','想过','念过'], { count: 180, sizeMin: 7, sizeMax: 19 });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.12, alphaMax: 0.7,
        color: p => `rgba(150,200,240,${p.alpha * 0.55})`
    });

    const size = Math.min(W, H) * SCALE;
    ctx.font = `${size * 0.8}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🤝', px(0.5, W), py(0.42, H));
    drawCaption(ctx, W, H, '一起走过的路，比终点更珍贵', 'rgba(180,210,240,0.8)', '#c8ddf0');
}

function drawCanvas4(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const SCALE = 0.6;
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#f5f0e8'); grad.addColorStop(0.5, '#ede4d3'); grad.addColorStop(1, '#f5f0e8');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['♩','♪','♫','♬','♭','♯','🎵','🎶','🎼','🎨','🖌️','🎭','🎪','🎬','🎤','🎧','🎷','🎸','♠','♣','♥','♦','●','▲','■','◆','★','☆','○','□','△','◇','莫奈','梵高','毕加索','达芬奇','C','D','E','F','G','A','B','do','re','mi','fa','sol','la','si','油画','水墨','素描','雕塑','建筑','舞蹈','戏剧','巴洛克','印象派','抽象','写实','浪漫'], { count: 140, sizeMin: 8, sizeMax: 22 });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.08, alphaMax: 0.5,
        fontFamily: "'Georgia',serif",
        color: p => `rgba(40,30,20,${p.alpha})`
    });

    const size = Math.min(W, H) * SCALE, cx = W * 0.48, cy = H * 0.38;
    initStaticPoints(canvas, '_notePoints', function (push) {
        const hs = ['do','C','♫','🎵','道','音','乐','♪'];
        for (let i = 0; i < 25; i++) {
            const a = (Math.PI * 2 * i) / 25;
            push({ xp: (cx + Math.cos(a) * size * 0.35) / W, yp: (cy + size * 0.2 + Math.sin(a) * size * 0.25) / H, text: hs[i % 8] });
        }
        for (let i = 0; i < 12; i++) push({ xp: (cx - size * 0.2 + (size * 0.4 * i) / 11) / W, yp: (cy + size * 0.15 + Math.random() * size * 0.1) / H, text: ['do','♫','🎵','♪'][i % 4] });
        const ss = ['|','♪','♩','♬','🎶','♭','♯','🎼'];
        for (let i = 0; i < 25; i++) push({ xp: (cx + size * 0.32) / W, yp: (cy - size * 0.4 + (size * 1.1 * i) / 24) / H, text: ss[i % 8] });
        for (let i = 0; i < 15; i++) {
            const t = i / 14;
            push({ xp: (cx + size * 0.32 + t * size * 0.4) / W, yp: (cy - size * 0.4 + t * size * 0.25 + Math.sin(t * Math.PI) * size * 0.15) / H, text: ['♪','♫','🎵','♬','♩','♭'][i % 6] });
        }
        for (let i = 0; i < 12; i++) {
            const t = i / 11;
            push({ xp: (cx + size * 0.32 + t * size * 0.32) / W, yp: (cy - size * 0.3 + t * size * 0.2 + Math.sin(t * Math.PI) * size * 0.1) / H, text: ['♪','♫','🎵'][i % 3] });
        }
        for (let l = 0; l < 5; l++) for (let i = 0; i < 18; i++) push({ xp: (cx - size * 0.45 + (size * 1.2 * i) / 17) / W, yp: (cy + size * 0.35 + l * size * 0.1) / H, text: '—' });
    });
    drawStaticPoints(ctx, W, H, canvas._notePoints, {
        boldCount: 15,
        boldFont: 18, normalFont: 13,
        fontFamily: "'Georgia',serif",
        boldColor: 'rgba(30,20,10,0.95)',
        normalColor: 'rgba(50,35,20,0.8)'
    });
    drawCaption(ctx, W, H, 'Every stroke tells a love story', 'rgba(40,30,20,0.8)', '#2a1a0a');
}

function drawCanvas5(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const SCALE = 0.38;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a1a1a'); grad.addColorStop(1, '#0a2a3a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['0','1','10','11','100','101','110','111','0000','0001','0010','0011','0100','0101','0110','0111','0o7','0o10','0o17','0o20','0o77','0o377','0o777','0','1','2','3','4','5','6','7','8','9','10','100','255','1024','65535','0x0','0x1','0xA','0xF','0xFF','0xFFFF','0xDEAD','0xBEEF','0xCAFE','0xFEED','A','B','C','D','E','F','if','for','int','var','let','const','func','class','void','return','break','true','false','null','&&','||','<<','>>','&','|','^','~','HTTP','TCP','IP','DNS','SSL','API','JSON','XML','SQL','CPU','RAM','SSD','GPU','BIOS','OS','VM','Docker','Linux','Unix','Windows','Android','iOS','C','C++','Java','Python','Rust','Go','JS','TS','PHP','HTML','CSS','React','Vue','Node','Git','SSH'], { count: 160, sizeMin: 7, sizeMax: 18 });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.1, alphaMax: 0.85,
        fontFamily: "'Courier New',monospace",
        color: p => {
            const ih = /^0x/.test(p.text) || /^[A-F]$/.test(p.text);
            const ib = /^[01]+$/.test(p.text) && p.text.length >= 3;
            return `rgba(${ih ? 100 : ib ? 80 : 120},${ih ? 255 : ib ? 220 : 200},${ih ? 120 : ib ? 160 : 255},${p.alpha})`;
        }
    });

    const size = Math.min(W, H) * SCALE, cx = W * 0.5, cy = H * 0.4, dh = size * 1.3, dw = size * 0.4;
    initStaticPoints(canvas, '_dnaPoints', function (push) {
        const dws = ['A','T','G','C','0','1','0x','if','for','func','CPU','RAM','API','{ }','//','git','T','A','C','G','1','0','xFF','while','int','var','let','SQL','SSH','>>'];
        for (let i = 0; i < 35; i++) {
            const t = i / 34, y = cy - dh / 2 + t * dh, a = t * Math.PI * 4;
            push({ xp: (cx - Math.cos(a) * dw) / W, yp: y / H, text: dws[i % dws.length] });
            push({ xp: (cx + Math.cos(a) * dw) / W, yp: y / H, text: dws[(i + 15) % dws.length] });
        }
        for (let i = 0; i < 18; i++) {
            const t = i / 17, y = cy - dh / 2 + t * dh, a = t * Math.PI * 4, x1 = cx - Math.cos(a) * dw, x2 = cx + Math.cos(a) * dw;
            push({ xp: (x1 + x2) / 2 / W, yp: y / H, text: '|' });
        }
    });
    drawStaticPoints(ctx, W, H, canvas._dnaPoints, {
        boldCount: 20,
        boldFont: 14, normalFont: 11,
        fontFamily: "'Courier New',monospace",
        boldColor: 'rgba(100,255,180,0.9)',
        normalColor: 'rgba(80,220,150,0.65)'
    });
    drawCaption(ctx, W, H, 'while(life){love++;}', '#fff', '#fff');
}

function drawCanvas6(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a1628'); grad.addColorStop(1, '#1a2a4a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['+','-','×','÷','=','±','√','²','³','π','∞','≈','≠','≤','≥','∠','°','%','∑','∫','∂','∇','∈','⊆','∪','∩','∅','∀','∃','⇒','⇔','∧','∨','¬','lim','log','sin','cos','tan','α','β','γ','δ','ε','θ','λ','μ','σ','φ','ω','Γ','Δ','Θ','Λ','Π','Σ','Φ','Ψ','Ω','dx','dy','f(x)','→∞','||','⌊⌋','⌈⌉','1','2','3','4','5','6','7','8','9','0','⅓','⅔','⅛','⅜','⅝','⅞'], { count: 150, sizeMin: 8, sizeMax: 22, useSymbol: true });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.15, alphaMax: 0.9,
        fontFamily: "'Courier New',monospace",
        color: p => `rgba(100,180,255,${p.alpha})`
    });

    const bs = ['∑','∫','π','∞','√','Δ','α','β','θ','λ','σ','Ω','f(x)','dx'], cx = W * 0.5, cy = H * 0.42, bw = W * 0.55, bh = H * 0.45;
    initStaticPoints(canvas, '_brainPoints', function (push) {
        for (let i = 0; i < 35; i++) {
            const a = Math.PI * 0.7 + (Math.PI * 1.6 * i / 34);
            push({ xp: (cx - bw * 0.12 + Math.cos(a) * bw * 0.48) / W, yp: (cy + Math.sin(a) * bh * 0.5) / H, symbol: bs[Math.floor(Math.random() * bs.length)] });
        }
        for (let i = 0; i < 35; i++) {
            const a = -Math.PI * 0.1 + (Math.PI * 1.6 * i / 34);
            push({ xp: (cx + bw * 0.12 + Math.cos(a) * bw * 0.48) / W, yp: (cy + Math.sin(a) * bh * 0.5) / H, symbol: bs[Math.floor(Math.random() * bs.length)] });
        }
        for (let i = 0; i < 8; i++) push({ xp: (cx - 15 + i * 4) / W, yp: (cy - 10 + Math.sin(i) * 8) / H, symbol: '=' });
        for (let i = 0; i < 10; i++) push({ xp: (cx - 6 + Math.sin(i * 0.8) * 8) / W, yp: (cy + bh * 0.5 + i * 10) / H, symbol: '|' });
    });
    drawStaticPoints(ctx, W, H, canvas._brainPoints, {
        boldCount: 12,
        boldFont: 22, normalFont: 16,
        fontFamily: "'Georgia',serif",
        boldColor: 'rgba(255,220,100,0.95)',
        normalColor: 'rgba(255,200,80,0.8)',
        getText: p => p.symbol
    });
    drawCaption(ctx, W, H, 'r = a(1 - sinθ)', '#fff', '#fff');
}

function drawCanvas7(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const SCALE = 0.38;
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#1a0a2e'); grad.addColorStop(0.5, '#1a0a35'); grad.addColorStop(1, '#1a0a3a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['a','an','the','is','are','was','were','be','been','have','has','had','do','does','did','will','would','can','could','shall','should','may','might','I','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their','this','that','these','those','who','whom','whose','which','what','when','where','why','how','and','but','or','so','if','because','although','while','since','until','in','on','at','to','for','from','with','by','about','into','through','love','hope','dream','light','star','moon','wind','rain','fire','snow','hello','world','good','bad','big','small','old','new','high','low','day','night','time','year','life','hand','eye','mind','heart','soul','read','write','speak','listen','learn','teach','think','know','feel','grow'], { count: 130, sizeMin: 8, sizeMax: 20 });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.12, alphaMax: 0.7,
        fontFamily: "'Georgia',serif",
        color: p => `rgba(180,160,255,${p.alpha * 0.55})`
    });

    const size = Math.min(W, H) * SCALE, cx = W * 0.5, cy = H * 0.42, lh = size * 0.75, lw = size * 0.55;
    initStaticPoints(canvas, '_ljPoints', function (push) {
        const lws = ['Love','Joy','Life','Laugh','Learn','Light','Luck','Loyal','Justice','Journey','Jazz','Jump','Join','Joke','Jewel','Lemon','Lake','Lion','Lily','Lotus'];
        const lx = cx - lw * 0.65, ly = cy - lh / 2;
        for (let i = 0; i < 10; i++) push({ xp: (lx - lw * 0.38) / W, yp: (ly + i * lh / 9) / H, text: lws[i % lws.length] });
        push({ xp: (lx - lw * 0.38) / W, yp: (ly + lh) / H, text: lws[5] });
        push({ xp: (lx + lw * 0.07) / W, yp: (ly + lh) / H, text: lws[6] });
        push({ xp: (lx + lw * 0.5) / W, yp: (ly + lh) / H, text: lws[7] });
        const jx = cx + lw * 0.65, jy = ly;
        push({ xp: (jx - lw * 0.35) / W, yp: jy / H, text: lws[10] });
        push({ xp: (jx + lw * 0.05) / W, yp: jy / H, text: lws[11] });
        push({ xp: (jx + lw * 0.45) / W, yp: jy / H, text: lws[12] });
        for (let i = 0; i < 8; i++) push({ xp: (jx + lw * 0.3) / W, yp: (jy + i * lh * 0.7 / 7) / H, text: lws[i % lws.length] });
        for (let i = 0; i < 3; i++) {
            const a = Math.PI * 0.05 + Math.PI * 0.85 * i / 2;
            push({ xp: (jx + lw * 0.24 + Math.cos(a) * lw * 0.3) / W, yp: (jy + lh * 0.7 + Math.sin(a) * lh * 0.24) / H, text: lws[(i + 15) % lws.length] });
        }
    });
    // 这个有左右两色区分，不用通用 drawStaticPoints，保留自定义
    canvas._ljPoints.forEach((p, i) => {
        const iL = i < 13, ic = (iL && i < 6) || (!iL && i >= 13 && i < 17);
        ctx.fillStyle = iL ? (ic ? 'rgba(255,200,80,0.95)' : 'rgba(255,170,60,0.6)') : (ic ? 'rgba(100,220,255,0.9)' : 'rgba(80,200,240,0.55)');
        ctx.font = `bold ${ic ? 16 : 13}px 'Georgia',serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, px(p.xp, W), py(p.yp, H));
    });
    drawCaption(ctx, W, H, 'You are my everything', 'rgba(200,180,255,0.8)', '#d0c8f0');
}

function drawCanvas8(canvas) {
    const {ctx, W, H} = setupCanvas(canvas);
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(0.5, '#16213e'); grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    initParticles(canvas, '_particles', ['🧠','💭','💬','🗣️','👁️','👂','🤝','💔','❤️‍🩹','🌱','自我','本我','超我','意识','潜意识','梦境','记忆','情绪','焦虑','抑郁','压力','创伤','疗愈','成长','认知','行为','人格','性格','内向','外向','共情','依恋','安全感','边界','MBTI','九型','大五','DSM','CBT','ACT','正念','冥想','弗洛伊德','荣格','阿德勒','马斯洛','罗杰斯','皮亚杰','需求','动机','冲突','防御','投射','移情','阻抗','释梦','爱','恨','喜','怒','哀','惧','耻','罪'], { count: 160, sizeMin: 7, sizeMax: 19 });
    drawParticles(ctx, W, H, canvas._particles, {
        alphaMin: 0.1, alphaMax: 0.75,
        color: p => `rgba(180,160,220,${p.alpha * 0.6})`
    });

    const size = Math.min(W, H) * 0.35, cx = W * 0.5, cy = H * 0.42;
    const bs = ['自我','本我','超我','意识','潜意识','记忆','情绪','人格','认知','行为','共情','依恋','正念','成长'];
    initStaticPoints(canvas, '_brainPoints', function (push) {
        for (let i = 0; i < 30; i++) {
            const a = Math.PI * 0.65 + (Math.PI * 1.7 * i / 29);
            push({ xp: (cx - size * 0.1 + Math.cos(a) * size * 0.5) / W, yp: (cy + Math.sin(a) * size * 0.5) / H, text: bs[Math.floor(Math.random() * bs.length)] });
        }
        for (let i = 0; i < 30; i++) {
            const a = -Math.PI * 0.05 + (Math.PI * 1.7 * i / 29);
            push({ xp: (cx + size * 0.1 + Math.cos(a) * size * 0.5) / W, yp: (cy + Math.sin(a) * size * 0.5) / H, text: bs[Math.floor(Math.random() * bs.length)] });
        }
        for (let i = 0; i < 8; i++) push({ xp: (cx - 12 + i * 3.5) / W, yp: (cy - 5 + Math.sin(i) * 5) / H, text: '🧠' });
        const sts = ['需求','动机','冲突','防御','投射','移情','疗愈','成长','爱','恨'];
        for (let i = 0; i < 10; i++) push({ xp: (cx - 5 + Math.sin(i * 0.7) * 6) / W, yp: (cy + size * 0.5 + i * 10) / H, text: sts[i] });
    });
    drawStaticPoints(ctx, W, H, canvas._brainPoints, {
        boldCount: 12,
        boldFont: 16, normalFont: 12,
        fontFamily: "'Microsoft YaHei',serif",
        boldColor: 'rgba(200,180,255,0.9)',
        normalColor: 'rgba(170,150,230,0.7)'
    });
    drawCaption(ctx, W, H, '梦的解析', 'rgba(200,180,240,0.8)', '#c8c0e8');
}

function drawCanvas9(canvas) {
    const { ctx, W, H } = setupCanvas(canvas);
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, '#0a0a1a'); grad.addColorStop(0.5, '#0f1a2e'); grad.addColorStop(1, '#1a0a2a');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    const symbols = ['⬡', '⊕', '⊖', '⊗', '⊘', '⊙', '⊚', '⊛', '⊝', '◈', '◇', '◆', '⬟', '⟐', '⨁', '⨂', '☯', '⚛'];
    initParticles(canvas, '_sym', symbols, { count: 80, sizeMin: 10, sizeMax: 28, useSymbol: true, speedMin: 0.003, speedMax: 0.011 });
    drawParticles(ctx, W, H, canvas._sym, {
        alphaMin: 0.1, alphaMax: 0.5,
        fontFamily: "'Georgia', serif",
        color: p => `rgba(120, 200, 255, ${p.alpha})`
    });

    ctx.fillStyle = '#c8e0ff';
    ctx.font = `bold ${Math.min(W * 0.08, 48)}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('⬡ 对合协议', W / 2, py(0.38, H));

    ctx.fillStyle = '#8899bb';
    ctx.font = `${Math.min(W * 0.025, 18)}px 'Georgia', serif`;
    ctx.fillText('输入任意文本 · 观察规则的闭合过程', W / 2, py(0.48, H));

    const btnW = Math.min(W * 0.3, 160), btnH = 44, btnX = W / 2 - btnW / 2, btnY = py(0.56, H), r = btnH / 2;
    ctx.fillStyle = '#2a2a4a';
    ctx.shadowColor = 'rgba(100, 180, 255, 0.2)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(btnX + r, btnY);
    ctx.arcTo(btnX + btnW, btnY, btnX + btnW, btnY + btnH, r);
    ctx.arcTo(btnX + btnW, btnY + btnH, btnX, btnY + btnH, r);
    ctx.arcTo(btnX, btnY + btnH, btnX, btnY, r);
    ctx.arcTo(btnX, btnY, btnX + btnW, btnY, r);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#c8e0ff';
    ctx.font = `bold ${Math.min(W * 0.022, 16)}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('查看演示 →', W / 2, btnY + btnH * 0.65);

    ctx.fillStyle = '#445566';
    ctx.font = `${Math.min(W * 0.018, 12)}px 'Georgia', serif`;
    ctx.textAlign = 'center';
    ctx.fillText('密码学 · 启蒙演示', W / 2, py(0.88, H));
}

/* =========================================================
   ★ 封装 6：统一场景分发
   ========================================================= */
const SCENE_DRAWERS = {
    canvas1: drawCanvas1,
    canvas2: drawCanvas2,
    canvas3: drawCanvas3,
    canvas4: drawCanvas4,
    canvas5: drawCanvas5,
    canvas6: drawCanvas6,
    canvas7: drawCanvas7,
    canvas8: drawCanvas8,
    canvas9: drawCanvas9
};
function drawScene(canvas) {
    const fn = SCENE_DRAWERS[canvas.id];
    if (fn) fn(canvas);
}

/* =========================================================
   动画主循环（无需 resize 监听）
   ========================================================= */
function animate() {
    const ac = document.querySelector('.slide.active canvas');
    if (ac) drawScene(ac);
    requestAnimationFrame(animate);
}
animate();

/* =========================================================
   点击跳转
   ========================================================= */
function canvasClickFun() {
    if (current === 5) {
        const l = document.createElement('a');
        l.href = './nestedInvolutionRingHuge.html';
        l.target = '_self';
        l.rel = 'noopener noreferrer';
        document.body.appendChild(l);
        l.click();
        document.body.removeChild(l);
    } else if (current === 8) {
        const l = document.createElement('a');
        l.href = './panding.html';
        l.target = '_self';
        l.rel = 'noopener noreferrer';
        document.body.appendChild(l);
        l.click();
        document.body.removeChild(l);
    }
}

/* 初始化非 active 的 canvas 一次，避免切到空白 */
function initCanvas() {
    Object.keys(SCENE_DRAWERS).forEach(id => {
        const el = document.getElementById(id);
        if (el) drawScene(el);
    });
}
initCanvas();

function redrawAllCanvas() {
    requestAnimationFrame(function() {
        const ac = document.querySelector('.slide.active canvas');
        if (ac) drawScene(ac);
    });
}

/* =========================================================
   dinoBar 首次加载联动
   ========================================================= */
function callUpdateSliderHeight() {
    if (typeof updateSliderHeight !== 'function') return;
    if (!document.getElementById('dinoBar')) {
        let tries = 0;
        const timer = setInterval(function() {
            tries++;
            if (document.getElementById('dinoBar')) {
                clearInterval(timer);
                updateSliderHeight();
            } else if (tries > 60) {
                clearInterval(timer);
            }
        }, 50);
        return;
    }
    updateSliderHeight();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callUpdateSliderHeight);
} else {
    callUpdateSliderHeight();
}
window.addEventListener('load', callUpdateSliderHeight);