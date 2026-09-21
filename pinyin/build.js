// ============================================================
// 读 pinyin.txt → 解析 → 输出 pinyin.json
// 用法：node build.js
// 需要：pinyin.txt 放在同目录
// ============================================================

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. 读文件
// ============================================================
const inputFile = path.join(__dirname, 'pinyin.txt');
const outputFile = path.join(__dirname, 'pinyin.json');

if (!fs.existsSync(inputFile)) {
  console.error('找不到 pinyin.txt，请先下载放到同目录');
  process.exit(1);
}

const text = fs.readFileSync(inputFile, 'utf8');

// ============================================================
// 2. 去声调
// 把 zhōng → zhong, liàng → liang, lǜ → lv
// ============================================================
function stripTone(pinyin) {
  return pinyin
    .normalize('NFD')                     // 分解成 字母 + 声调符号
    .replace(/[\u0300-\u036f]/g, '')      // 去掉声调符号
    .replace(/ü/g, 'v')                   // ü → v（避免键名带特殊字符）
    .toLowerCase();
}

// ============================================================
// 3. 解析每一行
// 格式：U+4E2D: zhōng,zhòng  # 中
// ============================================================
const hanziPinyin = {};   // { '中': ['zhōng','zhòng'], ... }
const pinyinHanzi = {};   // { 'zhong': ['中', ...], 'liang': ['亮','谅',...] }

const lines = text.split('\n');
let parsed = 0;

lines.forEach(function(line) {
  // 跳过空行和注释
  line = line.trim();
  if (!line || line.startsWith('#')) return;

  // 匹配：U+XXXX: pinyin,pinyin  # 汉字
  const m = line.match(/^U\+([0-9A-Fa-f]+):\s*([^#]+?)\s*#\s*(.+)$/);
  if (!m) return;

  const codepoint = parseInt(m[1], 16);
  const pinyinStr = m[2].trim();
  const hanzi = m[3].trim();

  // 汉字可能有多个（极少见），取第一个
  const char = hanzi.charAt(0);

  // 拼音按逗号拆
  const pinyins = pinyinStr.split(',').map(function(p) { return p.trim(); }).filter(Boolean);

  // 存 汉字 → 拼音
  if (!hanziPinyin[char]) hanziPinyin[char] = [];
  pinyins.forEach(function(py) {
    if (hanziPinyin[char].indexOf(py) === -1) hanziPinyin[char].push(py);

    // 同时存 拼音 → 汉字
    const key = stripTone(py);
    if (!pinyinHanzi[key]) pinyinHanzi[key] = [];
    if (pinyinHanzi[key].indexOf(char) === -1) pinyinHanzi[key].push(char);
  });

  parsed++;
});

console.log('解析行数：', parsed);
console.log('汉字数：', Object.keys(hanziPinyin).length);
console.log('拼音组数：', Object.keys(pinyinHanzi).length);

// ============================================================
// 4. 输出 JSON
// ============================================================

// 4.1 输出「拼音 → 汉字」
fs.writeFileSync(
  path.join(__dirname, 'pinyin2hanzi.json'),
  JSON.stringify(pinyinHanzi),
  'utf8'
);

// 4.2 输出「汉字 → 拼音」（可选）
fs.writeFileSync(
  path.join(__dirname, 'hanzi2pinyin.json'),
  JSON.stringify(hanziPinyin),
  'utf8'
);

console.log('已输出：');
console.log('  pinyin2hanzi.json');
console.log('  hanzi2pinyin.json');

// 4.3 顺手打印几个样例
console.log('\n样例：');
['liang', 'de', 'yuan', 'zhong'].forEach(function(k) {
  const list = pinyinHanzi[k] || [];
  console.log('  ' + k + ' → ' + list.slice(0, 20).join(' ') + (list.length > 20 ? ' ...（共 ' + list.length + ' 个）' : ''));
});