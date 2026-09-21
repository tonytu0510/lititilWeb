// ============================================================
// 表1：笔画归空集合
// ============================================================
const KONG = new Set(['一', '丨', '0', '丿', '丶', '乙', '乚', '亅', '乛', '⺄', '乀', '㇏', '7']);

const PIE = new Set(['丿']);
const NA = new Set(['乀', '㇏', '丶']);
const GOU = new Set(['乚', '亅', '乙', '⺄', '乛', '㇉', '㇁']);

function normalizeStroke(s) {
  if (GOU.has(s)) return '7';
  return s;
}

// ============================================================
// 曰的集合：曰、日、月、言、讠
// ============================================================
const YUE_SET = new Set(['曰', '日', '月', '言', '讠']);

// ============================================================
// 表2：拆字表（字 → 部件列表，一层）
// 拆到出现「曰/日/月/言/讠」就停，不再往下拆
// ============================================================
const CHAR_SPLIT = {
  '得': ['彳', '日', '寸'],
  '谅': ['言', '京'],
  '明': ['日', '月'],
  '的': ['白', '勺'],
  '者': ['耂', '日'],
  '何': ['亻', '可'],
  '懂': ['忄', '艹', '重'],
  '朝': ['十', '日', '十', '月'],
  '期': ['其', '月'],
  '朋': ['月', '月'],
  '青': ['月'],
  '清': ['氵', '青'],
  '晴': ['日', '青'],
  '情': ['忄', '青'],
  '请': ['言', '青'],
  '精': ['米', '青'],
  '睛': ['目', '青'],
  '说': ['言', '兑'],
  '话': ['言', '舌'],
  '诗': ['言', '寺'],
  '谁': ['言', '隹'],
  '谢': ['言', '身', '寸'],
  '认': ['言', '人'],
  '识': ['言', '只'],
  '谈': ['言', '炎'],
  '讲': ['言', '井'],
  '论': ['言', '仑'],
  '许': ['言', '午'],
  '记': ['言', '己'],
  '让': ['言', '上'],
  '调': ['言', '周'],
  '证': ['言', '正'],
  '试': ['言', '式'],
  '你': ['亻', '尔'],
  '可': ['丁', '口'],
  '以': ['人', '丶'],
  '大': ['一', '人'],
  '度': ['广', '廿', '又'],
  '去': ['土', '厶'],
  '别': ['口', '力', '刂'],
  '但': ['亻', '旦'],
  '万': ['一', '勹'],
  '不': ['一', '丿', '丨', '丶'],
  '要': ['覀', '女'],
  '愚': ['禺', '心'],
  '蠢': ['春', '春', '虫'],
  '再': ['一', '冂', '土'],
  '相': ['木', '目'],
  '信': ['亻', '言'],
  '王': ['一', '土'],
  '李': ['木', '子'],
  '木': ['十', '八'],
  '子': ['了', '一'],
  '了': ['乛', '亅'],
  '仁': ['亻', '二'],
  '铭': ['钅', '名'],
  '居': ['尸', '古'],
  '士': ['十', '一'],
  '几': ['丿', '乚'],
  '入': ['丿', '乀'],
  '者': ['耂', '日'],
  '内': ['冂', '人'],
  '德': ['彳', '十', '罒', '一', '心'],
  '印': ['卩', '一'],
  '度': ['广', '廿', '又'],
  '廿': ['十', '十'],
  '口': ['丨', '乛', '一'],
  '日': ['曰', '一'],
  '曰': ['口', '一'],
  '月': ['月'],
  '言': ['曰', '一'],
  '亻': ['丿', '丨'],
  '彳': ['丿', '丿', '丨'],
  '艹': ['一', '丨', '丨'],
  '忄': ['丶', '丶', '丨'],
  '白': ['丿', '日'],
  '勺': ['勹', '丶'],
  '京': ['亠', '口', '小'],
  '重': ['千', '里'],
  '千': ['丿', '十'],
  '里': ['田', '土'],
  '田': ['口', '十'],
  '土': ['十', '一'],
  '十': ['一', '丨'],
  '耂': ['土', '丿'],
  '可': ['丁', '口'],
  '丁': ['一', '亅'],
  '人': ['丿', '乀'],
  '八': ['丿', '丶'],
  '大': ['一', '人'],
};

