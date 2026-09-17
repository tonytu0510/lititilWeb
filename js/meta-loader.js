var m = window.PAGE_META || {};

function init() {
  var head = document.head;
  var body = document.body;
  var a = document.createElement('div');  // a 是元素，不是字符串

  // ===== meta =====
  function setMeta(name, content) {
    if (!content) return;
    var el = document.createElement('meta');
    el.setAttribute('name', name);
    el.setAttribute('content', content);
    head.appendChild(el);
  }

  setMeta('author', m.author);
  setMeta('keywords', m.keywords);
  setMeta('description', m.description);
  setMeta('registration', m.registration);
  setMeta('registration1', m.registration1);
  setMeta('registration2', m.registration2);
  setMeta('registration3', m.registration3);

  // ===== viewport =====
  var vp = document.createElement('meta');
  vp.setAttribute('name', 'viewport');
  vp.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no');
  head.appendChild(vp);

  // ===== title =====
  if (m.title) {
    document.title = m.title;
  }

  // ===== icon =====
  if (m.icon) {
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/x-icon';
    icon.href = m.icon;
    head.appendChild(icon);
  }

  // ===== css =====
  (m.css || []).forEach(function (href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    head.appendChild(link);
  });
  (m.cssFront || []).forEach(function (href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    head.appendChild(link);
  });

  // ===== id =====
  if (m.idArr && m.idArr.length !== 0) {
    for (var i = 0; i < m.idArr.length; i++) {
      var temp3 = document.createElement('div');
      temp3.id = m.idArr[i];
      a.appendChild(temp3);  // 用 appendChild，不是 +=

      // ===== js =====
      if (temp3.id && m.jsArr && m.jsArr[i]) {
        var s = document.createElement('script');
        s.src = m.jsArr[i];
        s.onload = function () {
          console.log('加载成功：', this.src);
        };
        s.onerror = function () {
          console.log('加载失败：', this.src);
        };
        a.appendChild(s);  // 用 appendChild
      }
    }
  }
  //js
  console.log('m.js.length=>',m.js)
  if(m.js && m.js.length != 0){
    for (var i = 0; i < m.js.length; i++) {
      var s = document.createElement('script');
      s.src = m.js[i];
      a.appendChild(s);
    }
  }
  // ===== content =====
  if (m.content) {
    var temp2 = document.createElement('div');
    temp2.innerHTML = m.content;
    while (temp2.firstChild) {
      a.appendChild(temp2.firstChild);  // 用 appendChild
    }
  }
  //加载完正文以后再加载JS
  loadScripts(m.jsEnd, a);
  body.appendChild(a);  // a 是元素，能 append
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function loadScripts(list, container, index) {
  index = index || 0;
  if(!list) return;
  if (index >= list.length) return;
  var s = document.createElement('script');
  s.src = list[index];
  s.onload = function () {
    loadScripts(list, container, index + 1);
  };
  container.appendChild(s);
}