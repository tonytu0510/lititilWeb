// 背景星星
        (function() {
            const bg = document.getElementById('starsBg');
            const stars = '★☆✯✪✶✷✹✺';
            for (let i = 0; i < 30; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.textContent = stars[Math.floor(Math.random() * stars.length)];
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.fontSize = (8 + Math.random() * 16) + 'px';
                star.style.animationDelay = Math.random() * 3 + 's';
                star.style.animationDuration = (2 + Math.random() * 4) + 's';
                bg.appendChild(star);
            }
        })();

        // 当前模式：'pair' 或 'single'
        let currentMode = 'pair';

        function switchMode(mode) {
            currentMode = mode;
            const tabs = document.querySelectorAll('.lang-tab');
            tabs.forEach(t => t.classList.remove('active'));

            if (mode === 'pair') {
                tabs[0].classList.add('active');
                document.getElementById('pairInputs').style.display = 'flex';
                document.getElementById('singleInput').classList.remove('show');
                document.getElementById('checkBtn').textContent = '开 始 验 算';
            } else {
                tabs[1].classList.add('active');
                document.getElementById('pairInputs').style.display = 'none';
                document.getElementById('singleInput').classList.add('show');
                document.getElementById('checkBtn').textContent = '开 始 自 测';
            }
        }

        // 判断是否为中文
        function hasChinese(str) {
            return /[\u4e00-\u9fa5]/.test(str);
        }

        // 对合数字映射表
        const HEHE_MAP = {
            'a': [3], 'b': [8], 'c': [6], 'd': [3, 8], 'e': [3],
            'f': [6], 'g': [3, 9], 'h': [4], 'i': [3], 'j': [2],
            'k': [4], 'l': [7], 'm': [2, 9], 'n': [3, 8], 'o': [3],
            'p': [9], 'q': [8], 'r': [2, 3], 's': [2], 't': [6],
            'u': [5], 'v': [5], 'w': [5], 'x': [10], 'y': [3], 'z': [2, 5],
            'A': [5], 'B': [8], 'C': [6], 'D': [0], 'E': [3],
            'F': [6], 'G': [9], 'H': [4], 'I': [1], 'J': [2, 9],
            'K': [4], 'L': [7], 'M': [2], 'N': [5, 8], 'O': ['/0'],
            'P': [9], 'Q': [8], 'R': [2, 7], 'S': [2], 'T': [6],
            'U': [5], 'V': [5], 'W': [5], 'X': [10], 'Y': [1, 5, 6], 'Z': [2, 5]
        };

        const NG_LIST = ['ang', 'iang', 'uang', 'eng', 'ing', 'ueng', 'ong', 'iong'];
        const VOWELS_EN = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

        // 中文拼音映射
        function getPinyin(char) {
            const map = {
                '赵': 'zhao', '钱': 'qian', '孙': 'sun', '李': 'li', '周': 'zhou', '吴': 'wu',
                '郑': 'zheng', '王': 'wang', '冯': 'feng', '陈': 'chen', '卫': 'wei', '蒋': 'jiang',
                '沈': 'shen', '韩': 'han', '杨': 'yang', '朱': 'zhu', '秦': 'qin', '许': 'xu',
                '何': 'he', '吕': 'lv', '张': 'zhang', '孔': 'kong', '曹': 'cao', '严': 'yan',
                '华': 'hua', '金': 'jin', '魏': 'wei', '陶': 'tao', '姜': 'jiang', '谢': 'xie',
                '邹': 'zou', '喻': 'yu', '苏': 'su', '潘': 'pan', '葛': 'ge', '范': 'fan',
                '彭': 'peng', '鲁': 'lu', '马': 'ma', '方': 'fang', '俞': 'yu', '任': 'ren',
                '袁': 'yuan', '柳': 'liu', '史': 'shi', '唐': 'tang', '薛': 'xue', '雷': 'lei',
                '贺': 'he', '罗': 'luo', '郝': 'hao', '常': 'chang', '于': 'yu', '齐': 'qi',
                '康': 'kang', '顾': 'gu', '黄': 'huang', '萧': 'xiao', '姚': 'yao', '汪': 'wang',
                '毛': 'mao', '狄': 'di', '米': 'mi', '戴': 'dai', '宋': 'song', '庞': 'pang',
                '熊': 'xiong', '纪': 'ji', '董': 'dong', '梁': 'liang', '杜': 'du', '贾': 'jia',
                '江': 'jiang', '郭': 'guo', '林': 'lin', '钟': 'zhong', '徐': 'xu', '高': 'gao',
                '蔡': 'cai', '田': 'tian', '胡': 'hu', '凌': 'ling', '万': 'wan', '卢': 'lu',
                '邓': 'deng', '洪': 'hong', '石': 'shi', '龚': 'gong', '程': 'cheng', '陆': 'lu',
                '荣': 'rong', '段': 'duan', '焦': 'jiao', '谷': 'gu', '侯': 'hou', '刘': 'liu',
                '龙': 'long', '叶': 'ye', '白': 'bai', '卓': 'zhuo', '屠': 'tu', '蒙': 'meng',
                '习': 'xi', '居': 'ju', '耿': 'geng', '国': 'guo', '东': 'dong', '聂': 'nie',
                '关': 'guan', '红': 'hong', '刚': 'gang', '光': 'guang', '明': 'ming', '敏': 'min',
                '杰': 'jie', '军': 'jun', '鹏': 'peng', '飞': 'fei', '婷': 'ting', '涛': 'tao',
                '悦': 'yue', '果': 'guo', '泽': 'ze', '近': 'jin', '平': 'ping', '丽': 'li',
                '媛': 'yuan', '恩': 'en', '来': 'lai', '超': 'chao', '德': 'de', '克': 'ke',
                '清': 'qing', '少': 'shao', '奇': 'qi', '美': 'mei', '小': 'xiao', '若': 'ruo',
                '木': 'mu', '瑞': 'rui', '月': 'yue', '琴': 'qin', '开': 'kai', '慧': 'hui',
                '子': 'zi', '珍': 'zhen', '青': 'qing', '静': 'jing', '磊': 'lei', '琳': 'lin',
                '鑫': 'xin', '淼': 'miao', '森': 'sen', '焱': 'yan', '垚': 'yao', '晶': 'jing',
                '品': 'pin', '众': 'zhong', '皇': 'huang', '后': 'hou', '棣': 'di', '妙': 'miao',
                '云': 'yun', '彻': 'che', '夫': 'fu', '妙': 'miao', '若': 'ruo', '文': 'wen',
                '广': 'guang', '学': 'xue', '良': 'liang', '宇': 'yu', '浩': 'hao', '然': 'ran',
                '天': 'tian', '一': 'yi', '鸣': 'ming'
            };
            return map[char] || '';
        }

        // 中文名提取辅音
        function extractConsonantsCN(name) {
            let consonants = '';
            for (let char of name) {
                let pinyin = getPinyin(char);
                if (pinyin) {
                    let clean = pinyin.replace(/[1-4]/g, '');
                    for (let ng of NG_LIST) {
                        if (clean.endsWith(ng)) {
                            clean = clean.slice(0, -ng.length);
                            break;
                        }
                    }
                    if (clean) consonants += clean[0];
                }
            }
            return consonants;
        }

        // 英文名提取辅音
        function extractConsonantsEN(name) {
            let consonants = '';
            for (let ch of name) {
                if (!VOWELS_EN.includes(ch) && ch !== ' ') {
                    consonants += ch;
                }
            }
            return consonants;
        }

        // 智能提取：自动判断中英文
        function extractConsonants(name) {
            if (!name) return '';
            if (hasChinese(name)) {
                return extractConsonantsCN(name);
            } else {
                return extractConsonantsEN(name);
            }
        }

        // 走对合环
        function toHeheNumbers(consonants) {
            let upper = consonants.toUpperCase();
            let numbers = [];
            let details = [];
            for (let ch of upper) {
                if (HEHE_MAP[ch]) {
                    let nums = HEHE_MAP[ch];
                    let chosen = nums[0];
                    if (nums.includes(9)) chosen = 9;
                    if (nums.includes(6) && !nums.includes(9)) chosen = 6;
                    numbers.push(chosen);
                    details.push(`${ch}→${chosen}`);
                } else {
                    details.push(`${ch}→?`);
                }
            }
            return { numbers, details };
        }

        function check69(numbers) {
            return numbers.includes(6) && numbers.includes(9);
        }

        function checkPair() {
            let nameA, nameB, isSingle = false;

            if (currentMode === 'single') {
                nameA = document.getElementById('nameSingle').value.trim();
                nameB = '';
                isSingle = true;
            } else {
                nameA = document.getElementById('nameA').value.trim();
                nameB = document.getElementById('nameB').value.trim();
            }

            const btn = document.getElementById('checkBtn');

            if (!nameA) {
                alert('请输入姓名');
                return;
            }
            if (!isSingle && !nameB) {
                alert('请输入两个姓名');
                return;
            }

            btn.classList.add('loading');
            btn.textContent = '';

            setTimeout(() => {
                const consA = extractConsonants(nameA);
                const consB = isSingle ? '' : extractConsonants(nameB);
                const combined = consA + consB;
                const { numbers, details } = toHeheNumbers(combined);
                const isZero = check69(numbers);

                showResult(nameA, nameB, consA, consB, combined, details, numbers, isZero, isSingle);

                btn.classList.remove('loading');
                btn.textContent = currentMode === 'single' ? '再 测 一 次' : '再 测 一 次';
            }, 1000);
        }

        function showResult(nameA, nameB, consA, consB, combined, details, numbers, isZero, isSingle) {
            const resultDiv = document.getElementById('result');
            const icon = document.getElementById('resultIcon');
            const title = document.getElementById('resultTitle');
            const detail = document.getElementById('resultDetail');
            const steps = document.getElementById('steps');

            resultDiv.classList.add('show');

            if (isZero) {
                icon.textContent = '★';
                icon.style.color = '#f0d060';
                icon.style.textShadow = '0 0 30px rgba(240, 208, 96, 0.5)';
                title.textContent = isSingle ? '自对合归零 · 自身圆满' : '对合归零 · 完全对冲';
                title.className = 'result-title zero';
                if (isSingle) {
                    detail.innerHTML = `
                        <p>${nameA}</p>
                        <p>自身对合数字序列同时包含<span>6和9</span></p>
                        <p>69归零 · 自归零 · 无需配对</p>
                    `;
                } else {
                    detail.innerHTML = `
                        <p>${nameA} 与 ${nameB}</p>
                        <p>在对合环意义上<span>完全对冲</span></p>
                        <p>69归零 · 中心0</p>
                    `;
                }
            } else {
                const has6 = numbers.includes(6);
                const has9 = numbers.includes(9);
                let reason = '';
                if (has6 && !has9) reason = '有合(6)无久(9)';
                else if (!has6 && has9) reason = '有久(9)无合(6)';
                else reason = '无合(6)无久(9)';

                icon.textContent = '✶';
                icon.style.color = '#e8384f';
                icon.style.textShadow = '0 0 20px rgba(232, 56, 79, 0.4)';
                title.textContent = '未归零 · ' + reason;
                title.className = 'result-title not-zero';

                if (isSingle) {
                    detail.innerHTML = `
                        <p>${nameA}</p>
                        <p>对合数字序列：<span>[${numbers.join(', ')}]</span></p>
                        <p>${reason} · 需配对补全</p>
                    `;
                } else {
                    detail.innerHTML = `
                        <p>${nameA} 与 ${nameB}</p>
                        <p>对合数字序列：<span>[${numbers.join(', ')}]</span></p>
                        <p>${reason}</p>
                    `;
                }
            }

            const typeLabel = hasChinese(nameA + nameB) ? '中文' : '英文';
            const consALabel = consA || '(空)';
            const consBLabel = isSingle ? '' : `，${nameB} → ${consB || '(空)'}`;
            const combinedLabel = combined || '(空)';

            steps.innerHTML = `
                <div class="divider">验算过程（${typeLabel}模式）</div>
                <p><span class="step-num">★</span> 辅音骨架：${nameA} → ${consALabel}${consBLabel}</p>
                <p><span class="step-num">★</span> 拼接：${isSingle ? consA : consA + ' + ' + consB} = ${combinedLabel}</p>
                <p><span class="step-num">★</span> 对合环第一圈（大写）：${combined.toUpperCase() || '(空)'}</p>
                <p><span class="step-num">★</span> 对合数字：${details.join(', ') || '(无)'}</p>
                <p><span class="step-num">★</span> 69规则：${isZero ? '6和9同时出现 → 归中心0 ★' : '未同时出现6和9 → 未归零'}</p>
            `;

            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                checkPair();
            }
        });