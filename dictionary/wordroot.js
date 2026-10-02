// wordroot.js
// 服务器版：自动 fetch wordroot.txt 和 ecdict.txt

/* ============================================================
   前缀表
   ============================================================ */
const PREFIXES = [
  { p: 'ex', meaning: '往外' }, { p: 'e', meaning: '往外' }, { p: 'ef', meaning: '往外' },
  { p: 'in', meaning: '往里' }, { p: 'im', meaning: '往里' }, { p: 'il', meaning: '往里' }, { p: 'ir', meaning: '往里' },
  { p: 're', meaning: '往回' }, { p: 'pro', meaning: '往前' }, { p: 'pre', meaning: '在前' }, { p: 'post', meaning: '在后' },
  { p: 'sub', meaning: '往下' }, { p: 'suc', meaning: '往下' }, { p: 'suf', meaning: '往下' }, { p: 'sup', meaning: '往下' },
  { p: 'super', meaning: '往上' }, { p: 'sur', meaning: '往上' },
  { p: 'trans', meaning: '横过' }, { p: 'per', meaning: '穿过' },
  { p: 'ad', meaning: '朝着' }, { p: 'ac', meaning: '朝着' }, { p: 'af', meaning: '朝着' }, { p: 'ag', meaning: '朝着' },
  { p: 'al', meaning: '朝着' }, { p: 'ap', meaning: '朝着' }, { p: 'ar', meaning: '朝着' }, { p: 'as', meaning: '朝着' }, { p: 'at', meaning: '朝着' },
  { p: 'ab', meaning: '离开' }, { p: 'abs', meaning: '离开' },
  { p: 'de', meaning: '往下' },
  { p: 'con', meaning: '一起' }, { p: 'com', meaning: '一起' }, { p: 'col', meaning: '一起' }, { p: 'cor', meaning: '一起' },
  { p: 'dis', meaning: '分开' }, { p: 'di', meaning: '分开' }, { p: 'dif', meaning: '分开' },
  { p: 'inter', meaning: '之间' },
  { p: 'contra', meaning: '对着' }, { p: 'counter', meaning: '对着' },
  { p: 'anti', meaning: '反对' }, { p: 'op', meaning: '反对' }, { p: 'ob', meaning: '挡着' },
  { p: 'un', meaning: '不' }, { p: 'non', meaning: '不' }, { p: 'mis', meaning: '错' }
].sort((a, b) => b.p.length - a.p.length);

/* ============================================================
   后缀表
   ============================================================ */
const SUFFIXES = [
  { s: 'er', meaning: '干的人' }, { s: 'or', meaning: '干的人' }, { s: 'ar', meaning: '干的人' },
  { s: 'ist', meaning: '搞的人' },
  { s: 'ant', meaning: '干的人' }, { s: 'ent', meaning: '干的人' },
  { s: 'tion', meaning: '事/行为' }, { s: 'sion', meaning: '事/行为' }, { s: 'ion', meaning: '事/行为' },
  { s: 'ment', meaning: '事/结果' },
  { s: 'ness', meaning: '状态' },
  { s: 'ity', meaning: '性质' }, { s: 'ty', meaning: '性质' },
  { s: 'ive', meaning: '爱…的' },
  { s: 'ous', meaning: '多…的' },
  { s: 'ful', meaning: '满…的' },
  { s: 'less', meaning: '没…的' },
  { s: 'able', meaning: '能…的' }, { s: 'ible', meaning: '能…的' },
  { s: 'ize', meaning: '使…' }, { s: 'ise', meaning: '使…' },
  { s: 'ify', meaning: '使…' }, { s: 'fy', meaning: '使…' },
  { s: 'ly', meaning: '…地' }
].sort((a, b) => b.s.length - a.s.length);

/* ============================================================
   解析 wordroot.txt
   ============================================================ */
function parseRoots(text) {
  const roots = [];
  text.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const [root, meaning] = line.split('=');
    if (!root || !meaning) return;
    roots.push({ root: root.trim().toLowerCase(), meaning: meaning.trim() });
  });
  roots.sort((a, b) => b.root.length - a.root.length);
  return roots;
}

/* ============================================================
   解析 ecdict.txt
   ============================================================ */
