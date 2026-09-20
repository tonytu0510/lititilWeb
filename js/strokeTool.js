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
// 表2：汉字拆解表
// ============================================================
const CHAR_SPLIT = {
  // 日 = 曰 + 一（日算曰）
  '日': ['曰', '一'],
  '白': ['丿', '日'],
  '的': ['白', '勺'],
  '得': ['彳', '日', '一', '寸'],
  '彳': ['丿', '丿', '丨'],
  '何': ['亻', '可'],
  '河': ['氵', '可'],
  '荷': ['艹', '何'],
  '柯': ['木', '可'],
  '苛': ['艹', '可'],
  '阿': ['阝', '可'],
  '呵': ['口', '可'],
  '奇': ['大', '可'],
  '哥': ['可', '可'],
  '歌': ['哥', '欠'],
  '欠': ['⺈', '人'],
  '懂': ['忄', '艹', '重'],
  '情': ['忄', '青'],
  '想': ['相', '心'],
  '思': ['田', '心'],
  '意': ['立', '日', '心'],
  '念': ['今', '心'],
  '忘': ['亡', '心'],
  '忍': ['刃', '心'],
  '志': ['士', '心'],
  '忠': ['中', '心'],
  '急': ['刍', '心'],
  '怎': ['乍', '心'],
  '总': ['公', '心'],
  '恩': ['因', '心'],
  '恨': ['忄', '艮'],
  '怕': ['忄', '白'],
  '快': ['忄', '夬'],
  '慢': ['忄', '曼'],
  '怀': ['忄', '不'],
  '怪': ['忄', '圣'],
  '性': ['忄', '生'],
  '怜': ['忄', '令'],
  '惜': ['忄', '昔'],
  '惊': ['忄', '京'],
  '惧': ['忄', '具'],
  '惭': ['忄', '斩'],
  '愧': ['忄', '鬼'],
  '艹': ['一', '丨', '丨'],
  '草': ['艹', '早'],
  '花': ['艹', '化'],
  '苗': ['艹', '田'],
  '茶': ['艹', '人', '木'],
  '英': ['艹', '央'],
  '荣': ['艹', '冖', '木'],
  '莫': ['艹', '日', '大'],
  '落': ['艹', '洛'],
  '薄': ['艹', '溥'],
  '蓝': ['艹', '监'],
  '忄': ['丶', '丶', '丨'],
  '重': ['千', '里'],
  '千': ['丿', '十'],
  '里': ['田', '土'],
  '田': ['口', '十'],
  '甲': ['日', '丨'],
  '由': ['日', '丨'],
  '申': ['日', '丨'],
  '男': ['田', '力'],
  '界': ['田', '介'],
  '略': ['田', '各'],
  '番': ['釆', '田'],
  '人': ['丿', '乀'],
  '入': ['丿', '乀'],
  '八': ['丿', '丶'],
  '大': ['一', '人'],
  '个': ['人', '丨'],
  '介': ['人', '丿', '丨'],
  '久': ['丿', '乛', '乀'],
  '少': ['小', '丿'],
  '分': ['八', '刀'],
  '刀': ['乛', '丿'],
  '小': ['亅', '八'],
  '几': ['丿', '乚'],
  '邯': ['甘', '阝'],
  '郸': ['单', '阝'],
  '甘': ['廿', '一'],
  '单': ['丷', '日', '十'],
  '阝': ['丨', '乛', '丨'],
  '丷': ['丶', '丿'],
  '原': ['厂', '白', '小'],
  '明': ['日', '月'],
  '青': ['一', '一', '丨', '月'],
  '湖': ['氵', '胡'],
  '胡': ['古', '月'],
  '朝': ['十', '日', '十', '月'],
  '期': ['其', '月'],
  '其': ['廿', '一', '八'],
  '朋': ['月', '月'],
  '服': ['月', '𠬝'],
  '胜': ['月', '生'],
  '腾': ['月', '关', '马'],
  '朦': ['月', '蒙'],
  '胧': ['月', '龙'],
  '腊': ['月', '昔'],
  '昔': ['廿', '日'],
  '精': ['米', '青'],
  '睛': ['目', '青'],
  '晴': ['日', '青'],
  '清': ['氵', '青'],
  '请': ['言', '青'],
  '曰': ['口', '一'],
  '月': ['月'],
  '阴': ['阝', '月'],
  '阳': ['阝', '日'],
  '謜': ['言', '原'],
  '言': ['曰', '一'],
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
  '谅': ['言', '京'],
  '译': ['言', '又', '二'],
  '词': ['言', '司'],
  '语': ['言', '吾'],
  '讽': ['言', '风'],
  '讯': ['言', '卂'],
  '训': ['言', '川'],
  '议': ['言', '义'],
  '访': ['言', '方'],
  '设': ['言', '殳'],
  '诉': ['言', '斥'],
  '诊': ['言', '尔'],
  '评': ['言', '平'],
  '诚': ['言', '成'],
  '该': ['言', '亥'],
  '诞': ['言', '延'],
  '询': ['言', '旬'],
  '详': ['言', '羊'],
  '诫': ['言', '戒'],
  '诬': ['言', '巫'],
  '误': ['言', '吴'],
  '诱': ['言', '秀'],
  '诲': ['言', '每'],
  '课': ['言', '果'],
  '诽': ['言', '非'],
  '谊': ['言', '宜'],
  '谋': ['言', '某'],
  '谍': ['言', '枼'],
  '谎': ['言', '荒'],
  '谏': ['言', '柬'],
  '谐': ['言', '皆'],
  '谑': ['言', '虐'],
  '谒': ['言', '曷'],
  '谓': ['言', '胃'],
  '谔': ['言', '咢'],
  '谕': ['言', '俞'],
  '谖': ['言', '爰'],
  '谗': ['言', '毚'],
  '谙': ['言', '音'],
  '谚': ['言', '彦'],
  '谛': ['言', '帝'],
  '谜': ['言', '迷'],
  '谟': ['言', '莫'],
  '谠': ['言', '党'],
  '谡': ['言', '粟'],
  '谣': ['言', '摇'],
  '谤': ['言', '旁'],
  '谦': ['言', '兼'],
  '谧': ['言', '宓'],
  '谨': ['言', '堇'],
  '谩': ['言', '曼'],
  '谪': ['言', '啇'],
  '谫': ['言', '剪'],
  '谬': ['言', '翏'],
  '谭': ['言', '覃'],
  '谮': ['言', '替'],
  '谯': ['言', '焦'],
  '谰': ['言', '阑'],
  '谱': ['言', '普'],
  '谲': ['言', '矞'],
  '谳': ['言', '献'],
  '谴': ['言', '遣'],
  '谵': ['言', '詹'],
  '谶': ['言', '韱'],
  '你': ['亻', '尔'],
  '可': ['丁', '口'],
  '以': ['人', '丶'],
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
  '亻': ['丿', '丨'],
  '尔': ['⺈', '小'],
  '丁': ['一', '亅'],
  '口': ['丨', '乛', '一'],
  '广': ['丶', '厂'],
  '廿': ['十', '十'],
  '又': ['乛', '丿', '丶'],
  '勺': ['勹', '丶'],
  '土': ['十', '一'],
  '厶': ['丿', '丶'],
  '厂': ['一', '丿'],
  '京': ['亠', '口', '小'],
  '力': ['𠃌', '丿'],
  '刂': ['丨', '亅'],
  '旦': ['日', '一'],
  '十': ['一', '丨'],
  '勹': ['丿', '乛'],
  '覀': ['一', '口', '儿'],
  '女': ['𡿨', '丿', '一'],
  '禺': ['日', '冂', '丨'],
  '心': ['丶', '乚', '丶'],
  '春': ['三', '人', '日'],
  '虫': ['口', '丨', '一', '丶'],
  '冂': ['丨', '乛'],
  '目': ['口', '二'],
  '二': ['一', '一'],
  '钅': ['丿', '一', '一', '一', '丨'],
  '名': ['夕', '口'],
  '尸': ['乛', '一', '丿'],
  '古': ['十', '口'],
  '三': ['一', '一', '一'],
  '夕': ['丿', '乛', '丶'],
  '亠': ['丶', '一'],
  '儿': ['丿', '乚'],
  '𠃌': ['丨', '乛'],
  '𡿨': ['乛', '丿'],
  '⺈': ['丿', '乛'],
  '⺄': ['乛', '丿'],
  '早': ['日', '十'],
  '化': ['亻', '匕'],
  '央': ['冂', '大'],
  '冖': ['丶', '乛'],
  '洛': ['氵', '各'],
  '各': ['夂', '口'],
  '夂': ['丿', '又'],
  '监': ['丨', '一', '皿'],
  '皿': ['丨', '乛', '丨', '一'],
  '溥': ['氵', '尃'],
  '尃': ['甫', '寸'],
  '甫': ['一', '丨', '乛', '一', '丨', '丶'],
  '生': ['丿', '一', '一', '丨', '一'],
  '令': ['人', '丶', '乛'],
  '具': ['目', '一', '八'],
  '斩': ['车', '斤'],
  '车': ['一', '乛', '丨'],
  '斤': ['丿', '丨', '一', '丨'],
  '鬼': ['丿', '田', '儿', '厶'],
  '因': ['囗', '大'],
  '囗': ['丨', '乛', '一'],
  '艮': ['乛', '一', '丨', '乀'],
  '夬': ['乛', '一', '人'],
  '曼': ['日', '罒', '又'],
  '罒': ['丨', '乛', '丨', '一'],
  '圣': ['又', '土'],
  '立': ['丶', '一', '丷', '一'],
  '亡': ['丶', '乛'],
  '刃': ['刀', '丶'],
  '中': ['口', '丨'],
  '刍': ['⺈', '彐'],
  '彐': ['乛', '一', '一'],
  '乍': ['丿', '一', '丨', '一'],
  '公': ['八', '厶'],
  '今': ['人', '丶', '乛'],
  '米': ['丷', '十', '八'],
  '氵': ['丶', '丶', '丶'],
  '釆': ['丿', '米'],
  '禾': ['丿', '木'],
  '和': ['禾', '口'],
  '是': ['日', '正'],
  '正': ['一', '丨', '一'],
  '在': ['一', '丨', '土'],
  '有': ['一', '丿', '月'],
  '才': ['一', '丿', '亅'],
  '寸': ['十', '丶'],
  '也': ['乛', '丨', '乚'],
  '地': ['土', '也'],
  '他': ['亻', '也'],
  '她': ['女', '也'],
  '好': ['女', '子'],
  '妈': ['女', '马'],
  '马': ['乛', '亅', '一'],
  '吗': ['口', '马'],
  '我': ['丿', '扌', '戈'],
  '扌': ['一', '亅', '一'],
  '戈': ['一', '乚', '丿', '丶'],
  '找': ['扌', '戈'],
  '们': ['亻', '门'],
  '门': ['丶', '丨', '乛'],
  '这': ['文', '辶'],
  '辶': ['丶', '乛', '乀'],
  '文': ['亠', '乂'],
  '乂': ['丿', '乀'],
  '那': ['刀', '阝'],
  '哪': ['口', '那'],
  '时': ['日', '寸'],
  '候': ['亻', '侯'],
  '侯': ['亻', '矢'],
  '矢': ['丿', '天'],
  '天': ['一', '大'],
  '者': ['耂', '日'],
  '耂': ['土', '丿'],
  '内': ['冂', '人'],
};

