// build-wordroot-data.js
// 运行：node build-wordroot-data.js

const fs = require('fs');
const path = require('path');

/* ============================================================
   1. 读词根表
   ============================================================ */
function loadWordRoots(file) {
  const text = fs.readFileSync(file, 'utf8');
  const roots = [];
  text.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const [root, meaning] = line.split('=');
    if (!root || !meaning) return;
    roots.push({
      root: root.trim().toLowerCase(),
      meaning: meaning.trim()
    });
  });
  roots.sort((a, b) => b.root.length - a.root.length);
  return roots;
}

/* ============================================================
   2. 读 ecdict.txt
   ============================================================ */
function loadEcdict(file) {
  const text = fs.readFileSync(file, 'utf8');
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

    dict.push({
      word: word.toLowerCase(),
      phonetic,
      translation
    });
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
   3. 前缀表
   ============================================================ */
const PREFIXES = [
  { p: 'ex', meaning: '往外' },
  { p: 'e', meaning: '往外' },
  { p: 'ef', meaning: '往外' },
  { p: 'in', meaning: '往里' },
  { p: 'im', meaning: '往里' },
  { p: 'il', meaning: '往里' },
  { p: 'ir', meaning: '往里' },
  { p: 're', meaning: '往回' },
  { p: 'pro', meaning: '往前' },
  { p: 'pre', meaning: '在前' },
  { p: 'post', meaning: '在后' },
  { p: 'sub', meaning: '往下' },
  { p: 'suc', meaning: '往下' },
  { p: 'suf', meaning: '往下' },
  { p: 'sup', meaning: '往下' },
  { p: 'super', meaning: '往上' },
  { p: 'sur', meaning: '往上' },
  { p: 'trans', meaning: '横过' },
  { p: 'per', meaning: '穿过' },
  { p: 'ad', meaning: '朝着' },
  { p: 'ac', meaning: '朝着' },
  { p: 'af', meaning: '朝着' },
  { p: 'ag', meaning: '朝着' },
  { p: 'al', meaning: '朝着' },
  { p: 'ap', meaning: '朝着' },
  { p: 'ar', meaning: '朝着' },
  { p: 'as', meaning: '朝着' },
  { p: 'at', meaning: '朝着' },
  { p: 'ab', meaning: '离开' },
  { p: 'abs', meaning: '离开' },
  { p: 'de', meaning: '往下' },
  { p: 'con', meaning: '一起' },
  { p: 'com', meaning: '一起' },
  { p: 'col', meaning: '一起' },
  { p: 'cor', meaning: '一起' },
  { p: 'dis', meaning: '分开' },
  { p: 'di', meaning: '分开' },
  { p: 'dif', meaning: '分开' },
  { p: 'inter', meaning: '之间' },
  { p: 'contra', meaning: '对着' },
  { p: 'counter', meaning: '对着' },
  { p: 'anti', meaning: '反对' },
  { p: 'op', meaning: '反对' },
  { p: 'ob', meaning: '挡着' },
  { p: 'un', meaning: '不' },
  { p: 'non', meaning: '不' },
  { p: 'mis', meaning: '错' }
];
PREFIXES.sort((a, b) => b.p.length - a.p.length);

/* ============================================================
   4. 后缀表
   ============================================================ */
const SUFFIXES = [
  { s: 'er', meaning: '干的人' },
  { s: 'or', meaning: '干的人' },
  { s: 'ar', meaning: '干的人' },
  { s: 'ist', meaning: '搞的人' },
  { s: 'ant', meaning: '干的人' },
  { s: 'ent', meaning: '干的人' },
  { s: 'tion', meaning: '事/行为' },
  { s: 'sion', meaning: '事/行为' },
  { s: 'ion', meaning: '事/行为' },
  { s: 'ment', meaning: '事/结果' },
  { s: 'ness', meaning: '状态' },
  { s: 'ity', meaning: '性质' },
  { s: 'ty', meaning: '性质' },
  { s: 'ive', meaning: '爱…的' },
  { s: 'ous', meaning: '多…的' },
  { s: 'ful', meaning: '满…的' },
  { s: 'less', meaning: '没…的' },
  { s: 'able', meaning: '能…的' },
  { s: 'ible', meaning: '能…的' },
  { s: 'ize', meaning: '使…' },
  { s: 'ise', meaning: '使…' },
  { s: 'ify', meaning: '使…' },
  { s: 'fy', meaning: '使…' },
  { s: 'ly', meaning: '…地' }
];
SUFFIXES.sort((a, b) => b.s.length - a.s.length);

/* ============================================================
   5. 拆词
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
      if (before === p.p) {
        prefix = p;
        break;
      }
    }
    if (!prefix) {
      for (const p of PREFIXES) {
        if (before === p.p + p.p.slice(-1)) {
          prefix = p;
          break;
        }
      }
    }
  }
  if (!prefix) return results;

  let suffix = null;
  if (after.length === 0) {
    suffix = { s: '', meaning: '无' };
  } else {
    for (const s of SUFFIXES) {
      if (after === s.s) {
        suffix = s;
        break;
      }
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
   6. 主流程
   ============================================================ */
function main() {
  const rootFile = path.join(__dirname, 'wordroot.txt');
  const dictFile = path.join(__dirname, 'ecdict.txt');
  const outFile = path.join(__dirname, 'wordroot-data.json');

  const roots = loadWordRoots(rootFile);
  const dict = loadEcdict(dictFile);

  console.log(`词根数: ${roots.length}`);
  console.log(`词典词数: ${dict.length}`);

  const wordMap = new Map();
  dict.forEach(item => wordMap.set(item.word, item));

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

  fs.writeFileSync(outFile, JSON.stringify(unique, null, 2), 'utf8');
  console.log(`生成题目数: ${unique.length}`);
  console.log(`输出: ${outFile}`);
}

/* ============================================================
   7. 生成选项
   ============================================================ */
function buildOptions(correct, roots) {
  const opts = [correct.split];

  const otherRoots = roots.filter(r => r.root !== correct.root);
  while (opts.length < 4 && otherRoots.length) {
    const r = otherRoots.splice(Math.floor(Math.random() * otherRoots.length), 1)[0];
    const s = `${correct.prefix ? correct.prefix + ' + ' : ''}${r.root}${correct.suffix ? ' + ' + correct.suffix : ''}`;
    if (!opts.includes(s)) opts.push(s);
  }

  while (opts.length < 4) opts.push('—');

  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }

  return {
    list: opts,
    answer: opts.indexOf(correct.split)
  };
}

main();