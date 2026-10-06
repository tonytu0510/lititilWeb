//记载最后的loader
const allUrlsLoader = ['./js/metaConfigLoader.js.txt','./js/loader.js.txt'];
runLoader(allUrlsLoader);
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
// 只负责执行
function execScript(code) {
    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
}
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