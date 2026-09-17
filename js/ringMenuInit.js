RingMenu.init({
            container: 'ringMenuCycle',
            data: [{
                name: '分类A',
                color: '#7cb8b8',
                href: '#',
                children: [{
                    name: '子项A1',
                    href: '#',
                    children: [
                        { name: '孙A1a', href: '#' },
                        { name: '孙A1b', href: '#' },
                        { name: '孙A1c', href: '#' },
                        { name: '孙A1d', href: '#' }
                    ]
                }, {
                    name: '子项A2',
                    href: '#',
                    children: [
                        { name: '孙A2a', href: '#' },
                        { name: '孙A2b', href: '#' }
                    ]
                }, {
                    name: '子项A3',
                    href: '#',
                    children: [
                        { name: '孙A3a', href: '#' },
                        { name: '孙A3b', href: '#' },
                        { name: '孙A3c', href: '#' },
                        { name: '孙A3d', href: '#' }
                    ]
                }]
            }, {
                name: '分类B',
                color: '#e8a838',
                href: '#',
                children: [{
                    name: '子项B1',
                    href: '#',
                    children: [
                        { name: '孙B1a', href: '#' },
                        { name: '孙B1b', href: '#' }
                    ]
                }, {
                    name: '子项B2',
                    href: '#',
                    children: [
                        { name: '孙B2a', href: '#' },
                        { name: '孙B2b', href: '#' },
                        { name: '孙B2c', href: '#' }
                    ]
                }]
            }, {
                name: '分类C',
                color: '#c87a7a',
                href: '#',
                children: [{
                    name: '子项C1',
                    href: '#',
                    children: [
                        { name: '孙C1a', href: '#' },
                        { name: '孙C1b', href: '#' },
                        { name: '孙C1c', href: '#' },
                        { name: '孙C1d', href: '#' }
                    ]
                }]
            }],
            
            // 菜单容器位置（独立）
            menuPosition: 'bottom-left',
            menuOffsetX: 0,
            menuOffsetY: 20,
            
            // 触发按钮位置（独立）
            triggerPosition: 'bottom-left',
            triggerOffsetX: 30,
            triggerOffsetY: -30,
            triggerZindex:999,
            
            // 标签位置（独立）
            labelPosition: 'bottom-left',
            labelOffsetX: 80,
            labelOffsetY: 100,
            
            // 环位置偏移（独立）
            ringOffsetX: 0,
            ringOffsetY: 0,
            menuZIndex: 900,     // 菜单容器
            triggerZIndex: 950,  // 触发按钮
            labelZIndex: 1000    // 标签
        });