function parseDict(text) {
  const lines = text.split(/\r?\n/);
  const dict = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = parseCSVLine(line);
    if (!parts || parts.length < 4) continue;

    const word = (parts[0] || '').trim();
    const phonetic = (parts[1] || '').trim();
    const translation = (parts[3] || '').trim();

    if (!word) continue;
    if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(word)) continue;
    if (word.length < 3) continue;

    dict.push({ word: word.toLowerCase(), phonetic, translation });
  }

  return dict;
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

/* ============================================================
   拆词
   ============================================================ */
function trySplit(word, root) {
  const results = [];
  const idx = word.indexOf(root.root);
  if (idx === -1) return results;

  const before = word.slice(0, idx);
  const after = word.slice(idx + root.root.length);

  let prefix = null;
  if (before.length === 0) {
    prefix = { p: '', meaning: '无' };
  } else {
    for (const p of PREFIXES) {
      if (before === p.p) { prefix = p; break; }
    }
    if (!prefix) {
      for (const p of PREFIXES) {
        if (before === p.p + p.p.slice(-1)) { prefix = p; break; }
      }
    }
  }
  if (!prefix) return results;

  let suffix = null;
  if (after.length === 0) {
    suffix = { s: '', meaning: '无' };
  } else {
    for (const s of SUFFIXES) {
      if (after === s.s) { suffix = s; break; }
    }
    if (!suffix) return results;
  }

  results.push({
    word,
    prefix: prefix.p,
    prefixMeaning: prefix.meaning,
    root: root.root,
    rootMeaning: root.meaning,
    suffix: suffix.s,
    suffixMeaning: suffix.meaning,
    split: `${prefix.p ? prefix.p + ' + ' : ''}${root.root}${suffix.s ? ' + ' + suffix.s : ''}`
  });

  return results;
}

/* ============================================================
   构建题库
   ============================================================ */
function buildQuestions(roots, dict) {
  const questions = [];

  for (const item of dict) {
    const word = item.word;
    for (const root of roots) {
      if (!word.includes(root.root)) continue;
      const splits = trySplit(word, root);
      for (const sp of splits) {
        questions.push({
          word: sp.word,
          phonetic: item.phonetic || '',
          translation: item.translation || '',
          prefix: sp.prefix,
          prefixMeaning: sp.prefixMeaning,
          root: sp.root,
          rootMeaning: sp.rootMeaning,
          suffix: sp.suffix,
          suffixMeaning: sp.suffixMeaning,
          split: sp.split,
          options: buildOptions(sp, roots)
        });
      }
    }
  }

  const seen = new Set();
  const unique = [];
  for (const q of questions) {
    if (seen.has(q.word)) continue;
    seen.add(q.word);
    unique.push(q);
  }

  return unique;
}

/* ============================================================
   选项：带中文含义
   ============================================================ */
function part(text, meaning) {
  return meaning ? `${text}(${meaning})` : text;
}

function buildOptions(correct, roots) {
  const correctStr = [
    correct.prefix ? part(correct.prefix, correct.prefixMeaning) : '',
    part(correct.root, correct.rootMeaning),
    correct.suffix ? part(correct.suffix, correct.suffixMeaning) : ''
  ].filter(Boolean).join(' + ');

  const opts = [correctStr];
  const otherRoots = roots.filter(r => r.root !== correct.root);

  while (opts.length < 4 && otherRoots.length) {
    const r = otherRoots.splice(Math.floor(Math.random() * otherRoots.length), 1)[0];
    const s = [
      correct.prefix ? part(correct.prefix, correct.prefixMeaning) : '',
      part(r.root, r.meaning),
      correct.suffix ? part(correct.suffix, correct.suffixMeaning) : ''
    ].filter(Boolean).join(' + ');

    if (!opts.includes(s)) opts.push(s);
  }

  while (opts.length < 4) opts.push('—');

  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  return { list: opts, answer: opts.indexOf(correctStr) };
}

/* ============================================================
   启动（含 loading）
   ============================================================ */