// ============================================================
// 表3：多音字表
// ============================================================
const DUOYIN = {
  '中': { pinyin: ['zhōng', 'zhòng'], hasYue: false, hasYan: false },
  '行': { pinyin: ['xíng', 'háng'], hasYue: false, hasYan: false },
  '重': { pinyin: ['zhòng', 'chóng'], hasYue: false, hasYan: false },
  '长': { pinyin: ['cháng', 'zhǎng'], hasYue: false, hasYan: false },
  '会': { pinyin: ['huì', 'kuài'], hasYue: false, hasYan: false },
  '为': { pinyin: ['wéi', 'wèi'], hasYue: false, hasYan: false },
  '好': { pinyin: ['hǎo', 'hào'], hasYue: false, hasYan: false },
  '还': { pinyin: ['hái', 'huán'], hasYue: false, hasYan: false },
  '只': { pinyin: ['zhī', 'zhǐ'], hasYue: false, hasYan: false },
  '种': { pinyin: ['zhǒng', 'zhòng'], hasYue: false, hasYan: false },
  '相': { pinyin: ['xiāng', 'xiàng'], hasYue: false, hasYan: false },
  '信': { pinyin: ['xìn', 'shēn'], hasYue: false, hasYan: false },
  '说': { pinyin: ['shuō', 'shuì', 'yuè'], hasYue: true, hasYan: true },
  '识': { pinyin: ['shí', 'zhì'], hasYue: false, hasYan: true },
  '读': { pinyin: ['dú', 'dòu'], hasYue: false, hasYan: true },
  '调': { pinyin: ['diào', 'tiáo'], hasYue: false, hasYan: true },
  '讲': { pinyin: ['jiǎng'], hasYue: false, hasYan: true },
  '论': { pinyin: ['lùn', 'lún'], hasYue: false, hasYan: true },
  '许': { pinyin: ['xǔ', 'hǔ'], hasYue: false, hasYan: true },
  '记': { pinyin: ['jì'], hasYue: false, hasYan: true },
  '让': { pinyin: ['ràng'], hasYue: false, hasYan: true },
  '请': { pinyin: ['qǐng'], hasYue: false, hasYan: true },
  '谢': { pinyin: ['xiè'], hasYue: false, hasYan: true },
  '认': { pinyin: ['rèn'], hasYue: false, hasYan: true },
  '谈': { pinyin: ['tán'], hasYue: false, hasYan: true },
  '话': { pinyin: ['huà'], hasYue: false, hasYan: true },
  '谁': { pinyin: ['shuí', 'shéi'], hasYue: false, hasYan: true },
  '诗': { pinyin: ['shī'], hasYue: false, hasYan: true },
  '谅': { pinyin: ['liàng'], hasYue: false, hasYan: true },
  '证': { pinyin: ['zhèng'], hasYue: false, hasYan: true },
  '试': { pinyin: ['shì'], hasYue: false, hasYan: true },
  '尽': { pinyin: ['jǐn', 'jìn'], hasYue: false, hasYan: false },
  '禁': { pinyin: ['jīn', 'jìn'], hasYue: false, hasYan: false },
  '劲': { pinyin: ['jìn', 'jìng'], hasYue: false, hasYan: false },
  '仅': { pinyin: ['jǐn', 'jìn'], hasYue: false, hasYan: false },
  '曰': { pinyin: ['yuē'], hasYue: true, hasYan: false },
  '得': { pinyin: ['dé', 'de', 'děi'], hasYue: false, hasYan: false },
  '的': { pinyin: ['de', 'dí', 'dì'], hasYue: false, hasYan: false },
};

