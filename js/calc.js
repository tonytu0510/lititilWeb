// ===== B：数字相同的全部约分 =====
  // 只保留出现 1 次的数字
  // 0 和 1 都丢掉
  function ruleB(numStr){
    const arr = numStr.split('');
    const count = new Map();
    for (const item of arr) {
      count.set(item, (count.get(item) || 0) + 1);
    }
    const result = [];
    for (const [item, times] of count) {
      if (times === 1 && item !== '0' && item !== '1') {
        result.push(item);
      }
    }
    return result.join('');
  }

  // ===== A：奇偶规则 =====
  // 大于 1 的数：奇数转 0，偶数转 1
  // 小于等于 1 的数：保留
  // 最后 0 和 1 都丢掉
  function ruleA(numStr){
    let out = '';
    for(let i=0;i<numStr.length;i++){
      const n = parseInt(numStr[i]);
      if(n > 1){
        out += (n % 2 === 1) ? '0' : '1';
      }else{
        out += numStr[i];
      }
    }
    out = out.replace(/[01]/g, '');
    return out;
  }

  // ===== 最终修正：1 = 0 = 空 =====
  function ruleEmpty(numStr){
    return numStr.replace(/[01]/g, '');
  }

  function runCalc(){
    const curStr = document.getElementById('currentYear').value.trim();
    const birthStr = document.getElementById('birthYear').value.trim();

    if(!curStr || !birthStr){
      document.getElementById('resultBox').textContent = '请输入两个年份。';
      return;
    }

    const curB = ruleB(curStr);
    const curA = ruleA(curB);
    const curEnd = ruleEmpty(curA);

    const birthB = ruleB(birthStr);
    const birthA = ruleA(birthB);
    const birthEnd = ruleEmpty(birthA);

    let out = '';
    out += '【当前年份】' + curStr + '\n';
    out += '  B：' + (curB || '（空）') + '\n';
    out += '  A：' + (curA || '（空）') + '\n';
    out += '  修正之后结果：' + (curEnd || '（空）') + '\n\n';

    out += '【客户生日年份】' + birthStr + '\n';
    out += '  B：' + (birthB || '（空）') + '\n';
    out += '  A：' + (birthA || '（空）') + '\n';
    out += '  修正之后结果：' + (birthEnd || '（空）') + '\n\n';

    out += '【对比】' + (curEnd || '（空）') + ' == ' + (birthEnd || '（空）') + '\n';
    out += '【是否相等】' + (curEnd === birthEnd ? '是' : '否') + '\n';

    document.getElementById('resultBox').textContent = out;
  }

  function clearAll(){
    document.getElementById('currentYear').value = '';
    document.getElementById('birthYear').value = '';
    document.getElementById('resultBox').textContent = '点“计算”后，结果显示在这里。';
  }