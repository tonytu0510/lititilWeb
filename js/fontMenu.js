(function() {
    const menuItems = [
        { href: 'fontAll.html',   text: '拆字首页' },
        { href: 'font.html',      text: '拆字推演' },
        { href: 'splitFont.html', text: '拆字宇宙' },
        { href: 'bottom.html',    text: '底层推导' },
        { href: 'risk.html',      text: '风险' }
    ];

    const currentPath = location.pathname.split('/').pop() || 'fontAll.html';
    const topBarContainer = document.getElementById("topBarContainer")

    const menuBar = document.createElement('div');
    menuBar.className = 'menu-bar';

    menuItems.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.text;
        if (item.href === currentPath) {
            a.className = 'current';
        }
        menuBar.appendChild(a);
    });
    insertAfter(menuBar,topBarContainer);
    function insertAfter(newElement, targetElement) {
        /*
        编写逻辑
        1、首先找到给出我们需要插入的元素和用来定位的目标元素
        2、根据目标元素找到两个元素的父元素
        3、判断目标元素是不是父元素内的唯一的元素.
        4、如果是,向父元素执行追加操作,就是appendChild(newElement)
        5、如果不是,向目标元素的之后的紧接着的节点之前执行inserBefore()操作
        */
        var parentElement = targetElement.parentNode; //find parent element
        if (parentElement.lastChild == targetElement)//To determime确定,下决心 whether the last element of the parent element is the same as the target element 
        {
            parentElement.appendChild(newElement);
        } else {
            parentElement.insertBefore(newElement, targetElement.nextSibling);
        }
    }
})()