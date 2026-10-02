const QUESTIONS = [
  {
    root: "port", rootMean: "拿、运",
    prefix: "ex", prefixMean: "出",
    word: "export",
    opts: ["往里运", "往外运", "横向运", "向下运"],
    answer: 1,
    realMean: "出口、输出",
    explain: "往外运，就是出口。"
  },
  {
    root: "port", rootMean: "拿、运",
    prefix: "in", prefixMean: "里",
    word: "import",
    opts: ["往外运", "往里运", "横向运", "向下运"],
    answer: 1,
    realMean: "进口、输入",
    explain: "往里运，就是进口。"
  },
  {
    root: "port", rootMean: "拿、运",
    prefix: "trans", prefixMean: "横过、转移",
    word: "transport",
    opts: ["往里运", "往外运", "运过去", "拿起来"],
    answer: 2,
    realMean: "运输、运送",
    explain: "运过去，就是运输。"
  },
  {
    root: "spect", rootMean: "看",
    prefix: "in", prefixMean: "里",
    word: "inspect",
    opts: ["往里看", "往外看", "再看一眼", "向上看"],
    answer: 0,
    realMean: "检查、视察",
    explain: "往里看，就是检查。"
  },
  {
    root: "spect", rootMean: "看",
    prefix: "re", prefixMean: "再、回",
    word: "respect",
    opts: ["往里看", "再看一眼", "向下看", "看穿"],
    answer: 1,
    realMean: "尊重、尊敬",
    explain: "再看一眼，就是尊重。"
  },
  {
    root: "dict", rootMean: "说",
    prefix: "pre", prefixMean: "前",
    word: "predict",
    opts: ["提前说", "往后说", "大声说", "反着说"],
    answer: 0,
    realMean: "预言、预测",
    explain: "提前说，就是预言。"
  },
  {
    root: "scrib", rootMean: "写",
    prefix: "de", prefixMean: "下",
    word: "describe",
    opts: ["写上去", "写下来", "写出去", "写满"],
    answer: 1,
    realMean: "描述、描写",
    explain: "写下来，就是描述。"
  },
  {
    root: "form", rootMean: "形状",
    prefix: "in", prefixMean: "里",
    word: "inform",
    opts: ["往外形", "往里形", "把形放进心里", "去掉形"],
    answer: 2,
    realMean: "通知、告知",
    explain: "把形放进心里，就是通知。"
  }
];

let idx = 0;
let score = 0;
let answered = false;

const qTitle = document.getElementById('qTitle');
const qRoot = document.getElementById('qRoot');
const qRootMean = document.getElementById('qRootMean');
const qPrefix = document.getElementById('qPrefix');
const qPrefixMean = document.getElementById('qPrefixMean');
const qWord = document.getElementById('qWord');
const optsBox = document.getElementById('opts');
const resultBox = document.getElementById('result');
const nextBtn = document.getElementById('nextBtn');
const scoreBox = document.getElementById('score');

function render() {
  const q = QUESTIONS[idx];
  answered = false;

  qTitle.textContent = '第 ' + (idx + 1) + ' 关 / 共 ' + QUESTIONS.length + ' 关';
  qRoot.textContent = q.root;
  qRootMean.textContent = q.rootMean;
  qPrefix.textContent = q.prefix;
  qPrefixMean.textContent = q.prefixMean;
  qWord.textContent = q.word;

  optsBox.innerHTML = '';
  resultBox.className = 'result';
  resultBox.innerHTML = '';
  nextBtn.style.display = 'none';

  q.opts.forEach(function (text, i) {
    const div = document.createElement('div');
    div.className = 'opt';
    div.textContent = String.fromCharCode(65 + i) + '. ' + text;
    div.onclick = function () { choose(i, div); };
    optsBox.appendChild(div);
  });

  updateScore();
}

function choose(i, el) {
  if (answered) return;
  answered = true;

  const q = QUESTIONS[idx];
  const allOpts = optsBox.querySelectorAll('.opt');

  if (i === q.answer) {
    el.classList.add('right');
    score++;
  } else {
    el.classList.add('wrong');
    allOpts[q.answer].classList.add('right');
  }

  resultBox.className = 'result show';
  resultBox.innerHTML =
    '<span class="label">词根 + 前缀 = 拼读义</span>' +
    '<span class="hl">' + q.prefix + '</span>（' + q.prefixMean + '） + ' +
    '<span class="hl">' + q.root + '</span>（' + q.rootMean + '） = ' +
    '<span class="hl2">' + q.opts[q.answer] + '</span>' +
    '<span class="label">真实词义</span>' +
    '<span class="big">' + q.word + ' = ' + q.realMean + '</span>' +
    '<span class="label">为什么</span>' +
    q.explain;

  updateScore();

  if (idx < QUESTIONS.length - 1) {
    nextBtn.textContent = '下 一 题';
  } else {
    nextBtn.textContent = '重 新 开 始';
  }
  nextBtn.style.display = 'block';
}

nextBtn.onclick = function () {
  if (idx < QUESTIONS.length - 1) {
    idx++;
    render();
  } else {
    idx = 0;
    score = 0;
    render();
  }
};

function updateScore() {
  scoreBox.textContent = '得分：' + score + ' / ' + (answered ? idx + 1 : idx);
}

render();