(async function () {
  const app = document.getElementById('app');

  // 1. 先显示 loading
  app.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div class="loading-text">正在加载词库…</div>
    </div>
  `;

  const MIN_LOADING = 500; // loading 最短显示毫秒，避免一闪而过
  const startTime = performance.now();

  let ROOTS = [];
  let DICT = [];
  let QUESTIONS = [];

  try {
    const [rootRes, dictRes] = await Promise.all([
      fetch('./dictionary/wordroot.txt'),
      fetch('./dictionary/ecdict.txt')
    ]);

    if (!rootRes.ok || !dictRes.ok) throw new Error('txt 加载失败');

    const rootText = await rootRes.text();
    const dictText = await dictRes.text();

    ROOTS = parseRoots(rootText);
    DICT = parseDict(dictText);
    QUESTIONS = buildQuestions(ROOTS, DICT);
  } catch (e) {
    app.innerHTML =
      '<div class="page"><h2>加载 txt 失败</h2><p>请确认 wordroot.txt 和 ecdict.txt 与 index.html 在同一目录，并通过 http 访问。</p></div>';
    return;
  }

  if (QUESTIONS.length === 0) {
    app.innerHTML = '<div class="page"><h2>没有拆出任何单词</h2></div>';
    return;
  }

  // 2. 保证 loading 至少显示 MIN_LOADING 毫秒
  const elapsed = performance.now() - startTime;
  if (elapsed < MIN_LOADING) {
    await new Promise(r => setTimeout(r, MIN_LOADING - elapsed));
  }

  // 3. 进入答题
  startApp(QUESTIONS);
})();

/* ============================================================
   答题主逻辑
   ============================================================ */
function startApp(data) {
  const state = {
    pool: [],
    done: new Set(),
    wrong: new Set(),
    wrongBook: new Set(),
    round: 1,
    streak: 0,
    maxStreak: 0,
    correctCount: 0,
    wrongCount: 0,
    totalCorrect: 0,
    totalWrong: 0
  };

  resetRound(data, state, true);
  render(data, state);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resetRound(source, state, isFirst = false) {
  if (isFirst) state.wrongBook = new Set();

  const wrongList = source.filter(q => state.wrongBook.has(q.word));
  const normalList = source.filter(q => !state.wrongBook.has(q.word));

  shuffle(wrongList);
  shuffle(normalList);

  state.pool = [...wrongList, ...normalList];
  state.done = new Set();
  state.wrong = new Set();
  state.correctCount = 0;
  state.wrongCount = 0;
  state.streak = 0;

  state.pool.forEach(item => {
    if (item.options && Array.isArray(item.options.list)) {
      const correct = item.options.list[item.options.answer];
      shuffle(item.options.list);
      item.options.answer = item.options.list.indexOf(correct);
    }
  });
}

/* ---------- 顶栏（全局唯一） ---------- */
function topbarHTML(state) {
  return `
    <div class="topbar">
      <div class="counter">1 / ${state.pool.length} · 第 ${state.round} 轮</div>
      <div class="progress-bar"><div class="progress-inner"></div></div>
      <div class="stats">
        <span class="stat">连对 <b class="streak">${state.streak}</b></span>
        <span class="stat">最高 <b class="maxStreak">${state.maxStreak}</b></span>
        <span class="stat">正确率 <b class="rate">${calcRate(state)}</b></span>
      </div>
    </div>
  `;
}

function refreshTopbar(state, index) {
  const streakEl = document.querySelector('.topbar .streak');
  const maxStreakEl = document.querySelector('.topbar .maxStreak');
  const rateEl = document.querySelector('.topbar .rate');
  const counterEl = document.querySelector('.topbar .counter');

  if (streakEl) streakEl.textContent = state.streak;
  if (maxStreakEl) maxStreakEl.textContent = state.maxStreak;
  if (rateEl) rateEl.textContent = calcRate(state);
  if (counterEl && typeof index === 'number') {
    counterEl.textContent = `${index + 1} / ${state.pool.length} · 第 ${state.round} 轮`;
  }
}

function render(data, state) {
  const app = document.getElementById('app');
  const frag = document.createDocumentFragment();
  const pool = state.pool;

  pool.forEach((item, index) => {
    const page = document.createElement('section');
    page.className = 'page';
    page.dataset.index = index;
    page.dataset.word = item.word;

    page.innerHTML = `
      <div class="word">${item.word}</div>
      <div class="phonetic">${item.phonetic || ''}</div>
      <div class="translation">${item.translation || ''}</div>
      <div class="question">选出正确的拆法</div>
      <div class="options"></div>
      <div class="feedback"></div>
      <div class="hint">答对自动上滑 · 答错停留</div>
    `;

    const optionsBox = page.querySelector('.options');
    item.options.list.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.dataset.oi = oi;
      btn.innerHTML = `<span class="tag">${String.fromCharCode(65 + oi)}</span><span>${opt}</span>`;
      optionsBox.appendChild(btn);
    });

    frag.appendChild(page);
  });

  const endPage = document.createElement('section');
  endPage.className = 'page final-page';
  endPage.dataset.end = '1';
  endPage.innerHTML = `
    <div class="final-title">第 ${state.round} 轮完成</div>
    <div class="final-sub">
      本轮 ${pool.length} 题 · 答对 ${state.correctCount} · 答错 ${state.wrongCount}
      · 最高连对 ${state.maxStreak}
    </div>
    <div class="wrong-book">
      <h3>错题本（${state.wrongBook.size}）</h3>
      <div class="wrong-list">
        ${
          state.wrongBook.size === 0
            ? '<div class="empty">暂无错题</div>'
            : [...state.wrongBook].map(w => `<span class="wrong-item">${w}</span>`).join('')
        }
      </div>
    </div>
    <div class="hint">即将自动开始下一轮</div>
  `;
  frag.appendChild(endPage);

  app.innerHTML = topbarHTML(state);
  app.appendChild(frag);

  app.scrollTop = 0;

  requestAnimationFrame(() => {
    const first = app.querySelector('.page');
    if (first) first.scrollIntoView({ behavior: 'auto', block: 'start' });

    updateProgressBar(state, 0);
    bindEvents(data, state);
  });
}

function bindEvents(data, state) {
  const app = document.getElementById('app');
  const pages = [...app.querySelectorAll('.page')];
  let locked = false;

  pages.forEach((page, index) => {
    if (page.dataset.end === '1') {
      bindEndPage(page, data, state);
      return;
    }

    const item = state.pool[index];
    if (!item) return;

    const opts = [...page.querySelectorAll('.option')];
    const feedback = page.querySelector('.feedback');

    opts.forEach(btn => {
      btn.addEventListener('click', () => {
        if (locked) return;
        if (btn.classList.contains('disabled')) return;

        const oi = Number(btn.dataset.oi);
        const isCorrect = oi === item.options.answer;

        if (isCorrect) {
          btn.classList.add('correct');
          opts.forEach(b => b.classList.add('disabled'));
          feedback.textContent = '正确 · 即将进入下一页';
          feedback.className = 'feedback ok';

          state.correctCount++;
          state.totalCorrect++;
          state.streak++;
          state.maxStreak = Math.max(state.maxStreak, state.streak);
          state.wrongBook.delete(item.word);
          state.done.add(item.word);

          refreshTopbar(state, index);
          updateProgressBar(state, index + 1);

          setTimeout(() => {
            const next = pages[index + 1];
            if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 650);
        } else {
          btn.classList.add('wrong');
          feedback.textContent = '答错 · 停留当前页';
          feedback.className = 'feedback no';

          state.wrongCount++;
          state.totalWrong++;
          state.streak = 0;
          state.wrong.add(item.word);
          state.wrongBook.add(item.word);

          refreshTopbar(state, index);

          locked = true;
          app.style.overflow = 'hidden';

          setTimeout(() => {
            locked = false;
            app.style.overflow = 'auto';
            btn.classList.remove('wrong');
            feedback.textContent = '';
            feedback.className = 'feedback';
          }, 1200);
        }
      });
    });
  });
}

function bindEndPage(page, data, state) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            state.round += 1;
            resetRound(data, state);
            render(data, state);
            document.getElementById('app').scrollTo({ top: 0, behavior: 'auto' });
          }, 1500);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.6 }
  );
  observer.observe(page);
}

function calcRate(state) {
  const total = state.correctCount + state.wrongCount;
  if (total === 0) return '0%';
  return Math.round((state.correctCount / total) * 100) + '%';
}

function updateProgressBar(state, current) {
  const inner = document.querySelector('.topbar .progress-inner');
  if (!inner) return;
  const total = state.pool.length;
  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  inner.style.width = pct + '%';
}