// ============================================================
// 表4：偏旁表
// ============================================================
const PIANPANG = {
  '你': ['亻'], '仁': ['亻'], '但': ['亻'], '信': ['亻'], '何': ['亻'], '候': ['亻'], '侯': ['亻'],
  '谅': ['言'], '说': ['言'], '话': ['言'], '诗': ['言'],
  '谁': ['言'], '请': ['言'], '谢': ['言'], '认': ['言'],
  '识': ['言'], '谈': ['言'], '讲': ['言'], '论': ['言'],
  '许': ['言'], '记': ['言'], '让': ['言'], '调': ['言'],
  '证': ['言'], '试': ['言'],
  '明': ['日'], '日': ['日'], '旦': ['日'], '春': ['日'], '禺': ['日'],
  '时': ['日'], '早': ['日'], '者': ['日'],
  '相': ['木'], '木': ['木'], '李': ['木'], '柯': ['木'],
  '王': ['王'], '土': ['土'], '士': ['士'],
  '心': ['心'], '愚': ['心'],
  '女': ['女'], '要': ['女'],
  '力': ['力'], '别': ['力'],
  '口': ['口'], '可': ['口'], '古': ['口'], '名': ['口'], '虫': ['口'],
  '目': ['目'],
  '度': ['广'], '广': ['广'],
  '原': ['厂'], '厂': ['厂'],
  '去': ['土'], '厶': ['厶'],
  '钅': ['钅'], '铭': ['钅'],
  '居': ['尸'], '尸': ['尸'],
  '亻': ['亻'], '尔': ['尔'], '丁': ['丁'], '廿': ['廿'],
  '又': ['又'], '白': ['白'], '的': ['白'], '勺': ['勺'],
  '小': ['小'], '京': ['京'], '刂': ['刂'],
  '十': ['十'], '勹': ['勹'], '覀': ['覀'], '冂': ['冂'],
  '八': ['八'], '了': ['了'], '二': ['二'], '三': ['三'],
  '夕': ['夕'], '亠': ['亠'], '儿': ['儿'],
  '万': ['一'], '千': ['丿'], '不': ['一'], '大': ['大'],
  '人': ['人'], '以': ['人'], '再': ['一'],
  '曰': ['曰'],
  '兑': ['八'], '舌': ['口'], '寺': ['土'], '寸': ['寸'],
  '隹': ['亻'], '青': ['月'], '身': ['身'], '只': ['口'],
  '炎': ['火'], '火': ['火'], '井': ['一'], '仑': ['人'],
  '匕': ['匕'], '午': ['丿'], '己': ['己'], '上': ['一'],
  '周': ['冂'], '正': ['一'], '式': ['工'], '工': ['工'], '弋': ['弋'],
  '邯': ['阝'], '郸': ['阝'], '单': ['丷'], '阝': ['阝'],
  '得': ['彳'], '彳': ['彳'],
  '耂': ['土'], '内': ['冂'],
};

