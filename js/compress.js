// ===== compressMethod（服务端逻辑示例，放在这里当前端用）=====
  // 入参：text 原文
  // 出参：code 短码
  function compressMethod(text){
    if(!text) return '';

    // 规则：一 = 丨 = 空 = 0
    // 示例：取每个字的第一个笔画，横归一，竖归丨，其余归0
    // 再归约：一、丨、0 统一转成空
    let code = '';
    for(let i=0;i<text.length;i++){
      const ch = text[i];
      let stroke = '0';
      if('一二三王十丁厂七'.includes(ch)) stroke = '一';
      else if('丨川山中申甲由田'.includes(ch)) stroke = '丨';
      else stroke = '0';

      // 再归约：一、丨、0 统一转成空
      // 示例版：用 · 表示空
      code += '·';
    }

    // 示例版：短码 = 空的数量 + 原文长度
    return '[' + code.length + '·]' + text.length;
  }

  // ===== restoreMethod（服务端逻辑示例）=====
  // 入参：code 短码
  // 出参：原文（示例版只做提示）
  function restoreMethod(code){
    if(!code) return '';
    return '【示例版还原】\n短码：' + code + '\n\n规则：一 = 丨 = 空 = 0\n按规则反向展开后，可还原原文。\n（当前为示例版，未接真实还原算法。）';
  }

  function runCompress(){
    const input = document.getElementById('inputText').value;
    document.getElementById('codeText').value = compressMethod(input);
  }

  function runRestore(){
    const code = document.getElementById('codeText').value;
    document.getElementById('outputText').value = restoreMethod(code);
  }

  function clearAll(){
    document.getElementById('inputText').value = '';
    document.getElementById('codeText').value = '';
    document.getElementById('outputText').value = '';
  }