// ==================== 拆字表 ====================
    // 字 → 部件列表（拆一层）
    const SPLIT = {
      '明': ['日', '月'],
      '日': ['曰', '一'],
      '月': ['月'],
      '曰': ['口', '一'],
      '口': ['丨', '乛', '一'],
      '朋': ['月', '月'],
      '朝': ['十', '日', '十', '月'],
      '期': ['其', '月'],
      '其': ['廿', '一', '八'],
      '得': ['彳', '日', '寸'],
      '谅': ['言', '京'],
      '言': ['曰', '一'],
      '京': ['亠', '口', '小'],
      '的': ['白', '勺'],
      '白': ['丿', '日'],
      '勺': ['勹', '丶'],
      '春': ['三', '人', '日'],
      '三': ['一', '一', '一'],
      '人': ['丿', '乀'],
      '秋': ['禾', '火'],
      '禾': ['丿', '木'],
      '木': ['十', '八'],
      '火': ['丶', '丿', '人'],
      '和': ['禾', '口'],
      '香': ['禾', '日'],
      '种': ['禾', '中'],
      '中': ['口', '丨'],
      '秒': ['禾', '少'],
      '少': ['小', '丿'],
      '小': ['亅', '八'],
      '秀': ['禾', '乃'],
      '乃': ['𠄎', '丿'],
      '季': ['禾', '子'],
      '子': ['了', '一'],
      '了': ['乛', '亅'],
      '委': ['禾', '女'],
      '女': ['𡿨', '丿', '一'],
      '秉': ['禾', '彐'],
      '彐': ['乛', '一', '一'],
      '秦': ['禾', '舂'],
      '舂': ['三', '人', '臼'],
      '黎': ['禾', '𥝢'],
      '私': ['禾', '厶'],
      '厶': ['丿', '丶'],
      '租': ['禾', '且'],
      '且': ['月', '一'],
      '积': ['禾', '只'],
      '只': ['口', '八'],
      '称': ['禾', '尔'],
      '尔': ['⺈', '小'],
      '移': ['禾', '多'],
      '多': ['夕', '夕'],
      '夕': ['丿', '乛', '丶'],
      '稀': ['禾', '希'],
      '希': ['乂', '布'],
      '程': ['禾', '呈'],
      '呈': ['口', '王'],
      '稍': ['禾', '肖'],
      '肖': ['小', '月'],
      '稻': ['禾', '舀'],
      '舀': ['爫', '臼'],
      '稼': ['禾', '家'],
      '家': ['宀', '豕'],
      '穗': ['禾', '惠'],
      '惠': ['叀', '心'],
      '秧': ['禾', '央'],
      '央': ['冂', '大'],
      '稳': ['禾', '急'],
      '急': ['刍', '心'],
      '秃': ['禾', '几'],
      '几': ['丿', '乚'],
      '秆': ['禾', '干'],
      '干': ['一', '十'],
      '秸': ['禾', '吉'],
      '吉': ['士', '口'],
      '稠': ['禾', '周'],
      '周': ['冂', '土', '口'],
      '稚': ['禾', '隹'],
      '隹': ['亻', '一', '一', '一', '丨'],
      '稗': ['禾', '卑'],
      '卑': ['白', '丿', '十'],
      '稔': ['禾', '念'],
      '念': ['今', '心'],
      '稞': ['禾', '果'],
      '果': ['日', '木'],
      '稣': ['鱼', '禾'],
      '秣': ['禾', '末'],
      '末': ['一', '木'],
      '秭': ['禾', '𠂔'],
      '稃': ['禾', '孚'],
      '孚': ['爫', '子'],
      '稂': ['禾', '良'],
      '良': ['丶', '艮'],
      '秕': ['禾', '比'],
      '比': ['一', '乚', '丿', '乚'],
      '秫': ['禾', '术'],
      '术': ['木', '丶'],
      '稆': ['禾', '吕'],
      '吕': ['口', '口'],
      '秆': ['禾', '干'],
    };

    // 归空集合
    const KONG = new Set([
      '一', '丨', '十', '0',
      '丿', '丶', '乀', '乚', '乛', '亅', '乙', '⺄', '㇏', '7',
      '口', '月', '曰',
    ]);

    // 拆一层
    function splitOne(char) {
      const parts = SPLIT[char];
      if (!parts) return [char];
      return parts;
    }

    // 判是不是全归空
    function isAllKong(parts) {
      return parts.every(p => KONG.has(p));
    }

    // 递归拆到底，返回是否归空
    function isVoid(char, depth) {
      depth = depth || 0;
      if (depth > 12) return KONG.has(char);
      if (KONG.has(char)) return true;
      const parts = SPLIT[char];
      if (!parts) return false;
      return parts.every(p => isVoid(p, depth + 1));
    }

    // 展开拆解链
    function expand(char, depth, lines, prefix) {
      depth = depth || 0;
      lines = lines || [];
      prefix = prefix || '';
      if (depth > 12) { lines.push(prefix + char + ' （超深）'); return lines; }
      if (KONG.has(char)) {
        lines.push(prefix + char + ' <span class="step">[归空]</span>');
        return lines;
      }
      const parts = SPLIT[char];
      if (!parts) {
        lines.push(prefix + char + ' <span class="bad">[拆不动]</span>');
        return lines;
      }
      lines.push(prefix + char);
      parts.forEach((p, i) => {
        const last = i === parts.length - 1;
        const branch = last ? '└─ ' : '├─ ';
        const nextPrefix = prefix + (last ? '   ' : '│  ');
        lines.push(prefix + branch + p);
        expand(p, depth + 1, lines, nextPrefix);
      });
      return lines;
    }

    // ==================== 单人模式 ====================
    const SOLO_WORDS = ['明', '朋', '朝', '期', '得', '谅', '的', '春', '秋', '和', '香', '种', '秒', '秀', '季', '委', '秉', '私', '租', '积', '称', '移', '稀', '程', '稍', '稻', '稼', '穗', '秧', '稳', '秃', '秆', '秸', '稠', '稚', '稗', '稔', '稞', '稣', '秣', '秭', '稃', '稂', '秕', '秫', '稆'];

    let soloCurrent = '明';
    let soloSteps = [];

    function soloNew() {
      soloCurrent = SOLO_WORDS[Math.floor(Math.random() * SOLO_WORDS.length)];
      soloSteps = [];
      document.getElementById('soloTarget').textContent = soloCurrent;
      document.getElementById('soloInput').value = '';
      document.getElementById('soloLog').innerHTML = '等待拆解…';
      document.getElementById('soloStatus').className = 'game-status wait';
      document.getElementById('soloStatus').textContent = '输入拆解，例如「日 + 月」';
    }

    function soloHint() {
      const parts = splitOne(soloCurrent);
      if (parts.length === 1 && parts[0] === soloCurrent) {
        document.getElementById('soloStatus').className = 'game-status bad';
        document.getElementById('soloStatus').textContent = '这个字拆不动，换一个';
        return;
      }
      document.getElementById('soloStatus').className = 'game-status wait';
      document.getElementById('soloStatus').textContent = '提示：' + soloCurrent + ' = ' + parts.join(' + ');
    }

    function soloSubmit() {
      const input = document.getElementById('soloInput').value.trim();
      if (!input) return;

      // 去掉空格、加号，拆成字符
      const userParts = input.split(/[\s+，,]+/).filter(Boolean);

      // 标准化：每个 part 可能是一个字，或一个「无拆解」符号
      const expected = splitOne(soloCurrent);

      // 比较：用户输入的部件，跟期望的部件，集合是否一致
      const userSet = new Set(userParts);
      const expectedSet = new Set(expected);

      const ok = userParts.length === expected.length &&
                 userParts.every(p => expectedSet.has(p)) &&
                 expected.every(p => userSet.has(p));

      const logEl = document.getElementById('soloLog');
      const statusEl = document.getElementById('soloStatus');

      if (!ok) {
        statusEl.className = 'game-status bad';
        statusEl.textContent = '拆错了。提示：' + soloCurrent + ' 拆出 ' + expected.length + ' 个部件';
        logEl.innerHTML = '你输入：' + userParts.join(' + ') + '\n' +
                          '期望：' + expected.join(' + ') + '\n' +
                          '<span class="bad">再试试</span>';
        return;
      }

      // 拆对了，记录
      soloSteps.push({ char: soloCurrent, parts: expected });

      // 检查是否全部归空
      const allKong = expected.every(p => isVoid(p));

      if (allKong) {
        // 展示完整拆解链
        const lines = [];
        lines.push('<span class="target">' + soloCurrent + '</span>');
        expand(soloCurrent, 1, lines, '');
        logEl.innerHTML = lines.join('\n') + '\n\n<span class="ok">全部归空 ✓ 对合成立</span>';
        statusEl.className = 'game-status ok';
        statusEl.textContent = '归空 ✓ 对合';
        setTimeout(soloNew, 2500);
      } else {
        // 还没到空，继续拆
        // 找第一个没归空的部件，作为下一个目标
        let next = null;
        for (const p of expected) {
          if (!isVoid(p) && SPLIT[p]) { next = p; break; }
        }
        if (next) {
          soloCurrent = next;
          document.getElementById('soloTarget').textContent = soloCurrent;
          document.getElementById('soloInput').value = '';
          statusEl.className = 'game-status wait';
          statusEl.textContent = '继续拆：' + soloCurrent;
          const lines = [];
          lines.push('<span class="step">上一步</span>');
          expand(soloSteps[soloSteps.length - 1].char, 1, lines, '');
          lines.push('');
          lines.push('<span class="target">继续拆：' + soloCurrent + '</span>');
          logEl.innerHTML = lines.join('\n');
        } else {
          statusEl.className = 'game-status ok';
          statusEl.textContent = '完成 ✓';
          setTimeout(soloNew, 2000);
        }
      }
    }

    document.getElementById('soloSubmit').addEventListener('click', soloSubmit);
    document.getElementById('soloHint').addEventListener('click', soloHint);
    document.getElementById('soloNext').addEventListener('click', soloNew);
    document.getElementById('soloInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') soloSubmit();
    });

    // ==================== 双人模式 ====================
    // 状态：A 给字 → B 拆 → B 给字 → A 拆 → 判定
    let duoState = 'A_GIVE';   // A_GIVE / B_SPLIT / B_GIVE / A_SPLIT / RESULT
    let duoWordA = '';
    let duoWordB = '';

    function duoReset() {
      duoState = 'A_GIVE';
      duoWordA = '';
      duoWordB = '';
      document.getElementById('wordA').textContent = '—';
      document.getElementById('wordB').textContent = '—';
      document.getElementById('statusA').textContent = '等待';
      document.getElementById('statusB').textContent = '等待';
      document.getElementById('playerA').classList.add('active');
      document.getElementById('playerB').classList.remove('active');
      document.getElementById('duoInput').value = '';
      document.getElementById('duoInput').placeholder = '输入一个字，给 B';
      document.getElementById('duoStatus').className = 'game-status wait';
      document.getElementById('duoStatus').textContent = '玩家 A：先给一个字';
      document.getElementById('duoLog').innerHTML = '等待开始…';
    }

    function duoSubmit() {
      const input = document.getElementById('duoInput').value.trim();
      if (!input) return;
      const statusEl = document.getElementById('duoStatus');
      const logEl = document.getElementById('duoLog');

      if (duoState === 'A_GIVE') {
        // A 给字
        if (input.length !== 1) {
          statusEl.className = 'game-status bad';
          statusEl.textContent = '给一个字，不要多';
          return;
        }
        duoWordA = input;
        document.getElementById('wordA').textContent = duoWordA;
        document.getElementById('statusA').textContent = '已出字';
        duoState = 'B_SPLIT';
        document.getElementById('playerA').classList.remove('active');
        document.getElementById('playerB').classList.add('active');
        document.getElementById('duoInput').value = '';
        document.getElementById('duoInput').placeholder = '输入拆解，例如：日 + 月';
        statusEl.className = 'game-status wait';
        statusEl.textContent = '玩家 B：拆「' + duoWordA + '」';
        logEl.innerHTML = 'A 出字：<span class="target">' + duoWordA + '</span>';
      } else if (duoState === 'B_SPLIT') {
        // B 拆 A 的字
        const userParts = input.split(/[\s+，,]+/).filter(Boolean);
        const expected = splitOne(duoWordA);
        const ok = userParts.length === expected.length &&
                   expected.every(p => userParts.indexOf(p) !== -1) &&
                   userParts.every(p => expected.indexOf(p) !== -1);
        if (!ok) {
          statusEl.className = 'game-status bad';
          statusEl.textContent = '拆错了，再试';
          return;
        }
        const allKong = expected.every(p => isVoid(p));
        if (!allKong) {
          statusEl.className = 'game-status bad';
          statusEl.textContent = '拆对了，但还没归空，继续拆';
          return;
        }
        // B 拆成功
        duoState = 'B_GIVE';
        document.getElementById('statusB').textContent = '拆对了 ✓';
        document.getElementById('duoInput').value = '';
        document.getElementById('duoInput').placeholder = '输入一个字，给 A';
        statusEl.className = 'game-status ok';
        statusEl.textContent = 'B 拆对了 ✓ 现在 B 给 A 一个字';
        logEl.innerHTML = 'B 拆「' + duoWordA + '」✓ 归空\n\n现在 B 给 A 出字';
      } else if (duoState === 'B_GIVE') {
        if (input.length !== 1) {
          statusEl.className = 'game-status bad';
          statusEl.textContent = '给一个字，不要多';
          return;
        }
        duoWordB = input;
        document.getElementById('wordB').textContent = duoWordB;
        document.getElementById('statusB').textContent = '已出字';
        duoState = 'A_SPLIT';
        document.getElementById('playerB').classList.remove('active');
        document.getElementById('playerA').classList.add('active');
        document.getElementById('duoInput').value = '';
        document.getElementById('duoInput').placeholder = '输入拆解，例如：日 + 月';
        statusEl.className = 'game-status wait';
        statusEl.textContent = '玩家 A：拆「' + duoWordB + '」';
        logEl.innerHTML += '\n\nB 出字：<span class="target">' + duoWordB + '</span>';
      } else if (duoState === 'A_SPLIT') {
        const userParts = input.split(/[\s+，,]+/).filter(Boolean);
        const expected = splitOne(duoWordB);
        const ok = userParts.length === expected.length &&
                   expected.every(p => userParts.indexOf(p) !== -1) &&
                   userParts.every(p => expected.indexOf(p) !== -1);
        if (!ok) {
          statusEl.className = 'game-status bad';
          statusEl.textContent = '拆错了，再试';
          return;
        }
        const allKong = expected.every(p => isVoid(p));
        if (!allKong) {
          statusEl.className = 'game-status bad';
          statusEl.textContent = '拆对了，但还没归空，继续拆';
          return;
        }
        // A 也拆成功 → 对合
        duoState = 'RESULT';
        document.getElementById('statusA').textContent = '拆对了 ✓';
        statusEl.className = 'game-status ok';
        statusEl.textContent = '两边都归空 ✓ 对合成立';
        logEl.innerHTML += '\n\nA 拆「' + duoWordB + '」✓ 归空\n\n<span class="ok">对合成立 ✓</span>';
      }
    }

    document.getElementById('duoSubmit').addEventListener('click', duoSubmit);
    document.getElementById('duoReset').addEventListener('click', duoReset);
    document.getElementById('duoInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') duoSubmit();
    });

    // ==================== 模式切换 ====================
    document.querySelectorAll('.game-mode-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.game-mode-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const mode = this.dataset.mode;
        if (mode === 'solo') {
          document.getElementById('modeSolo').style.display = 'block';
          document.getElementById('modeDuo').style.display = 'none';
          soloNew();
        } else {
          document.getElementById('modeSolo').style.display = 'none';
          document.getElementById('modeDuo').style.display = 'block';
          duoReset();
        }
      });
    });

    // 初始化
    soloNew();
    duoReset();