// ============================================================
// 表5：古音/通假异读表
// ============================================================
const ANCIENT_READ = {
  '原': [{ pinyin: 'yuàn', note: '通「愿」，忠厚、老实', source: '《孟子·尽心下》乡原' }],
  '说': [
    { pinyin: 'yuè', note: '通「悦」，高兴', source: '《论语》学而时习之，不亦说乎' },
    { pinyin: 'shuì', note: '游说', source: '《史记》' }
  ],
  '女': [{ pinyin: 'rǔ', note: '通「汝」，你', source: '《诗经》' }],
  '反': [{ pinyin: 'fǎn', note: '通「返」，返回', source: '《老子》' }],
  '知': [{ pinyin: 'zhì', note: '通「智」，智慧', source: '《论语》' }],
  '见': [{ pinyin: 'xiàn', note: '通「现」，出现', source: '《史记》' }],
  '亡': [{ pinyin: 'wú', note: '通「无」，没有', source: '《论语》' }],
  '蚤': [{ pinyin: 'zǎo', note: '通「早」', source: '《孟子》' }],
  '罢': [{ pinyin: 'pí', note: '通「疲」，疲倦', source: '《史记》' }],
  '有': [{ pinyin: 'yòu', note: '通「又」', source: '《论语》' }],
  '生': [{ pinyin: 'xìng', note: '通「性」', source: '《论语》' }],
  '然': [{ pinyin: 'rán', note: '通「燃」，燃烧', source: '《孟子》' }],
  '田': [{ pinyin: 'tián', note: '通「畋」，打猎', source: '《左传》' }],
  '陈': [{ pinyin: 'zhèn', note: '通「阵」，阵势', source: '《论语》' }],
  '取': [{ pinyin: 'qǔ', note: '通「娶」，娶妻', source: '《诗经》' }],
  '共': [
    { pinyin: 'gōng', note: '通「恭」，恭敬', source: '《左传》' },
    { pinyin: 'gòng', note: '通「供」，供给', source: '《左传》' }
  ],
  '归': [{ pinyin: 'kuì', note: '通「馈」，赠送', source: '《论语》' }],
  '能': [{ pinyin: 'nài', note: '通「耐」，耐得住', source: '《汉书》' }],
  '信': [{ pinyin: 'shēn', note: '通「伸」，伸展', source: '《孟子》' }],
  '党': [{ pinyin: 'tǎng', note: '通「倘」，倘若', source: '《荀子》' }],
  '填': [{ pinyin: 'zhèn', note: '通「镇」，镇守', source: '《史记》' }],
  '支': [{ pinyin: 'zhī', note: '通「肢」', source: '《易经》' }],
  '指': [{ pinyin: 'zhǐ', note: '通「旨」，意思', source: '《汉书》' }],
  '距': [{ pinyin: 'jù', note: '通「拒」，抗拒', source: '《孟子》' }],
  '错': [{ pinyin: 'cù', note: '通「措」，安放', source: '《论语》' }],
  '被': [{ pinyin: 'pī', note: '通「披」，披散', source: '《史记》' }],
};

