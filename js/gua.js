// ==================== 64 卦数据 ====================
    const GUA = [
      { n: 1,  name: '乾',   sym: '䷀', lines: [1,1,1,1,1,1] },
      { n: 2,  name: '坤',   sym: '䷁', lines: [0,0,0,0,0,0] },
      { n: 3,  name: '屯',   sym: '䷂', lines: [1,0,0,0,1,0] },
      { n: 4,  name: '蒙',   sym: '䷃', lines: [0,1,0,0,0,1] },
      { n: 5,  name: '需',   sym: '䷄', lines: [1,1,1,0,1,0] },
      { n: 6,  name: '讼',   sym: '䷅', lines: [0,1,0,1,1,1] },
      { n: 7,  name: '师',   sym: '䷆', lines: [0,1,0,0,0,0] },
      { n: 8,  name: '比',   sym: '䷇', lines: [0,0,0,0,1,0] },
      { n: 9,  name: '小畜', sym: '䷈', lines: [1,1,1,0,1,1] },
      { n: 10, name: '履',   sym: '䷉', lines: [1,1,0,1,1,1] },
      { n: 11, name: '泰',   sym: '䷊', lines: [1,1,1,0,0,0] },
      { n: 12, name: '否',   sym: '䷋', lines: [0,0,0,1,1,1] },
      { n: 13, name: '同人', sym: '䷌', lines: [1,0,1,1,1,1] },
      { n: 14, name: '大有', sym: '䷍', lines: [1,1,1,1,0,1] },
      { n: 15, name: '谦',   sym: '䷎', lines: [0,0,1,0,0,0] },
      { n: 16, name: '豫',   sym: '䷏', lines: [0,0,0,1,0,0] },
      { n: 17, name: '随',   sym: '䷐', lines: [1,0,0,1,1,0] },
      { n: 18, name: '蛊',   sym: '䷑', lines: [0,1,1,0,0,1] },
      { n: 19, name: '临',   sym: '䷒', lines: [1,1,0,0,0,0] },
      { n: 20, name: '观',   sym: '䷓', lines: [0,0,0,0,1,1] },
      { n: 21, name: '噬嗑', sym: '䷔', lines: [1,0,0,1,0,1] },
      { n: 22, name: '贲',   sym: '䷕', lines: [1,0,1,0,0,1] },
      { n: 23, name: '剥',   sym: '䷖', lines: [0,0,0,0,0,1] },
      { n: 24, name: '复',   sym: '䷗', lines: [1,0,0,0,0,0] },
      { n: 25, name: '无妄', sym: '䷘', lines: [1,0,0,1,1,1] },
      { n: 26, name: '大畜', sym: '䷙', lines: [1,1,1,0,0,1] },
      { n: 27, name: '颐',   sym: '䷚', lines: [1,0,0,0,0,1] },
      { n: 28, name: '大过', sym: '䷛', lines: [0,1,1,1,1,0] },
      { n: 29, name: '坎',   sym: '䷜', lines: [0,1,0,0,1,0] },
      { n: 30, name: '离',   sym: '䷝', lines: [1,0,1,1,0,1] },
      { n: 31, name: '咸',   sym: '䷞', lines: [0,0,1,1,1,0] },
      { n: 32, name: '恒',   sym: '䷟', lines: [0,1,1,1,0,0] },
      { n: 33, name: '遁',   sym: '䷠', lines: [0,0,1,1,1,1] },
      { n: 34, name: '大壮', sym: '䷡', lines: [1,1,1,1,0,0] },
      { n: 35, name: '晋',   sym: '䷢', lines: [0,0,0,1,0,1] },
      { n: 36, name: '明夷', sym: '䷣', lines: [1,0,1,0,0,0] },
      { n: 37, name: '家人', sym: '䷤', lines: [1,0,1,0,1,1] },
      { n: 38, name: '睽',   sym: '䷥', lines: [1,1,0,1,0,1] },
      { n: 39, name: '蹇',   sym: '䷦', lines: [0,0,1,0,1,0] },
      { n: 40, name: '解',   sym: '䷧', lines: [0,1,0,1,1,0] },
      { n: 41, name: '损',   sym: '䷨', lines: [1,1,0,0,0,1] },
      { n: 42, name: '益',   sym: '䷩', lines: [1,0,0,0,1,1] },
      { n: 43, name: '夬',   sym: '䷪', lines: [1,1,1,1,1,0] },
      { n: 44, name: '姤',   sym: '䷫', lines: [0,1,1,1,1,1] },
      { n: 45, name: '萃',   sym: '䷬', lines: [0,0,0,1,1,0] },
      { n: 46, name: '升',   sym: '䷭', lines: [1,1,0,0,1,0] },
      { n: 47, name: '困',   sym: '䷮', lines: [0,1,0,1,1,0] },
      { n: 48, name: '井',   sym: '䷯', lines: [0,1,1,0,1,0] },
      { n: 49, name: '革',   sym: '䷰', lines: [1,0,1,1,1,0] },
      { n: 50, name: '鼎',   sym: '䷱', lines: [0,1,1,1,0,1] },
      { n: 51, name: '震',   sym: '䷲', lines: [1,0,0,1,0,0] },
      { n: 52, name: '艮',   sym: '䷳', lines: [0,0,1,0,0,1] },
      { n: 53, name: '渐',   sym: '䷴', lines: [0,0,1,0,1,1] },
      { n: 54, name: '归妹', sym: '䷵', lines: [1,1,0,1,0,0] },
      { n: 55, name: '丰',   sym: '䷶', lines: [1,0,1,1,0,0] },
      { n: 56, name: '旅',   sym: '䷷', lines: [0,0,1,1,0,1] },
      { n: 57, name: '巽',   sym: '䷸', lines: [0,1,1,0,1,1] },
      { n: 58, name: '兑',   sym: '䷹', lines: [1,1,0,1,1,0] },
      { n: 59, name: '涣',   sym: '䷺', lines: [0,1,0,0,1,1] },
      { n: 60, name: '节',   sym: '䷻', lines: [1,1,0,0,1,0] },
      { n: 61, name: '中孚', sym: '䷼', lines: [1,1,0,0,1,1] },
      { n: 62, name: '小过', sym: '䷽', lines: [0,0,1,1,0,0] },
      { n: 63, name: '既济', sym: '䷾', lines: [1,0,1,0,1,0] },
      { n: 64, name: '未济', sym: '䷿', lines: [0,1,0,1,0,1] },
    ];

    const NOW_TEXT = {
      '000': '在等 · 静观其变',
      '001': '在起步 · 刚有苗头',
      '010': '在犹豫 · 进退两难',
      '011': '在推进 · 稳步向前',
      '100': '在收尾 · 准备交棒',
      '101': '在调整 · 方向微调',
      '110': '在冲刺 · 加把劲',
      '111': '在顶点 · 如日中天',
    };

    const FUTURE_TEXT = {
      '000': '归于沉寂 · 守成',
      '001': '慢慢起来 · 蓄势',
      '010': '先有波折 · 后顺',
      '011': '渐入佳境 · 可期',
      '100': '由盛转平 · 收敛',
      '101': '反复来回 · 波动',
      '110': '再上一层 · 突破',
      '111': '走向高峰 · 极盛',
    };

    const STORAGE_KEY = 'guaDrawnPool';

    function getDrawn() {
      try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (!s) return [];
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return []; }
    }
    function setDrawn(arr) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
    }

    function buildSticks() {
      const wrap = document.getElementById('guaSticks');
      if (!wrap) return;
      wrap.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const s = document.createElement('div');
        s.className = 'gua-stick-head';
        s.style.left = (i * 8) + 'px';
        s.style.height = (24 + Math.random() * 12) + 'px';
        s.style.transform = 'rotate(' + (-6 + Math.random() * 12) + 'deg)';
        s.style.transformOrigin = 'bottom center';
        wrap.appendChild(s);
      }
    }

    let isAnimating = false;

    function springShake(el, duration, cb) {
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const damp = Math.pow(1 - t, 1.5);
        const angle = Math.sin(t * Math.PI * 10) * 5 * damp;
        el.style.transform = 'translateX(-50%) rotate(' + angle + 'deg)';
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          el.style.transform = 'translateX(-50%) rotate(0deg)';
          if (cb) cb();
        }
      }
      requestAnimationFrame(step);
    }

    function drawOne() {
      if (isAnimating) return;

      let drawn = getDrawn();
      if (drawn.length >= 64) { drawn = []; setDrawn(drawn); }
      const pool = GUA.filter(g => drawn.indexOf(g.n) === -1);
      const picked = pool[Math.floor(Math.random() * pool.length)];

      isAnimating = true;

      const card = document.getElementById('guaCard');
      card.classList.remove('show');

      const tube = document.getElementById('guaTube');

      springShake(tube, 700, function() {
        launchStick(picked);
      });
    }

    function launchStick(picked) {
      const falling = document.getElementById('guaFalling');
      const stage = document.getElementById('guaStage');
      const stageW = stage.offsetWidth;

      const startX = stageW / 2 - 18;
      const startBottom = 70 + 160 - 30;

      falling.style.transition = 'none';
      falling.style.left = startX + 'px';
      falling.style.bottom = startBottom + 'px';
      falling.style.opacity = '1';
      falling.style.transform = 'rotate(0deg)';

      const direction = Math.random() > 0.5 ? 1 : -1;
      const targetX = startX + direction * (100 + Math.random() * 80);
      const targetBottom = 70 + 8;

      const duration = 750;
      const startTime = performance.now();

      function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const ease = t * t;
        const x = startX + (targetX - startX) * t;
        const arc = Math.sin(t * Math.PI) * 30;
        const bottom = startBottom + (targetBottom - startBottom) * ease + arc;
        const rot = direction * t * 110;

        falling.style.left = x + 'px';
        falling.style.bottom = bottom + 'px';
        falling.style.transform = 'rotate(' + rot + 'deg)';

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          settleStick(picked, falling);
        }
      }
      requestAnimationFrame(step);
    }

    function settleStick(g, falling) {
      setTimeout(function() {
        showCard(g);
        falling.style.transition = 'opacity 0.5s ease';
        falling.style.opacity = '0';
        setTimeout(function() {
          isAnimating = false;
        }, 500);
      }, 350);
    }

    function showCard(g) {
      const lines = g.lines;
      let symbolText = '';
      for (let i = lines.length - 1; i >= 0; i--) {
        symbolText += (lines[i] === 1 ? '━━━━━━━' : '━━━ ━ ━') + '\n';
      }
      const nowKey = '' + lines[0] + lines[1] + lines[2];
      const futureKey = '' + lines[3] + lines[4] + lines[5];

      document.getElementById('gcName').textContent = '第 ' + g.n + ' 卦 · ' + g.name;
      document.getElementById('gcSym').textContent = g.sym;
      document.getElementById('gcLines').textContent = symbolText;
      document.getElementById('gcNow').textContent = '现在：' + (NOW_TEXT[nowKey] || '—');
      document.getElementById('gcFuture').textContent = '将来：' + (FUTURE_TEXT[futureKey] || '—');

      const card = document.getElementById('guaCard');
      requestAnimationFrame(function() {
        card.classList.add('show');
      });

      const drawn = getDrawn();
      drawn.push(g.n);
      setDrawn(drawn);
      document.getElementById('guaProgress').textContent = '已抽 ' + drawn.length + ' / 64';
    }

    function resetAll() {
      setDrawn([]);
      document.getElementById('guaProgress').textContent = '已抽 0 / 64';
      const card = document.getElementById('guaCard');
      card.classList.remove('show');
      const falling = document.getElementById('guaFalling');
      falling.style.opacity = '0';
    }

    function bind() {
      const btnDraw = document.getElementById('guaBtnDraw');
      const btnReset = document.getElementById('guaBtnReset');
      const tube = document.getElementById('guaTube');
      if (!btnDraw || !btnReset || !tube) {
        requestAnimationFrame(bind);
        return;
      }
      buildSticks();
      btnDraw.addEventListener('click', drawOne);
      btnReset.addEventListener('click', resetAll);
      tube.addEventListener('click', drawOne);

      const drawn = getDrawn();
      document.getElementById('guaProgress').textContent = '已抽 ' + drawn.length + ' / 64';
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bind);
    } else {
      bind();
    }