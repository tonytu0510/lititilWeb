var m = window.PAGE_META || {};

function init() {
  var head = document.head;
  var body = document.body;
  var a = document.createElement('div');  // a 是元素，不是字符串
  a.id='bodyWrap'

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
  // ===== 核心：串行加载 m.js → m.jsFront → content → m.jsEnd =====
  loadScripts(m.js  || [], a, 0, function() {
    loadScripts(m.jsFront  || [], a, 0, function() {
      // content
      if (m.content) {
        var temp2 = document.createElement('div');
        temp2.innerHTML = m.content;
        while (temp2.firstChild) {
          a.appendChild(temp2.firstChild);
        }
      }
      // jsEnd
      loadScripts(m.jsEnd  || [], a, 0,function() {
        // 挂到 body
        body.appendChild(a);
      })
    });
  });
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

var loadedSrc = {};
function loadScripts(list, container, index, done) {
  index = index || 0;
  if (!list || index >= list.length) {
    if (typeof done === 'function') done();
    return;
  }

  var src = list[index];

  // 已经加载过，跳过
  if (loadedSrc[src]) {
    loadScripts(list, container, index + 1, done);
    return;
  }
  loadedSrc[src] = true;

  var s = document.createElement('script');
  var called = false;
  function next() {
    if (called) return;
    called = true;
    loadScripts(list, container, index + 1, done);
  }
  s.onload = next;
  s.onerror = next;
  s.src = src;
  container.appendChild(s);
  next()
}