// ============================================================
// 表6：同音字表
// ============================================================
const TONGYIN = {
  'yuan': ['元', '原', '园', '员', '圆', '援', '缘', '源', '远', '愿', '怨', '院', '苑', '媛', '袁', '猿', '辕', '塬', '沅', '芫', '瑗', '鸢', '鸳', '渊', '冤', '蜎', '箢', '鼋', '謜'],
  'yue': ['月', '曰', '约', '越', '跃', '岳', '悦', '阅', '粤', '钥', '乐', '药', '说', '樾', '钺', '龠', '瀹', '篗', '禴', '礿', '趯', '跞', '鸙'],
  'shuo': ['说', '硕', '朔', '搠', '蒴', '槊', '鎙'],
  'shui': ['水', '睡', '税', '说', '谁', '帨', '涚', '祱', '蜕', '裞'],
  'xin': ['心', '新', '信', '辛', '薪', '欣', '芯', '锌', '馨', '鑫', '忻', '莘', '炘', '昕', '衅', '囟', '妡', '杺', '盺'],
  'shen': ['身', '深', '神', '申', '伸', '审', '甚', '什', '沈', '婶', '参', '莘', '呻', '绅', '砷', '燊', '谂', '诜', '侁', '妽', '屾', '愼', '曑', '槮', '渖', '甡', '籸', '糁', '罙', '葠', '裑', '鰰'],
  'liang': ['两', '亮', '量', '良', '凉', '梁', '粮', '辆', '谅', '晾', '粱', '踉', '莨', '蜋', '輬'],
  'jing': ['京', '经', '精', '睛', '惊', '景', '警', '境', '竟', '敬', '静', '净', '镜', '径', '竞', '劲', '荆', '茎', '晶', '鲸', '兢', '井', '颈', '阱', '肼', '刭', '憬', '璟', '儆', '迳', '痉', '菁', '箐', '獍', '婧', '婛', '旍', '泾', '烃'],
  'jin': ['金', '今', '斤', '进', '近', '尽', '紧', '仅', '禁', '劲', '巾', '襟', '津', '筋', '谨', '锦', '瑾', '槿', '馑', '靳', '觐', '烬', '荩', '赆', '妗', '衿', '矜', '缙', '噤', '堇', '侭'],
  'yi': ['一', '以', '已', '义', '议', '衣', '医', '依', '仪', '宜', '移', '疑', '遗', '意', '易', '益', '溢', '逸', '役', '疫', '亦', '异', '翼', '翌', '艺', '忆', '亿', '抑', '译', '驿', '绎', '弈', '奕', '怡', '贻', '饴', '颐', '彝', '倚', '椅', '旖', '漪', '猗', '噫', '瘗', '癔', '翊', '熠', '镒', '劓', '殪', '缢', '蜴', '舣', '苡', '荑', '薏', '螠', '衤'],
  'zhong': ['中', '忠', '钟', '终', '种', '众', '重', '仲', '肿', '踵', '冢', '螽', '舯', '妕', '柊', '狆', '筗', '蔠', '蚛', '蹱', '鈡', '锺'],
  'zhang': ['长', '张', '章', '掌', '涨', '帐', '账', '仗', '杖', '障', '嶂', '樟', '彰', '璋', '漳', '嫜', '鄣', '幛', '胀', '瘴', '仉'],
  'hao': ['好', '号', '毫', '豪', '浩', '皓', '耗', '嚎', '壕', '濠', '嗥', '貉', '蚝', '颢', '昊', '灏', '镐', '郝', '薅', '嚆', '皞', '秏', '聕', '茠', '薃', '蠔', '諕', '譹'],
  'xian': ['先', '现', '线', '显', '县', '限', '险', '鲜', '献', '宪', '贤', '闲', '嫌', '弦', '咸', '衔', '舷', '涎', '陷', '馅', '羡', '腺', '苋', '霰', '岘', '筅', '跹', '铣', '锨', '蚬', '跣', '酰', '痫', '鹇', '痃'],
  'xing': ['性', '行', '形', '型', '星', '兴', '姓', '幸', '刑', '醒', '腥', '猩', '惺', '杏', '荇', '悻', '硎', '陉', '邢', '饧', '涬'],
  'zhi': ['知', '之', '只', '直', '值', '指', '纸', '志', '治', '制', '质', '至', '致', '置', '智', '止', '址', '职', '植', '殖', '执', '肢', '枝', '支', '芝', '汁', '织', '脂', '蜘', '侄', '帜', '帙', '栉', '桎', '轾', '痣', '痔', '趾', '芷', '祉', '祗', '黹', '忮', '彘', '贽', '踬', '轵', '陟', '骘', '鸷', '酯', '徵'],
  'zi': ['子', '自', '字', '资', '姿', '滋', '兹', '紫', '仔', '籽', '梓', '滓', '恣', '渍', '訾', '觜', '趑', '嵫', '孳', '缁', '辎', '锱', '髭', '鲻', '赀'],
  'ren': ['人', '仁', '认', '任', '忍', '刃', '纫', '韧', '饪', '轫', '仞', '荏', '壬', '妊', '衽', '稔'],
  'ming': ['名', '明', '命', '鸣', '铭', '冥', '溟', '螟', '暝', '瞑', '茗', '酩', '皿', '眀'],
  'han': ['汉', '寒', '含', '喊', '韩', '汗', '旱', '焊', '罕', '翰', '瀚', '函', '涵', '憨', '撼', '憾', '悍', '捍', '酣', '鼾', '邯'],
  'dan': ['但', '单', '担', '胆', '旦', '弹', '淡', '蛋', '诞', '耽', '郸', '惮', '殚', '箪', '聃', '儋', '萏', '啖', '氮'],
  'he': ['和', '何', '河', '合', '喝', '盒', '禾', '荷', '鹤', '贺', '赫', '褐', '呵', '阖', '涸', '貉', '阂', '曷', '盍', '龁'],
  'de': ['得', '德', '的', '地'],
  'chong': ['冲', '充', '虫', '宠', '崇', '忡', '憧', '艟', '茺', '珫', '种'],
  'zhong2': ['众', '仲', '种', '重', '肿'],
  'di': ['的', '地', '第', '低', '底', '弟', '敌', '抵', '递', '帝', '缔', '堤', '滴', '迪', '笛', '涤', '嘀', '嫡', '氐', '邸', '诋', '谛', '砥', '骶'],
  'dei': ['得'],
};

