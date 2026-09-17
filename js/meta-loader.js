  var m = window.PAGE_META || {};

  function init() {
    var head = document.head;
    var body = document.body;

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

    // ===== body =====
    if (m.body) {
      var temp = document.createElement('div');
      temp.innerHTML = m.body;
      while (temp.firstChild) {
        body.innerHTML += (temp.firstChild);
      }
    }
    // ===== id =====
    if (m.idArr.length !=0 ) {
      for(let i=0;i<m.idArr.length;i++){
        if (document.body) {
            var temp3 = document.createElement('div');
            temp3.id = m.idArr[i];
            body.innerHTML+=temp3;
            // ===== js =====
            if (temp3.id) {
                var s = document.createElement('script');
                s.src = m.jsArr[i];
                s.onload = function () {
                    console.log('加载成功：', this.src);
                };
                s.onerror = function () {
                    console.log('加载失败：', this.src);
                };
                body.innerHTML+=s;
            }
        }
      }
    }

    // ===== content =====
    if (m.content) {
      var temp2 = document.createElement('div');
      temp2.innerHTML = m.content;
      while (temp2.firstChild) {
        if (document.body) {
            body.innerHTML+=temp2.firstChild;
        }
      }
    }
  }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }