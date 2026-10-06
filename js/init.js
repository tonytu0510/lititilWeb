// ============================================================
// 全局版本号 —— 每次发布改这里
// ============================================================
window.APP_VERSION = '20261006-2209';

// ============================================================
// 以下是 init.js 原有逻辑
// ============================================================
(function () {
    const V = window.APP_VERSION || Date.now();

    // 动态加载 CSS
    function loadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href + '?v=' + V;
        document.head.appendChild(link);
    }

    // 动态加载 JS
    function loadJS(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src + '?v=' + V;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // 资源清单
    const CSS_LIST = [
        '/css/style.css'
    ];

    const JS_LIST = [
        '/js/common.js',
        '/js/dino-game.js'
    ];

    CSS_LIST.forEach(loadCSS);

    (async () => {
        for (const src of JS_LIST) {
            await loadJS(src);
        }
        console.log('[init] 全部资源加载完成，版本', V);
    })();
})();

// ============================================================
// init-loader：从 hidden.png 提取 init.js 并执行
// ============================================================
(async function () {
    // hidden.png 的版本号：用 Date.now()，每次刷新都拉最新
    const PNG_VERSION = Date.now();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/js/hidden.png?v=' + PNG_VERSION;  // ← 加版本号

    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    function readBytes(start, count) {
        const out = new Uint8Array(count);
        for (let i = 0; i < count * 8; i++) {
            const idx = start + i;
            // 只读 R、G、B，跳过 A
            const pixelIndex = Math.floor(idx / 3) * 4 + (idx % 3);
            const bit = data[pixelIndex] & 1;
            out[i >> 3] |= bit << (7 - (i & 7));
        }
        return out;
    }

    const header = readBytes(0, 4);
    const len = (header[0] << 24) | (header[1] << 16) | (header[2] << 8) | header[3];
    console.log('[init-loader] 读出长度:', len);

    const body = readBytes(32, len);
    const code = new TextDecoder('utf-8').decode(body);

    console.log('[init-loader] 前 100 字符:', code.slice(0, 100));

    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
    script.remove();

    console.log('[init-loader] 已从图片提取并执行 init.js，长度', len);
})();