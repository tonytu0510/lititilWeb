// wordroot.js
(async function () {
  const app = document.getElementById('app');

  let data = [];
  try {
    const res = await fetch('./wordroot-data.json');
    data = await res.json();
  } catch (e) {
    app.innerHTML =
      '<div class="page"><h2>加载 wordroot-data.json 失败</h2><p>请用本地服务器打开，例如：npx serve</p></div>';
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    app.innerHTML = '<div class="page"><h2>题库为空</h2></div>';
    return;
  }

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

  window.__wordroot = { state, data, resetRound, render };
})();

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
      <div class="counter">${index + 1} / ${pool.length} · 第 ${state.round} 轮</div>
      <div class="progress-bar"><div class="progress-inner"></div></div>

      <div class="stats">
        <span class="stat">连对 <b class="streak">${state.streak}</b></span>
        <span class="stat">最高 <b class="maxStreak">${state.maxStreak}</b></span>
        <span class="stat">正确率 <b class="rate">--</b></span>
      </div>

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
            : [...state.wrongBook]
                .map(w => `<span class="wrong-item">${w}</span>`)
                .join('')
        }
      </div>
    </div>
    <div class="hint">即将自动开始下一轮</div>
  `;
  frag.appendChild(endPage);

  app.innerHTML = '';
  app.appendChild(frag);

  updateProgressBar(state, 0);
  bindEvents(data, state);
}

function bindEvents(data, state) {
  const app = document.getElementById('app');
  const pages = [...document.querySelectorAll('.page')];
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
    const rateEl = page.querySelector('.rate');
    const streakEl = page.querySelector('.streak');
    const maxStreakEl = page.querySelector('.maxStreak');

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

          streakEl.textContent = state.streak;
          maxStreakEl.textContent = state.maxStreak;
          rateEl.textContent = calcRate(state);

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

          streakEl.textContent = state.streak;
          rateEl.textContent = calcRate(state);

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

  app.addEventListener('touchmove', e => { if (locked) e.preventDefault(); }, { passive: false });
  app.addEventListener('wheel', e => { if (locked) e.preventDefault(); }, { passive: false });
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
  if (total === 0) return '--';
  return Math.round((state.correctCount / total) * 100) + '%';
}

function updateProgressBar(state, current) {
  const inner = document.querySelector('.progress-inner');
  if (!inner) return;
  const total = state.pool.length;
  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));
  inner.style.width = pct + '%';
}