// ============================================================
// 判曰：拆字看部件列表里有没有「曰/日/月/言/讠」
// ============================================================
function containsYue(char) {
  // 本身是曰/日/月/言/讠？
  if (YUE_SET.has(char)) return true;
  // 查部件列表
  const parts = CHAR_SPLIT[char];
  if (!parts) return false;
  for (let i = 0; i < parts.length; i++) {
    if (YUE_SET.has(parts[i])) return true;
    // 部件本身还能拆？递归一层
    if (CHAR_SPLIT[parts[i]] && parts[i] !== char) {
      const sub = CHAR_SPLIT[parts[i]];
      for (let j = 0; j < sub.length; j++) {
        if (YUE_SET.has(sub[j])) return true;
      }
    }
  }
  return false;
}

// 找含曰的部件
function findYuePart(char, depth) {
  depth = depth || 0;
  if (depth > 5) return null;
  if (YUE_SET.has(char)) return char;
  const parts = CHAR_SPLIT[char];
  if (!parts) return null;
  for (let i = 0; i < parts.length; i++) {
    if (YUE_SET.has(parts[i])) return parts[i];
  }
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === char) continue;
    const r = findYuePart(parts[i], depth + 1);
    if (r) return r;
  }
  return null;
}

// ============================================================
// 标点
// ============================================================
const PUNCT = new Set(['，', '。', '、', '；', '：', '？', '！', '“', '”', '‘', '’', '（', '）', '《', '》', ' ', '\n', '\t']);

// ============================================================
// 拆一层
// ============================================================
function splitOneLevel(char) {
  const parts = CHAR_SPLIT[char];
  if (!parts) return [char];
  return parts;
}

// 递归拆到笔画
function splitToStrokes(char, depth) {
  depth = depth || 0;
  if (depth > 10) return [normalizeStroke(char)];
  if (KONG.has(char)) return [normalizeStroke(char)];
  if (CHAR_SPLIT[char]) {
    const result = [];
    const parts = CHAR_SPLIT[char];
    for (let i = 0; i < parts.length; i++) {
      const sub = splitToStrokes(parts[i], depth + 1);
      for (let j = 0; j < sub.length; j++) result.push(sub[j]);
    }
    return result;
  }
  return [normalizeStroke(char)];
}

function hasPieNaPair(parts) {
  let pieIndex = -1, naIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (PIE.has(parts[i]) && pieIndex === -1) pieIndex = i;
    if (NA.has(parts[i]) && naIndex === -1) naIndex = i;
  }
  return pieIndex !== -1 && naIndex !== -1 && pieIndex < naIndex;
}

function containsPieNa(char, depth) {
  depth = depth || 0;
  if (depth > 10) return false;
  const parts = CHAR_SPLIT[char];
  if (!parts) return false;
  if (hasPieNaPair(parts)) return true;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === char) continue;
    if (containsPieNa(parts[i], depth + 1)) return true;
  }
  return false;
}

function hasQiQiPair(parts) {
  let count = 0;
  for (let i = 0; i < parts.length; i++) {
    if (normalizeStroke(parts[i]) === '7') count++;
  }
  return count >= 2;
}

function containsQiQi(char, depth) {
  depth = depth || 0;
  if (depth > 10) return false;
  const parts = CHAR_SPLIT[char];
  if (!parts) return false;
  if (hasQiQiPair(parts)) return true;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === char) continue;
    if (containsQiQi(parts[i], depth + 1)) return true;
  }
  return false;
}

// ============================================================
// 展开拆解链（递归）
// ============================================================
function expandRecursive(char, depth, lines, prefix) {
  depth = depth || 0;
  lines = lines || [];
  prefix = prefix || '';
  if (depth > 8) { lines.push(prefix + char + ' （超深）'); return lines; }

  const parts = CHAR_SPLIT[char];
  if (!parts) {
    lines.push(prefix + char + ' <span class="plain">（拆不动）</span>');
    return lines;
  }

  const hasYue = YUE_SET.has(char);
  const tag = hasYue ? ' <span class="yue">[曰类]</span>' : '';
  lines.push(prefix + char + tag);

  parts.forEach(function(part, i) {
    const isLast = i === parts.length - 1;
    const branch = isLast ? '└─ ' : '├─ ';
    const nextPrefix = prefix + (isLast ? '   ' : '│  ');

    const norm = normalizeStroke(part);
    const isQi = norm === '7' && part !== '7';
    const isYuePart = YUE_SET.has(part);
    let display = part;
    if (isQi) display = part + ' → 7';
    let mark = '';
    if (isQi) mark = ' <span class="chain-qi">（带钩）</span>';
    else if (isYuePart) mark = ' <span class="yue">（曰类）</span>';

    lines.push(prefix + branch + display + mark);
    if (part !== char && CHAR_SPLIT[part]) {
      expandRecursive(part, depth + 1, lines, nextPrefix + '   ');
    } else if (KONG.has(norm)) {
      lines.push(nextPrefix + '   <span class="empty">' + norm + ' → 归空</span>');
    }
  });

  return lines;
}

