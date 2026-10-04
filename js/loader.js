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
    div.appendChild(glspinner)
    document.body.appendChild(div);
}
insert()
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
    }, 300);
}
// js/loader.js
(async function () {
    // 1. loading 已经在 HTML 里，直接 hide 备用
    // 2. 直接启动，不用等 DOMContentLoaded
    try {
        await loadScript('./js/metaConfigLoader.js');
        await initPage();
        await initPageMeta();
        await initPageContent();
        await renderContent();
        await runLoader();

        console.log('[loader] 全部完成');
        hideLoading()
    } catch (e) {
        console.error('[loader] 失败:', e);
        // body 还没出现，盯着 DOM 变化
        hideLoading()
    }
})();

// ============================================================
// 动态加载 JS
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
async function initPage() {
    window.PAGE_META.js = ["./compressed/common.js.txt"],
    window.PAGE_META.jsArr = ["./compressed/dino-game.js.txt"]
}

// ============================================================
// renderContent —— 把 content 插进 DOM
// ============================================================
async function renderContent() {
    // 插到 #app 里，或者你指定的容器
    const container = document.getElementById('app') || document.body;
    container.innerHTML += window.PAGE_META.content || '';
}

// ============================================================
// 加载逻辑
// ============================================================
async function runLoader() {
    let ignoreList = [];
    try {
        const txt = await (await fetch('./compressed/ignore.txt')).text();
        ignoreList = txt.split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#'));
    } catch (e) {
        console.warn('[loader] ignore.txt 读取失败');
    }

    const jsFront = window.PAGE_META.jsFront || [];
    for (const url of jsFront) {
        await loadOne(url, ignoreList);
    }

    const js = window.PAGE_META.js || [];
    for (const url of js) {
        await loadOne(url, ignoreList);
    }

    const jsArr = window.PAGE_META.jsArr || [];
    for (const url of jsArr) {
        await loadOne(url, ignoreList);
    }

    const jsEnd = window.PAGE_META.jsEnd || [];
    for (const url of jsEnd) {
        await loadOne(url, ignoreList);
    }

    const metaLoader = window.PAGE_META.metaLoader || [];
    for (const url of metaLoader) {
        await loadOne(url, ignoreList);
    }
}

async function loadOne(url, ignoreList) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url + ' 加载失败');
    const buf = new Uint8Array(await res.arrayBuffer());

    const baseName = url.split('/').pop().replace(/\.txt$/, '');

    let code;
    if (ignoreList.includes(baseName)) {
        code = new TextDecoder('utf-8').decode(buf);
    } else {
        code = decompress(buf);
    }

    execScript(code);
    console.log('[loader] 已加载:', url);
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

// ============================================================
// 执行脚本
// ============================================================
function execScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
}