// ============================================================
// 表7：常用字表
// ============================================================
const COMMON_CHARS = new Set([
  '一','二','三','四','五','六','七','八','九','十','百','千','万','亿',
  '你','我','他','她','它','们','的','地','得','了','着','过','是','不','在','有','和','与','或','但','而','也','都','就','还','只','又','很','太','更','最','非','常','比','较','真','假','好','坏','大','小','多','少','高','低','长','短','新','旧','快','慢','早','晚','远','近','深','浅','厚','薄','轻','重',
  '人','民','男','女','老','少','父','母','儿','子','兄','弟','姐','妹','朋','友','同','学','师','医','工','农','商','军','警',
  '天','地','日','月','星','云','风','雨','雪','雷','电','山','水','河','海','江','湖','田','土','石','沙','金','银','铜','铁','木','火','春','夏','秋','冬','年','时','分','秒','朝','夕','昼','夜','晨','昏',
  '上','下','左','右','中','东','南','西','北','前','后','里','外','内','间','旁','边','角','顶','底','头','尾','首','末','始','终',
  '口','手','足','目','耳','鼻','舌','牙','心','肝','肺','肾','胃','肠','脑','骨','肉','血','皮','毛','发',
  '说','话','讲','谈','论','议','评','批','判','证','试','许','记','让','调','请','谢','认','识','读','谅','诗','谁','语','词','译','讽','讯','训','访','设','诉','诊','注','诚','该','诞','询','详','诫','诬','误','诱','诲','课','诽','谊','谋','谍','谎','谏','谐','谑','谒','谓','谔','谕','谖','谗','谙','谚','谛','谜','谟','谠','谡','谣','谤','谦','谧','谨','谩','谪','谫','谬','谭','谮','谯','谰','谱','谲','谳','谴','谵','谶',
  '曰','明','暗','阳','阴','期','朋','服','腾','朦','胧','青','静','清','晴','情','精','睛','蜻','鲭',
  '字','句','文','章','歌','赋','曲','音','乐','声','韵','律','节','奏','唱','吟','诵','写','画','书','法','笔','墨','纸','砚','印',
  '意','志','愿','想','念','思','忆','忘','怀','恋','爱','恨','仇','恩','怨','喜','怒','哀','悲','欢','离','合','聚','散','生','死','病','苦','甜','酸','辣','咸','淡',
  '仁','义','礼','智','信','忠','孝','廉','耻','勇','善','恶','非','对','错','正','邪','公','私','直','曲','美','丑',
  '辰','霜','雾','露','冰','雹','虹','霞','气','光','影','色','香','味','触',
  '王','李','张','刘','陈','杨','黄','赵','周','吴','徐','孙','马','朱','胡','郭','何','高','林','罗','郑','梁','宋','唐','韩','冯','邓','曹','彭','曾','肖','董','袁','潘','于','蒋','蔡','余','杜','叶','程','苏','魏','吕','丁','任','沈','姚','卢','姜','崔','钟','陆','汪','范','石','廖','贾','夏','韦','付','方','白','邹','孟','熊','秦','邱','江','尹','薛','闫','段','雷','侯','龙','史','陶','黎','贺','顾','毛','郝','龚','邵','严','覃','武','戴','莫','孔','向','汤',
  '邯','郸','甘','单','阝','入','八','个','介','久','少','分','几','懂','得','何','重','田','里','千','忄','艹','彳','可','早','化','央','冖','洛','各','夂','监','皿','溥','尃','甫','生','令','具','斩','车','斤','鬼','因','囗','艮','夬','曼','罒','圣','立','亡','刃','中','刍','彐','乍','公','今','米','氵','釆','禾','和','是','在','才','寸','也','我','扌','戈','找','们','门','这','辶','文','乂','那','哪','候','侯','矢','天','者','耂','内'
]);

const PUNCT = new Set(['，', '。', '、', '；', '：', '？', '！', '“', '”', '‘', '’', '（', '）', '《', '》', ' ', '\n', '\t']);

// ============================================================
// 工具函数
// ============================================================
function splitOneLevel(char) {
  const parts = CHAR_SPLIT[char];
  if (!parts) return [char];
  return parts;
}

function hasPieNaPair(parts) {
  let pieIndex = -1, naIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    if (PIE.has(parts[i]) && pieIndex === -1) pieIndex = i;
    if (NA.has(parts[i]) && naIndex === -1) naIndex = i;
  }
  return pieIndex !== -1 && naIndex !== -1 && pieIndex < naIndex;
}

function hasQiQiPair(parts) {
  let count = 0;
  for (let i = 0; i < parts.length; i++) {
    if (normalizeStroke(parts[i]) === '7') count++;
  }
  return count >= 2;
}

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

function containsPart(char, target, depth) {
  depth = depth || 0;
  if (depth > 10) return false;
  if (char === target) return true;
  if (CHAR_SPLIT[char]) {
    const parts = CHAR_SPLIT[char];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === char) continue;
      if (containsPart(parts[i], target, depth + 1)) return true;
    }
  }
  return false;
}

// ★ 日算曰
function containsYue(char) {
  return containsPart(char, '曰') || containsPart(char, '月') || containsPart(char, '日');
}

function containsYan(char) {
  return containsPart(char, '言') || containsPart(char, '讠');
}

function hasYue(char) {
  if (DUOYIN[char] && DUOYIN[char].hasYue) return true;
  return containsYue(char);
}

function hasYan(char) {
  if (DUOYIN[char] && DUOYIN[char].hasYan) return true;
  const pps = PIANPANG[char] || [];
  return pps.indexOf('言') !== -1 || pps.indexOf('讠') !== -1 || containsYan(char);
}

function findDuoyin(char) { return DUOYIN[char] || null; }
function hasAncient(char) { return !!(ANCIENT_READ[char] && ANCIENT_READ[char].length); }
function isRare(char) { return !COMMON_CHARS.has(char); }

// ★ 查多音字的同音字里，有没有含曰/言字旁的
// 返回 { pinyin, char } 或 null
function findDuoyinYue(char) {
  const d = DUOYIN[char];
  if (!d) return null;
  for (let i = 0; i < d.pinyin.length; i++) {
    const py = stripTone(d.pinyin[i]);
    const list = TONGYIN[py] || [];
    for (let j = 0; j < list.length; j++) {
      const c = list[j];
      if (c === char) continue;
      if (containsYue(c) || containsYan(c)) {
        return { pinyin: d.pinyin[i], char: c };
      }
    }
  }
  return null;
}

