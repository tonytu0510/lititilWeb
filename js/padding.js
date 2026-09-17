(function() {
    'use strict';

    // ---------- 对合基元计数 ----------
    function primitiveCount(ch) {
        const map = {
            'a':2,'b':2,'c':1,'d':2,'e':1,'f':2,'g':2,'h':2,'i':1,
            'j':2,'k':2,'l':1,'m':2,'n':2,'o':1,'p':2,'q':2,'r':1,
            's':1,'t':2,'u':1,'v':1,'w':2,'x':2,'y':2,'z':1
        };
        return map[ch.toLowerCase()] || 1;
    }

    function totalPrimitive(str) {
        let sum = 0;
        for (let i = 0; i < str.length; i++) sum += primitiveCount(str[i]);
        return sum;
    }

    function applyProtocol(str, targetLen, offset) {
        const raw = totalPrimitive(str);
        let padded = raw.toString();
        while (padded.length < targetLen) padded = '0' + padded;
        const shifted = parseInt(padded) + offset;
        return { raw, padded, shifted };
    }

    function demoCandidate(hash) {
        const bytes = [];
        for (let i = 0; i < hash.length; i += 2) bytes.push(parseInt(hash.substr(i, 2), 16));
        let seed = 0;
        for (let i = 0; i < 4; i++) seed |= (bytes[i] || 0) << (i * 8);
        seed >>>= 0;
        let chars = '';
        for (let i = 0; i < 4; i++) {
            let code = ((seed >> (i * 8)) & 0xFF) % 26;
            chars += String.fromCharCode(97 + code);
        }
        return chars;
    }

    function simpleHash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h) + str.charCodeAt(i);
            h = h & h;
        }
        return h.toString(16).padStart(8, '0');
    }

    // ---------- 对合协议逻辑 ----------
    const inputEl = document.getElementById('inputText');
    const runBtnHeo = document.getElementById('runBtnHeo');
    const primitiveDisplay = document.getElementById('primitiveDisplay');
    const processDisplay = document.getElementById('processDisplay');
    const statusBadgeHeo = document.getElementById('statusBadgeHeo');
    const resultBadgeHeo = document.getElementById('resultBadgeHeo');
    const protocolDisplayHeo = document.getElementById('protocolDisplayHeo');

    function runHeo() {
        const text = inputEl.value || '';
        if (text.length === 0) {
            primitiveDisplay.textContent = '请先输入文本';
            processDisplay.textContent = '——';
            statusBadgeHeo.textContent = '⏳ 等待输入';
            statusBadgeHeo.className = 'badge';
            resultBadgeHeo.textContent = '——';
            resultBadgeHeo.className = 'badge';
            protocolDisplayHeo.innerHTML = '<span class="dim">对合数字协议：</span> 基元计数 → 补位 → 固定偏移 → 闭合';
            return;
        }

        let detail = '', total = 0;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const cnt = primitiveCount(ch);
            detail += `${ch}(${cnt}) `;
            total += cnt;
        }
        primitiveDisplay.textContent = `${detail}→ 总数 = ${total}`;

        const LEN = 4, OFFSET = 1111;
        const result = applyProtocol(text, LEN, OFFSET);
        const hash = simpleHash(text);
        const candidate = demoCandidate(hash);
        const candResult = applyProtocol(candidate, LEN, OFFSET);

        let candDetail = '';
        for (let i = 0; i < candidate.length; i++) {
            candDetail += `${candidate[i]}(${primitiveCount(candidate[i])}) `;
        }

        const closed = (result.shifted === candResult.shifted);

        processDisplay.innerHTML = `
            <div style="color:#888; margin-bottom:4px;">
                <span style="color:#7cb8b8;">原始输入</span> “${text}” → 基元总数 ${result.raw} → 补位 <span style="color:#7cb8b8;">${result.padded}</span> → 偏移 +${OFFSET} → <span style="color:#7cb8b8;">${result.shifted}</span>
            </div>
            <div style="color:#666; border-top:1px dashed #1a1a1a; padding-top:4px;">
                <span style="color:#7cb8b8;">对合候选</span> “${candidate}” → 基元总数 ${candResult.raw} → 补位 <span style="color:#7cb8b8;">${candResult.padded}</span> → 偏移 +${OFFSET} → <span style="color:#7cb8b8;">${candResult.shifted}</span>
            </div>
            <div style="border-top:1px solid #1a1a1a; padding-top:4px; margin-top:4px;">
                <span style="color:#888;">候选基元分布：</span> ${candDetail}
            </div>
        `;

        statusBadgeHeo.textContent = '✅ 完成';
        statusBadgeHeo.className = 'badge ok';
        resultBadgeHeo.textContent = closed ? '✅ 闭合' : '⚠️ 未闭合';
        resultBadgeHeo.className = closed ? 'badge ok' : 'badge fail';

        protocolDisplayHeo.innerHTML = `
            <span class="dim">对合数字协议：</span><br>
            输入 “${text}” → 基元数 ${result.raw} → 补位 ${result.padded} → 偏移 +${OFFSET} → ${result.shifted}<br>
            候选 “${candidate}” → 基元数 ${candResult.raw} → 补位 ${candResult.padded} → 偏移 +${OFFSET} → ${candResult.shifted}<br>
            <span style="color:#7cb8b8;">闭合状态：${closed ? '✅ 必然相等' : '⚠️ 未闭合（偏移步长固定）'}</span>
            <br><span style="color:#444; font-size:11px;">💡 当输入与候选的偏移结果相等时，系统达到闭合。</span>
        `;
    }

    runBtnHeo.addEventListener('click', runHeo);
    inputEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') runHeo(); });
    runHeo();

    // ---------- 衰减验证逻辑 ----------
    const lastInput = document.getElementById('lastCurrent');
    const currentInput = document.getElementById('currentCurrent');
    const runBtnDecay = document.getElementById('runBtnDecay');
    const lastDisplay = document.getElementById('lastDisplay');
    const currentDisplay = document.getElementById('currentDisplay');
    const resultDisplayDecay = document.getElementById('resultDisplayDecay');
    const statusBadgeDecay = document.getElementById('statusBadgeDecay');
    const matchBadgeDecay = document.getElementById('matchBadgeDecay');
    const protocolDisplayDecay = document.getElementById('protocolDisplayDecay');

    function validateDecay(last, current) {
        if (current > last) {
            return { ok: false, reason: '电流异常增大（磁铁不会反向增强）' };
        }
        const drop = last - current;
        const dropRatio = drop / last;
        if (dropRatio > 0.10) {
            return { ok: false, reason: `衰减过快 (${(dropRatio * 100).toFixed(1)}%)，超出合理范围` };
        }
        return { ok: true, reason: `衰减 ${(dropRatio * 100).toFixed(1)}%，在合理范围内` };
    }

    function runDecay() {
        const last = parseFloat(lastInput.value);
        const current = parseFloat(currentInput.value);

        if (isNaN(last) || isNaN(current)) {
            resultDisplayDecay.textContent = '⚠️ 请输入有效数字';
            statusBadgeDecay.textContent = '⚠️ 输入无效';
            statusBadgeDecay.className = 'badge fail';
            matchBadgeDecay.textContent = '——';
            matchBadgeDecay.className = 'badge';
            return;
        }

        lastDisplay.textContent = last;
        currentDisplay.textContent = current;

        const result = validateDecay(last, current);

        if (result.ok) {
            resultDisplayDecay.textContent = `✅ 通过 (${result.reason})`;
            statusBadgeDecay.textContent = '✅ 验证通过';
            statusBadgeDecay.className = 'badge ok';
            matchBadgeDecay.textContent = '✅ 双因子匹配';
            matchBadgeDecay.className = 'badge ok';
        } else {
            resultDisplayDecay.textContent = `❌ 不通过 (${result.reason})`;
            statusBadgeDecay.textContent = '❌ 验证失败';
            statusBadgeDecay.className = 'badge fail';
            matchBadgeDecay.textContent = '❌ 不匹配';
            matchBadgeDecay.className = 'badge fail';
        }

        protocolDisplayDecay.innerHTML = `
            <strong>验证规则：</strong> 电流不应增大 · 衰减应在合理范围内<br>
            上次电流: <span class="highlight">${last}</span> → 本次电流: <span class="highlight">${current}</span> · 差值: ${(last - current).toFixed(2)}
        `;
    }

    runBtnDecay.addEventListener('click', runDecay);
    lastInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runDecay(); });
    currentInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runDecay(); });
    runDecay();

    // ---------- Tab 切换 ----------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = {
        tabHeo: document.getElementById('tabHeo'),
        tabDecay: document.getElementById('tabDecay')
    };
    const titleSpan = document.getElementById('titleSpan');
    const subtitleSpan = document.getElementById('subtitleSpan');
    const footerSpan = document.getElementById('footerSpan');

    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            tabBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');

            const target = this.dataset.tab;
            Object.keys(panels).forEach(function(key) {
                panels[key].classList.toggle('active', key === target);
            });

            // 切换标题/副标题/底部文字
            if (target === 'tabHeo') {
                titleSpan.textContent = '对合数字协议';
                subtitleSpan.textContent = '输入任意文本，观察基元计数 → 补位 → 偏移 → 闭合的完整过程';
                footerSpan.textContent = '对合系统';
            } else {
                titleSpan.textContent = '衰减验证';
                subtitleSpan.textContent = '上次电流 ↔ 本次电流 · 对比即验证';
                footerSpan.textContent = '物理验证';
            }
        });
    });

})();