//记载最后的loader
const allUrlsLoader = [
    './js/metaConfigLoader.js.txt',
    './js/loader.js.txt'
];
runLoader(allUrlsLoader);
// ============================================================
// runLoader —— 并行下载 + 顺序执行
// ============================================================
async function runLoader(allUrls) {
    if (!allUrls || allUrls.length === 0) return;

    let ignoreList = [];
    try {
        const txt = await (await fetch('./compressed/ignore.txt')).text();
        ignoreList = txt.split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#'));
    } catch (e) {
        console.warn('[loader] ignore.txt 读取失败');
    }

    // 并行下载 + 解压
    const codes = await Promise.all(allUrls.map(url => fetchOne(url, ignoreList)));

    // 顺序执行
    for (let i = 0; i < codes.length; i++) {
        await execScript(codes[i]);
        codes[i] = null; // 断开引用
    }

    console.log('[loader] 全部完成，共', allUrls.length, '个脚本');
}
// ============================================================
// 执行脚本（延迟移除 DOM 节点，更安全）
// ============================================================
function execScript(code) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.textContent = code;
        document.body.appendChild(script);
        // 延迟到下一个宏任务移除，确保脚本已执行完
        setTimeout(() => {
            script.remove();
            resolve();
        }, 0);
    });
}
// ============================================================
// 只负责下载 + 解压，返回 code
// ============================================================
async function fetchOne(url, ignoreList) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(url + ' 加载失败');
    let buf = new Uint8Array(await res.arrayBuffer());
    const baseName = url.split('/').pop().replace(/\.txt$/, '');

    let code;
    if (ignoreList.includes(baseName)) {
        code = new TextDecoder('utf-8').decode(buf);
    } else {
        code = decompress(buf);
    }

    buf = null;
    return code;
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

    // 用完即弃的中间数组
    let bits = [];
    for (const byte of dataBytes) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    let remainders = [];
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

    // 释放大数组
    bits = null;
    remainders = null;

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