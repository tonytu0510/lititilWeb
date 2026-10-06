// ============================================================
// 尽早插入 loading（body 一出现就塞）
// ============================================================
function insert() {
    // style
    const style = document.createElement('style');
    style.textContent = `
        #globalLoading {
            position: fixed;
            inset: 0;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        }
        .gl-spinner {
            width: 80px;
            height: 80px;
            border: 3px solid rgba(255,255,255,0.15);
            border-top-color: #7cb8b8;
            border-radius: 50%;
            animation: gl-spin 0.8s linear infinite;
        }
        @keyframes gl-spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.id = 'globalLoading';
    const glspinner = document.createElement('div');
    glspinner.className = 'gl-spinner';
    div.appendChild(glspinner);
    document.body.appendChild(div);
}
insert();

// ============================================================
// loading 控制
// ============================================================
function hideLoading() {
    const div = document.getElementById('globalLoading');
    if (!div) return;
    div.style.transition = 'opacity 0.3s';
    div.style.opacity = '0';
    setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
    }, 0);
}

// ============================================================
// 主流程
// ============================================================
(async function () {
    try {
        await loadScript('./js/metaConfigLoader.js');
        await initPage();
        await initPageMeta();
        await initPageContent();
        //加载全部head和css
        const allUrlsMetaLoader = [
            ...(window.PAGE_META.metaLoader || [])
        ];
        await runLoader(allUrlsMetaLoader);
        await renderContent();
        // 加载js - 按顺序收集所有 URL
        const allUrls = [
            ...(window.PAGE_META.jsFront || []),
            ...(window.PAGE_META.js || []),
            ...(window.PAGE_META.jsArr || []),
            ...(window.PAGE_META.jsEnd || [])
        ];
        await runLoader(allUrls);

        console.log('[loader] 全部完成');
        hideLoading();
    } catch (e) {
        console.error('[loader] 失败:', e);
        hideLoading();
    }
})();

// ============================================================
// 动态加载 JS 文件（用于 metaConfigLoader.js 这种普通脚本）
// ============================================================
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error(src + ' 加载失败'));
        document.head.appendChild(s);
    });
}

// ============================================================
// 初始化 PAGE_META（你原来的逻辑，保留）
// ============================================================
async function initPage() {
    window.PAGE_META.js = ["./compressed/common.js.txt"];
    window.PAGE_META.jsArr = ["./compressed/dino-game.js.txt"];
}

// ============================================================
// renderContent —— 把 content 插进 DOM
// ============================================================
async function renderContent() {
    const container = document.body;
    container.innerHTML += window.PAGE_META.content || '';
}

// ============================================================
// 并行下载 + 顺序执行
// ============================================================

// 只负责下载 + 解压，返回 code
async function fetchOne(url, ignoreList) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url + ' 加载失败');
    const buf = new Uint8Array(await res.arrayBuffer());
    const baseName = url.split('/').pop().replace(/\.txt$/, '');

    if (ignoreList.includes(baseName)) {
        return new TextDecoder('utf-8').decode(buf);
    } else {
        return decompress(buf);
    }
}

// 只负责执行
function execScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
}

// ============================================================
// runLoader —— 并行下载 + 顺序执行
// ============================================================
async function runLoader(allUrls) {
    // 1. 读取 ignore.txt
    let ignoreList = [];
    try {
        const txt = await (await fetch('./compressed/ignore.txt')).text();
        ignoreList = txt.split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#'));
    } catch (e) {
        console.warn('[loader] ignore.txt 读取失败');
    }


    if (allUrls.length === 0) {
        console.log('[loader] 没有需要加载的脚本');
        return;
    }

    // 3. 并行下载 + 解压（顺序由 Promise.all 保证与 allUrls 一致）
    const codes = await Promise.all(
        allUrls.map(url => fetchOne(url, ignoreList))
    );

    // 4. 按顺序执行
    for (let i = 0; i < codes.length; i++) {
        execScript(codes[i]);
        console.log('[loader] 已执行:', allUrls[i]);
    }

    console.log('[loader] 全部完成，共', codes.length, '个脚本');
}

// ============================================================
// 解压
// ============================================================
function decompress(buf) {
    const view = new DataView(buf.buffer);
    const BITS = view.getUint8(0);

    let base = 0n;
    for (let i = 0; i < 8; i++) {
        base = (base << 8n) | BigInt(buf[1 + i]);
    }

    const originalSize = view.getUint32(9);
    const count = view.getUint32(13);
    const dataBytes = buf.slice(17);

    const bits = [];
    for (const byte of dataBytes) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    const remainders = [];
    for (let i = 0; i < count; i++) {
        let val = 0n;
        for (let j = 0; j < BITS; j++) {
            val = (val << 1n) | BigInt(bits[i * BITS + j]);
        }
        remainders.push(val);
    }

    let v = 0n;
    for (let i = remainders.length - 1; i >= 0; i--) {
        v = v * base + remainders[i];
    }

    function bigIntToBytes(v) {
        if (v === 0n) return new Uint8Array([0]);
        const bytes = [];
        while (v > 0n) {
            bytes.unshift(Number(v & 0xffn));
            v >>= 8n;
        }
        return new Uint8Array(bytes);
    }

    let out = bigIntToBytes(v);
    if (out.length < originalSize) {
        const padded = new Uint8Array(originalSize);
        padded.set(out, originalSize - out.length);
        out = padded;
    }

    return new TextDecoder('utf-8').decode(out);
}