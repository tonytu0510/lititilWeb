(function() {
            const buttons = document.querySelectorAll('.tab-btn');
            const panels = {
                tab1: document.getElementById('tab1'),
                tab2: document.getElementById('tab2'),
                tab3: document.getElementById('tab3')
            };

            buttons.forEach(btn => {
                btn.addEventListener('click', function() {
                    // 移除所有按钮的 active 状态
                    buttons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    // 隐藏所有面板
                    Object.values(panels).forEach(p => p.classList.remove('active'));

                    // 显示对应的面板
                    const target = this.dataset.tab;
                    if (panels[target]) {
                        panels[target].classList.add('active');
                    }
                });
            });
        })();