// ★ 有效多音字：本身含曰/言，或同音字里有含曰/言
function hasValidDuoyin(char) {
  const d = DUOYIN[char];
  if (!d) return false;
  if (hasYue(char) || hasYan(char)) return true;
  return !!findDuoyinYue(char);
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

function stripTone(pinyin) {
  const map = {
    'ā':'a','á':'a','ǎ':'a','à':'a',
    'ē':'e','é':'e','ě':'e','è':'e',
    'ī':'i','í':'i','ǐ':'i','ì':'i',
    'ō':'o','ó':'o','ǒ':'o','ò':'o',
    'ū':'u','ú':'u','ǔ':'u','ù':'u',
    'ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v','ü':'v',
    'ń':'n','ň':'n','ǹ':'n'
  };
  let out = '';
  for (const c of pinyin) out += map[c] || c;
  return out;
}

const DUOYIN_MODERN = {
  '原': ['yuán'], '说': ['shuō', 'shuì', 'yuè'], '曰': ['yuē'], '月': ['yuè'],
  '明': ['míng'], '谅': ['liàng'], '信': ['xìn'], '心': ['xīn'], '身': ['shēn'],
  '中': ['zhōng', 'zhòng'], '长': ['cháng', 'zhǎng'], '好': ['hǎo', 'hào'],
  '尽': ['jǐn', 'jìn'], '禁': ['jīn', 'jìn'], '劲': ['jìn', 'jìng'], '仅': ['jǐn', 'jìn'],
  '京': ['jīng'], '金': ['jīn'], '一': ['yī'], '以': ['yǐ'], '之': ['zhī'],
  '王': ['wáng', 'wàng'], '知': ['zhī', 'zhì'], '见': ['jiàn', 'xiàn'],
  '邯': ['hán'], '郸': ['dān'], '几': ['jǐ', 'jī'],
  '重': ['zhòng', 'chóng'], '得': ['dé', 'de', 'děi'], '何': ['hé'], '的': ['de', 'dí', 'dì'],
};

// ============================================================
// 递归展开（只标曰落点）
// ============================================================
function expandRecursive(char, depth, lines, prefix) {
  depth = depth || 0;
  lines = lines || [];
  prefix = prefix || '';
  if (depth > 8) { lines.push(prefix + char + ' （超深）'); return lines; }

  const parts = CHAR_SPLIT[char];
  const modern = DUOYIN_MODERN[char] || null;
  const ancient = ANCIENT_READ[char] || [];

  if (!parts) {
    lines.push(prefix + char + ' <span class="plain">（无拆解，拆不动）</span>');
    return lines;
  }

  let tags = [];
  if (hasValidDuoyin(char)) tags.push('多音字（含曰/言）');
  if (modern && modern.length > 1 && !hasValidDuoyin(char)) tags.push('多音字（不含曰/言，走部首）');
  if (ancient.length) tags.push('古音/通假');
  if (hasYue(char)) tags.push('含曰/月/日');
  if (hasYan(char)) tags.push('含言字旁');
  const tagStr = tags.length ? ' <span class="warn">[' + tags.join(' + ') + ']</span>' : '';

  lines.push(prefix + char + tagStr);
  if (modern) lines.push(prefix + '  <span class="plain">读音：' + modern.join(' / ') + '</span>');
  ancient.forEach(function(a) {
    lines.push(prefix + '  <span class="plain">古音：' + a.pinyin + '  ' + a.note + '</span>');
  });

  if (hasYue(char)) {
    const yueNext = findYueNext(char);
    if (yueNext) {
      lines.push(prefix + '  <span class="yue">→ 曰落点：曰' + yueNext + '</span>');
    }
  }

  parts.forEach(function(part, i) {
    const isLast = i === parts.length - 1;
    const branch = isLast ? '└─ ' : '├─ ';
    const nextPrefix = prefix + (isLast ? '   ' : '│  ');

    const norm = normalizeStroke(part);
    const isQi = norm === '7' && part !== '7';
    let display = part;
    if (isQi) display = part + ' → 7';
    const qiMark = isQi ? ' <span class="chain-qi">（带钩）</span>' : '';

    lines.push(prefix + branch + display + qiMark);
    if (part !== char && CHAR_SPLIT[part]) {
      expandRecursive(part, depth + 1, lines, nextPrefix + '   ');
    } else if (KONG.has(norm)) {
      lines.push(nextPrefix + '   <span class="empty">' + norm + ' → 归空</span>');
    }
  });

  return lines;
}

function findYueNext(char, depth) {
  depth = depth || 0;
  if (depth > 10) return null;
  const parts = CHAR_SPLIT[char];
  if (!parts) return null;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '曰') {
      if (i + 1 < parts.length) return parts[i + 1];
      return '一';
    }
  }
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === char) continue;
    const r = findYueNext(parts[i], depth + 1);
    if (r) return r;
  }
  return null;
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

  log.push('');
  log.push('<span class="step">【第1步：去标点】</span>');
  let noPunct = '';
  for (let i = 0; i < raw.length; i++) {
    if (!PUNCT.has(raw[i])) noPunct += raw[i];
  }
  log.push('  去掉标点后：' + noPunct);

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

  log.push('');
  log.push('<span class="step">【第3步：先查古音/有效多音字/曰/言（有则保留），没有的只拆一层判自对合】</span>');

  const kept2 = [];
  const selfRemoved = [];

  kept.forEach(function(c) {
    const hasPriority = hasAncient(c) || hasValidDuoyin(c) || hasYue(c) || hasYan(c);

    if (hasPriority) {
      kept2.push(c);
      const reasons = [];
      if (hasAncient(c)) reasons.push('古音/通假');
      if (hasValidDuoyin(c)) {
        const dy = findDuoyinYue(c);
        if (dy) reasons.push('多音字（通过同音字「' + dy.char + '」→' + dy.pinyin + '）');
        else reasons.push('有效多音字（含曰/言）');
      }
      if (hasYue(c)) reasons.push('含曰/月/日');
      if (hasYan(c)) reasons.push('含言字旁');
      log.push('  <span class="hit">' + c + '</span> 有 [' + reasons.join(' + ') + '] → 保留，不判自对合');
      return;
    }

    if (findDuoyin(c) && !hasValidDuoyin(c)) {
      log.push('  <span class="plain">' + c + '</span> 是多音字但同音字里没有含曰/言的 → 按普通字处理');
    }

    const parts = splitOneLevel(c);
    let onlySelf = true;
    for (let i = 0; i < parts.length; i++) {
      if (!KONG.has(normalizeStroke(parts[i]))) { onlySelf = false; break; }
    }
    const hasPn = containsPieNa(c);
    const hasQq = containsQiQi(c);
    if (hasPn || hasQq) onlySelf = true;

    if (onlySelf) {
      const marks = [];
      if (hasPn) marks.push('撇捺对');
      if (hasQq) marks.push('7对');
      const mark = marks.length ? '（含' + marks.join(' + ') + '）' : '';
      selfRemoved.push({ char: c, parts: parts, mark: mark });
    } else {
      kept2.push(c);
    }
  });

  selfRemoved.forEach(function(item) {
    log.push('  <span class="gone">' + item.char + '</span> = ' + item.parts.join(' + ') + ' ' + item.mark + ' → 自对合 → 归空');
  });
  if (!selfRemoved.length) log.push('  （无自对合字）');
  log.push('  保留：' + (kept2.length ? kept2.map(function(c) { return '<span class="hit">' + c + '</span>'; }).join(' ') : '（空）'));

  log.push('');
  log.push('<span class="step">【第4步：对保留的字分类】</span>');

  const yueChars = [];
  const duoyinChars = [];
  const yanChars = [];
  const remaining = [];

  kept2.forEach(function(c) {
    if (hasYue(c)) yueChars.push(c);
    else if (hasValidDuoyin(c) && hasYan(c)) duoyinChars.push(c);
    else if (hasYan(c)) yanChars.push(c);
    else if (hasAncient(c) || hasValidDuoyin(c)) duoyinChars.push(c);
    else remaining.push(c);
  });

  log.push('  <span class="yue">含「曰」的字：</span>' + (yueChars.length ? yueChars.join(' ') : '（无）'));
  log.push('  <span class="duo">含古音/有效多音字：</span>' + (duoyinChars.length ? duoyinChars.join(' ') : '（无）'));
  log.push('  <span class="pian">含言字旁的字：</span>' + (yanChars.length ? yanChars.join(' ') : '（无）'));
  log.push('  剩下的字：' + (remaining.length ? remaining.join(' ') : '（无）'));

  duoyinChars.forEach(function(c) {
    const d = findDuoyin(c);
    if (d) log.push('    ' + c + ' 读音：' + d.pinyin.join(' / '));
    const a = ANCIENT_READ[c];
    if (a) a.forEach(function(x) { log.push('    ' + c + ' 古音：' + x.pinyin + '  ' + x.note); });
    const dy = findDuoyinYue(c);
    if (dy) log.push('    → 同音字「' + dy.char + '」含曰/言（' + dy.pinyin + '）');
  });

  log.push('');
  log.push('<span class="step">【第5步：递归展开拆解链（只标曰落点）】</span>');

  const allChars = yueChars.concat(duoyinChars, yanChars, remaining);
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

  // ===== 第6步：汇总整句曰落点 =====
  log.push('');
  log.push('<span class="step">【第6步：汇总整句「曰」落点】</span>');

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
    log.push('');
    log.push('  <span class="warn">本句没有曰落点 → 说明还没拆到位</span>');
    log.push('  <span class="warn">需要继续找多音字或同音字，直到拆出「曰」</span>');
    log.push('  <span class="warn">本句暂不归空</span>');
  } else {
    log.push('');
    log.push('  整句曰落点串：<span class="string">' + allPoints.join(' · ') + '</span>');

    const reconciled = reconcileYuePoints(allPoints);
    log.push('');
    log.push('  约分（相同落点成对约掉）：');
    if (reconciled.length === 0) {
      log.push('  <span class="warn">全部约掉 → 说明句子还有多音字没拆出来，需继续找</span>');
      log.push('  <span class="warn">本句暂不归空</span>');
    } else {
      reconciled.forEach(function(r) {
        log.push('  ' + r.point + ' × ' + r.count + '（奇数，保留 1 个）');
      });
      log.push('');
      log.push('  <span class="yue">整句曰什么：</span>');
      reconciled.forEach(function(r) {
        log.push('  <span class="string">' + r.point + ' = ？</span>');
      });
      log.push('  <span class="plain">（请填空，把曰后面填上，就是整句的「曰什么」）</span>');
      hasYueResult = true;
    }
  }

  // ===== 第7步：落一丨十 · 约分 =====
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

  log.push('');
  log.push('<span class="step">【最终结果】</span>');
  if (hasYueResult) {
    log.push('  <span class="empty">空 = 空 ✓ 对合上了</span>');
  } else {
    log.push('  <span class="warn">本句没有有效的曰落点 → 暂不归空</span>');
    log.push('  <span class="warn">需要继续补多音字/同音字，直到拆出曰</span>');
  }

  document.getElementById('output').innerHTML = log.join('\n');
}

document.getElementById('btnRun').addEventListener('click', run);
document.getElementById('btnClear').addEventListener('click', function() {
  document.getElementById('input').value = '';
  document.getElementById('output').textContent = '等待输入…';
});
document.getElementById('btnSample').addEventListener('click', function() {
  const samples = ['你可以大度的去原谅别人', '但千万不要愚蠢的再相信', '邯郸', '不懂几何者不得入内', '懂', '何得'];
  const pick = samples[Math.floor(Math.random() * samples.length)];
  document.getElementById('input').value = pick;
  run();
});

run();