// 收集整句所有曰落点
function collectYuePoints(char, depth) {
  depth = depth || 0;
  if (depth > 10) return [];
  const parts = CHAR_SPLIT[char];
  if (!parts) return [];
  const points = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === '曰') {
      const next = (i + 1 < parts.length) ? parts[i + 1] : '一';
      points.push('曰' + next);
    } else if (CHAR_SPLIT[p]) {
      const sub = collectYuePoints(p, depth + 1);
      for (let j = 0; j < sub.length; j++) points.push(sub[j]);
    }
  }
  return points;
}

function reconcileYuePoints(points) {
  const count = {};
  points.forEach(function(p) { count[p] = (count[p] || 0) + 1; });
  const result = [];
  Object.keys(count).forEach(function(p) {
    const c = count[p];
    if (c % 2 === 1) result.push({ point: p, count: c });
  });
  return result;
}

// ============================================================
// 主流程
// ============================================================
function run() {
  const raw = document.getElementById('input').value;
  const log = [];

  log.push('<span class="step">【输入】</span>');
  log.push('  ' + raw);

  // 第1步：去标点
  log.push('');
  log.push('<span class="step">【第1步：去标点】</span>');
  let noPunct = '';
  for (let i = 0; i < raw.length; i++) {
    if (!PUNCT.has(raw[i])) noPunct += raw[i];
  }
  log.push('  去掉标点后：' + noPunct);

  // 第2步：相同字约掉
  log.push('');
  log.push('<span class="step">【第2步：相同字约掉（任意位置）】</span>');
  const chars = noPunct.split('');
  const count = {};
  chars.forEach(function(c) { count[c] = (count[c] || 0) + 1; });

  const kept = [];
  const removed = [];
  const seen = {};
  chars.forEach(function(c) {
    seen[c] = (seen[c] || 0) + 1;
    if (count[c] % 2 === 1 && seen[c] === count[c]) {
      kept.push(c);
    } else {
      removed.push(c);
    }
  });

  log.push('  原文用字：' + chars.join(' '));
  const cntStr = Object.keys(count).map(function(c) { return c + '×' + count[c]; }).join('  ');
  log.push('  字数统计：' + cntStr);
  log.push('  约掉：' + (removed.length ? removed.map(function(c) { return '<span class="gone">' + c + '</span>'; }).join(' ') : '（无）'));
  log.push('  保留：' + (kept.length ? kept.map(function(c) { return '<span class="hit">' + c + '</span>'; }).join(' ') : '（空）'));

  // 第3步：查曰（拆字看部件）+ 判自对合
  log.push('');
  log.push('<span class="step">【第3步：查曰（拆字看部件）+ 判自对合】</span>');

  const yueChars = [];
  const otherChars = [];
  const selfRemoved = [];

  kept.forEach(function(c) {
    // 本身/部件含曰？
    if (containsYue(c)) {
      yueChars.push(c);
      const yp = findYuePart(c);
      log.push('  <span class="yue">' + c + ' 含曰 → 部件：' + yp + '</span>');
      return;
    }

    // 不含曰 → 判自对合
    const parts = splitOneLevel(c);
    let onlySelf = true;
    for (let i = 0; i < parts.length; i++) {
      if (!KONG.has(normalizeStroke(parts[i]))) { onlySelf = false; break; }
    }
    const hasPn = containsPieNa(c);
    const hasQq = containsQiQi(c);
    if (hasPn || hasQq) onlySelf = true;

    if (onlySelf) {
      selfRemoved.push({ char: c, parts: parts });
    } else {
      otherChars.push(c);
      log.push('  ' + c + ' 不含曰 → 保留');
    }
  });

  selfRemoved.forEach(function(item) {
    log.push('  <span class="gone">' + item.char + '</span> = ' + item.parts.join(' + ') + ' → 自对合 → 归空');
  });
  if (!selfRemoved.length) log.push('  （无自对合字）');

  // 第4步：分类
  log.push('');
  log.push('<span class="step">【第4步：分类】</span>');
  log.push('  <span class="yue">含曰的字：</span>' + (yueChars.length ? yueChars.join(' ') : '（无）'));
  log.push('  其他字：' + (otherChars.length ? otherChars.join(' ') : '（无）'));

  // 第5步：展开拆解链
  log.push('');
  log.push('<span class="step">【第5步：展开拆解链】</span>');

  const allChars = yueChars.concat(otherChars);
  const allStrokes = [];

  allChars.forEach(function(c) {
    log.push('');
    log.push('  <span class="hit">▸ ' + c + '</span>');
    const lines = [];
    lines.push('    ' + c);
    expandRecursive(c, 1, lines, '    ');
    log.push(lines.join('\n'));

    const strokes = splitToStrokes(c);
    for (let i = 0; i < strokes.length; i++) allStrokes.push(strokes[i]);
  });

  if (!allChars.length) log.push('  （无）');

  // 第6步：汇总曰落点
  log.push('');
  log.push('<span class="step">【第6步：汇总整句曰落点】</span>');

  const allPoints = [];
  allChars.forEach(function(c) {
    const pts = collectYuePoints(c);
    pts.forEach(function(p) {
      allPoints.push(p);
      log.push('  ' + c + ' → ' + p);
    });
  });

  let hasYueResult = false;

  if (allPoints.length === 0) {
    log.push('  <span class="warn">（整句没有曰落点）</span>');
  } else {
    log.push('');
    log.push('  整句曰落点串：<span class="string">' + allPoints.join(' · ') + '</span>');
    const reconciled = reconcileYuePoints(allPoints);
    log.push('');
    log.push('  约分（相同落点成对约掉）：');
    if (reconciled.length === 0) {
      log.push('  <span class="warn">全部约掉 → 说明句子还有多音字没拆出来</span>');
    } else {
      reconciled.forEach(function(r) {
        log.push('  ' + r.point + ' × ' + r.count + '（奇数，保留 1 个）');
      });
      log.push('');
      log.push('  <span class="yue">整句曰什么：</span>');
      reconciled.forEach(function(r) {
        log.push('  <span class="string">' + r.point + ' = ？</span>');
      });
      hasYueResult = true;
    }
  }

  // 第7步：落一丨十 · 约分
  log.push('');
  log.push('<span class="step">【第7步：落一丨十 · 约分】</span>');

  const sCount = { '一': 0, '丨': 0, '0': 0, '7': 0 };
  const sOthers = {};
  allStrokes.forEach(function(s) {
    if (s in sCount) sCount[s]++;
    else sOthers[s] = (sOthers[s] || 0) + 1;
  });

  log.push('  一：' + sCount['一'] + ' 个');
  log.push('  丨：' + sCount['丨'] + ' 个');
  log.push('  0：' + sCount['0'] + ' 个');
  log.push('  7：' + sCount['7'] + ' 个');

  const pairYiShu = Math.min(sCount['一'], sCount['丨']);
  sCount['一'] -= pairYiShu;
  sCount['丨'] -= pairYiShu;
  if (pairYiShu > 0) log.push('  <span class="hit">一 × 丨 配对约掉 ' + pairYiShu + ' 对</span>');

  const pairQi = Math.floor(sCount['7'] / 2);
  sCount['7'] -= pairQi * 2;
  if (pairQi > 0) log.push('  <span class="hit">7 × 7 配对约掉 ' + pairQi + ' 对</span>');

  const pairZero = Math.floor(sCount['0'] / 2);
  sCount['0'] -= pairZero * 2;
  if (pairZero > 0) log.push('  <span class="hit">0 × 0 配对约掉 ' + pairZero + ' 对</span>');

  const residual = sCount['一'] + sCount['丨'] + sCount['0'] + sCount['7'];
  if (residual > 0) log.push('  剩余单笔：一×' + sCount['一'] + '  丨×' + sCount['丨'] + '  0×' + sCount['0'] + '  7×' + sCount['7'] + ' → 归空');

  const otherKeys = Object.keys(sOthers);
  if (otherKeys.length) {
    log.push('  其他笔画：' + otherKeys.map(function(k) { return k + '×' + sOthers[k]; }).join('  ') + ' → 归空');
  }

  // 结果
  log.push('');
  log.push('<span class="step">【最终结果】</span>');
  if (hasYueResult || yueChars.length > 0) {
    log.push('  <span class="empty">空 = 空 ✓ 对合上了</span>');
  } else {
    log.push('  <span class="warn">整句没有曰落点 → 拆偏旁为止</span>');
  }

  document.getElementById('output').innerHTML = log.join('\n');
}

// ============================================================
// 事件
// ============================================================
document.getElementById('btnRun').addEventListener('click', run);
document.getElementById('btnClear').addEventListener('click', function() {
  document.getElementById('input').value = '';
  document.getElementById('output').textContent = '等待输入…';
});
document.getElementById('btnSample').addEventListener('click', function() {
  const samples = ['你可以大度的去原谅别人', '但千万不要愚蠢的再相信', '邯郸', '懂', '何得'];
  const pick = samples[Math.floor(Math.random() * samples.length)];
  document.getElementById('input').value = pick;
  run();
});

run();