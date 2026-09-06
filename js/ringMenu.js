// ringMenu.js - 可复用环形菜单组件（修正z-index层级问题）
(function() {
    'use strict';

    var RingMenu = window.RingMenu || {};

    // =============================================
    //  默认配置（独立配置项）
    // =============================================
    var DEFAULT_OPTIONS = {
        // 基础配置
        baseRadius: 0.28,           // 基础环半径比例
        radiusStep: 0.12,           // 环间距比例
        maxVisible: 6,              // 每环最大可见项数
        triggerLabel: '☰',         // 触发按钮文字
        
        // 容器配置
        containerWidth: 480,        // 容器宽度(px)
        containerHeight: 480,       // 容器高度(px)
        
        // 定位配置
        position: 'fixed',          // 定位方式: 'fixed' | 'absolute' | 'relative'
        
        // 层级配置（独立）
        menuZIndex: 998,            // 菜单容器层级
        triggerZIndex: 999,         // 触发按钮层级
        labelZIndex: 1000,          // 标签层级
        
        // 整体菜单容器位置
        menuPosition: 'bottom-left', // 菜单位置: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center'
        menuOffsetX: 0,             // 菜单X轴偏移(px)
        menuOffsetY: 0,             // 菜单Y轴偏移(px)
        
        // 触发按钮位置
        triggerPosition: 'bottom-left', // 触发按钮位置
        triggerOffsetX: 0,          // 触发按钮X轴偏移(px)
        triggerOffsetY: 0,          // 触发按钮Y轴偏移(px)
        
        // 标签位置
        labelPosition: 'bottom-left', // 标签位置
        labelOffsetX: 0,            // 标签X轴偏移(px)
        labelOffsetY: 0,            // 标签Y轴偏移(px)
        
        // 环位置配置
        ringOffsetX: 0,             // 环X轴偏移(px)
        ringOffsetY: 0,             // 环Y轴偏移(px)
    };

    // =============================================
    //  位置解析工具
    // =============================================
    function resolvePosition(position) {
        var styles = {};
        
        if (typeof position === 'string') {
            switch(position) {
                case 'bottom-left':
                    styles.bottom = '0px';
                    styles.left = '0px';
                    break;
                case 'bottom-right':
                    styles.bottom = '0px';
                    styles.right = '0px';
                    break;
                case 'top-left':
                    styles.top = '0px';
                    styles.left = '0px';
                    break;
                case 'top-right':
                    styles.top = '0px';
                    styles.right = '0px';
                    break;
                case 'center':
                    styles.top = '50%';
                    styles.left = '50%';
                    styles.transform = 'translate(-50%, -50%)';
                    break;
                default:
                    styles.bottom = '0px';
                    styles.left = '0px';
            }
        } else if (typeof position === 'object' && position !== null) {
            if (position.top !== undefined) styles.top = typeof position.top === 'number' ? position.top + 'px' : position.top;
            if (position.left !== undefined) styles.left = typeof position.left === 'number' ? position.left + 'px' : position.left;
            if (position.right !== undefined) styles.right = typeof position.right === 'number' ? position.right + 'px' : position.right;
            if (position.bottom !== undefined) styles.bottom = typeof position.bottom === 'number' ? position.bottom + 'px' : position.bottom;
            if (position.transform) styles.transform = position.transform;
        }
        
        return styles;
    }

    // 应用偏移
    function applyOffset(styles, offsetX, offsetY) {
        if (offsetX) {
            if (styles.left !== undefined) {
                styles.left = (parseInt(styles.left) + offsetX) + 'px';
            } else if (styles.right !== undefined) {
                styles.right = (parseInt(styles.right) - offsetX) + 'px';
            }
        }
        if (offsetY) {
            if (styles.top !== undefined) {
                styles.top = (parseInt(styles.top) + offsetY) + 'px';
            } else if (styles.bottom !== undefined) {
                styles.bottom = (parseInt(styles.bottom) - offsetY) + 'px';
            }
        }
        return styles;
    }

    // =============================================
    //  核心类
    // =============================================
    function MenuCore(data, options) {
        this.data = data || [];
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
        this.selectedPath = [0];
        this.offsets = {};
        this._lastHoverPrimary = -1;
        this.container = null;
        this.isOpen = false;
        this.rotationOffset = 0;
    }

    MenuCore.prototype.getLayerData = function(level) {
        if (!this.data || !Array.isArray(this.data)) return [];
        var data = this.data;
        for (var i = 0; i < level; i++) {
            var idx = (this.selectedPath && this.selectedPath[i]) || 0;
            if (data && data[idx] && data[idx].children && Array.isArray(data[idx].children)) {
                data = data[idx].children;
            } else {
                return [];
            }
        }
        return data || [];
    };

    MenuCore.prototype.getLayerColor = function(level) {
        if (!this.data || !Array.isArray(this.data)) return '#7cb8b8';
        var data = this.data;
        var color = '#7cb8b8';
        for (var i = 0; i <= level; i++) {
            var idx = (this.selectedPath && this.selectedPath[i]) || 0;
            if (data && data[idx] && data[idx].color) {
                color = data[idx].color;
            }
            if (i < level && data && data[idx] && data[idx].children && Array.isArray(data[idx].children)) {
                data = data[idx].children;
            }
        }
        return color;
    };

    MenuCore.prototype.getPathNames = function() {
        if (!this.data || !Array.isArray(this.data)) return [];
        var names = [];
        var data = this.data;
        for (var i = 0; i < this.selectedPath.length; i++) {
            var idx = this.selectedPath[i] || 0;
            if (data && data[idx]) {
                names.push(data[idx].name || '?');
                if (data[idx].children && Array.isArray(data[idx].children)) {
                    data = data[idx].children;
                } else break;
            } else break;
        }
        return names;
    };

    MenuCore.prototype.selectItem = function(level, index, callback) {
        if (!this.selectedPath) this.selectedPath = [0];
        this.selectedPath[level] = index;
        while (this.selectedPath.length > level + 1) {
            this.selectedPath.pop();
        }
        var nextData = this.getLayerData(level + 1);
        if (nextData && nextData.length > 0) {
            this.selectedPath.push(0);
        }
        this.offsets = this.offsets || {};
        if (callback) callback();
    };

    MenuCore.prototype.slideLayer = function(level, dir, callback) {
        var data = this.getLayerData(level);
        if (!data || data.length === 0) return;
        var total = data.length;
        var maxVis = Math.min(total, this.options.maxVisible || 6);
        var maxOff = Math.max(0, total - maxVis);
        if (!this.offsets) this.offsets = {};
        var cur = this.offsets[level] || 0;
        var nxt = Math.max(0, Math.min(cur + dir, maxOff));
        if (nxt !== cur) {
            this.offsets[level] = nxt;
            if (callback) callback();
        }
    };

    MenuCore.prototype.getPrimaryIndex = function() {
        return (this.selectedPath && this.selectedPath[0]) || 0;
    };

    MenuCore.prototype.setPrimaryIndex = function(idx) {
        if (!this.selectedPath) this.selectedPath = [0];
        if (this.selectedPath[0] === idx && this.selectedPath.length > 1) {
            return false;
        }
        this.selectedPath[0] = idx;
        while (this.selectedPath.length > 1) {
            this.selectedPath.pop();
        }
        var data = this.getLayerData(1);
        if (data && data.length > 0) {
            this.selectedPath.push(0);
        }
        return true;
    };

    MenuCore.prototype.resetToPrimary = function() {
        if (!this.selectedPath) this.selectedPath = [0];
        while (this.selectedPath.length > 1) {
            this.selectedPath.pop();
        }
        this.offsets = {};
        this._lastHoverPrimary = -1;
    };

    // =============================================
    //  渲染器
    // =============================================
    function getPoint(cx, cy, r, deg) {
        var rad = deg * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    function getSubClass(level) {
        if (level === 1) return 'sub';
        if (level === 2) return 'sub2';
        if (level >= 3) return 'sub3';
        return '';
    }

    function renderMenu(menu) {
        var container = menu.container;
        if (!container) return;

        var layerWrapper = container.querySelector('.ring-layer-wrapper');
        if (!layerWrapper) return;

        layerWrapper.innerHTML = '';
        var W = container.offsetWidth || menu.options.containerWidth || 480;
        var H = container.offsetHeight || menu.options.containerHeight || 480;

        // 获取触发按钮中心位置
        var triggerEl = container.querySelector('.ring-menu-trigger');
        var triggerRect = triggerEl ? triggerEl.getBoundingClientRect() : null;
        var containerRect = container.getBoundingClientRect();
        var cx, cy;

        if (triggerRect) {
            cx = triggerRect.left + triggerRect.width / 2 - containerRect.left;
            cy = triggerRect.top + triggerRect.height / 2 - containerRect.top;
        } else {
            // 默认左下角
            cx = 80;
            cy = H - 80;
        }
        
        // 应用环偏移配置
        cx += menu.options.ringOffsetX || 0;
        cy += menu.options.ringOffsetY || 0;

        var count0 = menu.data.length;
        var baseRadius = Math.min(W, H) * (menu.options.baseRadius || 0.28);
        var radiusStep = menu.options.radiusStep || 0.12;
        var radius0 = baseRadius;
        var startAngle0 = -180;
        var angleStep0 = 360 / count0;
        var selectedPath = menu.selectedPath || [0];

        // ===== 一级菜单 =====
        menu.data.forEach(function(item, idx) {
            if (!item) return;
            var angle = startAngle0 + (angleStep0 * idx) + menu.rotationOffset;
            var pos = getPoint(cx, cy, radius0, angle);
            var el = document.createElement('a');
            el.className = 'ring-menu-item';
            el.textContent = item.name ? item.name.slice(0, 3) : '?';
            el.title = item.name || '';
            el.href = item.href || '#';
            el.dataset.level = 0;
            el.dataset.index = idx;
            el.style.left = pos.x + 'px';
            el.style.top = pos.y + 'px';
            if (selectedPath[0] === idx) el.classList.add('active');

            // 桌面端悬停
            el.addEventListener('mouseenter', function(e) {
                var el2 = e.currentTarget;
                var idx2 = parseInt(el2.dataset.index);
                if (menu._lastHoverPrimary === idx2) return;
                menu._lastHoverPrimary = idx2;
                var changed = menu.setPrimaryIndex(idx2);
                if (changed) {
                    renderMenu(menu);
                    updateLabel(menu);
                }
            });

            // 移动端长按
            var longPressTimer = null;
            el.addEventListener('touchstart', function(e) {
                var el2 = e.currentTarget;
                var idx2 = parseInt(el2.dataset.index);
                longPressTimer = setTimeout(function() {
                    var changed = menu.setPrimaryIndex(idx2);
                    if (changed) {
                        renderMenu(menu);
                        updateLabel(menu);
                    }
                }, 600);
            });

            el.addEventListener('touchend', function() {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            });

            el.addEventListener('touchmove', function() {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            });

            // 点击跳转（叶子节点）
            el.addEventListener('click', function(e) {
                var el2 = e.currentTarget;
                var idx2 = parseInt(el2.dataset.index);
                var item2 = menu.data[idx2];
                var href = el2.getAttribute('href');

                if (item2.children && item2.children.length > 0) {
                    e.preventDefault();
                    return;
                }

                if (href && href !== '#') {
                    toggleMenu(menu, false);
                    setTimeout(function() {
                        window.location.href = href;
                    }, 200);
                }
            });

            layerWrapper.appendChild(el);
        });

        // ===== 递归渲染更深层级 =====
        for (var level = 1; level < selectedPath.length; level++) {
            var data = menu.getLayerData(level);
            if (!data || data.length === 0) break;

            var color = menu.getLayerColor(level);
            var total = data.length;
            var maxVis = Math.min(total, menu.options.maxVisible || 6);
            var offset = menu.offsets[level] || 0;
            var maxOff = Math.max(0, total - maxVis);
            var clo = Math.max(0, Math.min(offset, maxOff));
            var visible = data.slice(clo, clo + maxVis);
            var cnt = visible.length;

            var radius = baseRadius + level * radiusStep * Math.min(W, H);
            var innerR = radius - 16;
            var outerR = radius + 16;

            var arcRange = angleStep0 * 0.85;
            var selectedAngle = startAngle0 + (angleStep0 * selectedPath[0]) + menu.rotationOffset;
            var arcStart = selectedAngle - arcRange / 2;
            var step = arcRange / Math.max(cnt, 1);

            // 弧形背景
            var canvas = document.createElement('canvas');
            canvas.width = W * 2;
            canvas.height = H * 2;
            canvas.style.cssText =
                'position:absolute;bottom:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
            var ctx = canvas.getContext('2d');
            ctx.scale(2, 2);

            ctx.beginPath();
            ctx.arc(cx, cy, outerR, arcStart * Math.PI / 180, (arcStart + arcRange) * Math.PI / 180);
            ctx.arc(cx, cy, innerR, (arcStart + arcRange) * Math.PI / 180, arcStart * Math.PI / 180, true);
            ctx.closePath();
            ctx.fillStyle = color + '1e';
            ctx.fill();
            ctx.strokeStyle = color + '33';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            visible.forEach(function(item, vi) {
                if (!item) return;
                var realIdx = clo + vi;
                var centerA = arcStart + (vi + 0.5) * step;
                var halfA = step * 0.4;
                var a1 = centerA - halfA;
                var a2 = centerA + halfA;
                var isActive = (selectedPath[level] === realIdx);

                if (isActive) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, outerR, a1 * Math.PI / 180, a2 * Math.PI / 180);
                    ctx.arc(cx, cy, innerR, a2 * Math.PI / 180, a1 * Math.PI / 180, true);
                    ctx.closePath();
                    ctx.fillStyle = color + '55';
                    ctx.fill();
                    ctx.strokeStyle = color + '88';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                var midR = (innerR + outerR) / 2;
                var midA = (a1 + a2) / 2;
                var p = getPoint(cx, cy, midR, midA);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(midA * Math.PI / 180 + Math.PI / 2);
                ctx.fillStyle = isActive ? '#fff' : '#888';
                ctx.font = '10px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.name ? item.name.slice(0, 4) : '?', 0, 0);
                ctx.restore();
            });

            layerWrapper.appendChild(canvas);

            // 子项按钮
            visible.forEach(function(item, vi) {
                if (!item) return;
                var realIdx = clo + vi;
                var centerA = arcStart + (vi + 0.5) * step;
                var p = getPoint(cx, cy, radius, centerA);
                var el = document.createElement('a');
                var cls = getSubClass(level);
                el.className = 'ring-menu-item ' + cls;
                el.textContent = item.name ? item.name.slice(0, 3) : '?';
                el.title = item.name || '';
                el.href = item.href || '#';
                el.dataset.level = level;
                el.dataset.index = realIdx;
                el.style.left = p.x + 'px';
                el.style.top = p.y + 'px';
                if (selectedPath[level] === realIdx) el.classList.add('active');

                el.addEventListener('mouseenter', function(e) {
                    var el2 = e.currentTarget;
                    var lvl = parseInt(el2.dataset.level);
                    var i = parseInt(el2.dataset.index);
                    if (selectedPath[lvl] === i) {
                        if (selectedPath.length <= lvl + 1) {
                            var nextData2 = menu.getLayerData(lvl + 1);
                            if (nextData2 && nextData2.length > 0) {
                                selectedPath.push(0);
                                renderMenu(menu);
                                updateLabel(menu);
                            }
                        }
                        return;
                    }
                    menu.selectItem(lvl, i, function() {
                        renderMenu(menu);
                        updateLabel(menu);
                    });
                });

                el.addEventListener('click', function(e) {
                    var el2 = e.currentTarget;
                    var href = el2.getAttribute('href');
                    if (href && href !== '#') {
                        toggleMenu(menu, false);
                        setTimeout(function() {
                            window.location.href = href;
                        }, 200);
                    }
                    e.preventDefault();
                });

                layerWrapper.appendChild(el);
            });

            if (total > maxVis) {
                var arrowY = H - radius - 24;
                var makeArrow = function(dir) {
                    var el = document.createElement('div');
                    el.className = 'ring-slide-arrow';
                    el.textContent = dir === -1 ? '‹' : '›';
                    el.style.top = arrowY + 'px';
                    if (dir === -1) {
                        el.style.left = (W - radius - 44) + 'px';
                        el.style.opacity = clo > 0 ? '1' : '0.2';
                        el.style.pointerEvents = clo > 0 ? 'auto' : 'none';
                    } else {
                        el.style.right = (W - radius - 44) + 'px';
                        el.style.opacity = clo < maxOff ? '1' : '0.2';
                        el.style.pointerEvents = clo < maxOff ? 'auto' : 'none';
                    }
                    el.addEventListener('click', function(e) {
                        e.stopPropagation();
                        menu.slideLayer(level, dir, function() {
                            renderMenu(menu);
                            updateLabel(menu);
                        });
                    });
                    layerWrapper.appendChild(el);
                };
                makeArrow(-1);
                makeArrow(1);
            }
        }

        updateLabel(menu);
    }

    function updateLabel(menu) {
        var container = menu.container;
        if (!container) return;

        var currentNameEl = container.querySelector('.ring-current-name');
        var currentIndexEl = container.querySelector('.ring-current-index');
        var labelEl = container.querySelector('.ring-current-label');

        var names = menu.getPathNames();
        if (currentNameEl) {
            currentNameEl.textContent = names.join(' › ') || '根';
        }
        if (currentIndexEl) {
            currentIndexEl.textContent = (menu.selectedPath[0] || 0) + 1 + ' / ' + menu.data.length;
        }
        if (labelEl) {
            labelEl.classList.add('show');
        }
    }

    function toggleMenu(menu, open) {
        var container = menu.container;
        if (!container) return;

        var bgEl = container.querySelector('.ring-menu-bg');
        var triggerEl = container.querySelector('.ring-menu-trigger');
        var labelEl = container.querySelector('.ring-current-label');

        menu.isOpen = open;
        if (open) {
            container.style.display = 'block';
            container.classList.add('active');
            if (bgEl) bgEl.style.opacity = '1';
            if (triggerEl) triggerEl.classList.add('active');
            if (labelEl) labelEl.classList.add('show');
            menu.selectedPath = [0];
            menu.offsets = {};
            menu.rotationOffset = 0;
            menu._lastHoverPrimary = -1;
            setTimeout(function() {
                renderMenu(menu);
            }, 50);
        } else {
            container.style.display = 'none';
            container.classList.remove('active');
            if (bgEl) bgEl.style.opacity = '0';
            if (triggerEl) triggerEl.classList.remove('active');
            setTimeout(function() {
                if (labelEl && !menu.isOpen) labelEl.classList.remove('show');
            }, 300);
        }
    }

    // =============================================
    //  对外接口
    // =============================================
    RingMenu.init = function(options) {
        var containerId = options.container;
        var data = options.data || [];
        var container = document.getElementById(containerId);
        if (!container) {
            console.error('RingMenu: 容器 ' + containerId + ' 不存在');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 合并配置
        var config = Object.assign({}, DEFAULT_OPTIONS, options);
        
        // 解析位置配置（独立配置项）
        var menuPos = resolvePosition(config.menuPosition || 'bottom-left');
        menuPos = applyOffset(menuPos, config.menuOffsetX, config.menuOffsetY);
        
        var triggerPos = resolvePosition(config.triggerPosition || 'bottom-left');
        triggerPos = applyOffset(triggerPos, config.triggerOffsetX, config.triggerOffsetY);
        
        var labelPos = resolvePosition(config.labelPosition || 'bottom-left');
        labelPos = applyOffset(labelPos, config.labelOffsetX, config.labelOffsetY);
        
        // 生成样式字符串
        var menuPositionStyle = Object.keys(menuPos).map(function(key) {
            return key + ': ' + menuPos[key];
        }).join('; ');
        
        var triggerPositionStyle = Object.keys(triggerPos).map(function(key) {
            return key + ': ' + triggerPos[key];
        }).join('; ');
        
        var labelPositionStyle = Object.keys(labelPos).map(function(key) {
            return key + ': ' + labelPos[key];
        }).join('; ');

        // 生成 HTML
        container.innerHTML = `
            <style>
                .ring-menu-wrapper {
                    position: ${config.position || 'fixed'};
                    ${menuPositionStyle};
                    width: ${config.containerWidth || 480}px;
                    height: ${config.containerHeight || 480}px;
                    pointer-events: none;
                    z-index: ${config.menuZIndex || 998};
                    overflow: hidden;
                    display: none;
                }
                .ring-menu-wrapper.active {
                    pointer-events: auto;
                    display: block;
                }
                .ring-menu-bg {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(24,24,24,0.92);
                    backdrop-filter: blur(6px);
                    border-right: 1px solid #2a2a2a;
                    border-top: 1px solid #2a2a2a;
                    opacity: 0;
                    transition: opacity 0.35s ease;
                    border-radius: 0 ${config.containerWidth || 480}px 0 0;
                }
                .ring-layer-wrapper {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 2;
                }
                .ring-menu-item {
                    position: absolute;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #1a1a1a;
                    border: 1px solid #3d3d3d;
                    color: #999;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    user-select: none;
                    font-family: 'Courier New', monospace;
                    text-decoration: none;
                    font-weight: 300;
                    letter-spacing: 0.5px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                    margin-left: -22px;
                    margin-top: -22px;
                    z-index: 10;
                    pointer-events: auto;
                }
                .ring-menu-item:hover {
                    border-color: #7cb8b8;
                    color: #d0d0d0;
                    transform: scale(1.08);
                }
                .ring-menu-item.active {
                    background: #7cb8b8;
                    color: #0d0d0d;
                    border-color: #7cb8b8;
                    box-shadow: 0 0 40px rgba(124,184,184,0.3);
                }
                .ring-menu-item.sub {
                    width: 36px; height: 36px; font-size: 10px;
                    margin-left: -18px; margin-top: -18px;
                    z-index: 5;
                }
                .ring-menu-item.sub2 {
                    width: 32px; height: 32px; font-size: 9px;
                    margin-left: -16px; margin-top: -16px;
                    z-index: 4;
                }
                .ring-menu-item.sub3 {
                    width: 28px; height: 28px; font-size: 8px;
                    margin-left: -14px; margin-top: -14px;
                    z-index: 3;
                }
                .ring-slide-arrow {
                    position: absolute;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: rgba(26,26,26,0.8);
                    border: 1px solid #3d3d3d;
                    color: #666;
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    z-index: 20;
                    backdrop-filter: blur(4px);
                    user-select: none;
                    pointer-events: auto;
                }
                .ring-slide-arrow:hover {
                    background: rgba(60,60,80,0.8);
                    color: #d0d0d0;
                    border-color: #7cb8b8;
                }
                .ring-current-label {
                    position: ${config.position || 'fixed'};
                    ${labelPositionStyle};
                    color: #444;
                    font-size: 13px;
                    letter-spacing: 1px;
                    z-index: ${config.labelZIndex || 1000};
                    pointer-events: none;
                    text-align: left;
                    line-height: 1.6;
                    opacity: 0;
                    transition: opacity 0.4s;
                }
                .ring-current-label.show { opacity: 1; }
                .ring-current-label .name { color: #7cb8b8; font-size: 16px; }
                .ring-current-label .index { color: #555; font-size: 11px; }
                .ring-menu-trigger {
                    position: ${config.position || 'fixed'};
                    ${triggerPositionStyle};
                    width: 60px;
                    height: 60px;
                    background: #2a2a2a;
                    border-radius: 50%;
                    border: 1px solid #3d3d3d;
                    color: #d0d0d0;
                    font-size: 28px;
                    cursor: pointer;
                    z-index: ${config.triggerZIndex || 999};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.3s;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
                    user-select: none;
                }
                .ring-menu-trigger:hover { background: #3d3d3d; }
                .ring-menu-trigger.active { background: #7cb8b8; color: #0d0d0d; }
                @media (max-width: 500px) {
                    .ring-menu-wrapper { 
                        width: ${Math.min(config.containerWidth || 480, 340)}px; 
                        height: ${Math.min(config.containerHeight || 480, 340)}px; 
                    }
                    .ring-menu-item { width: 36px; height: 36px; font-size: 10px; margin-left: -18px; margin-top: -18px; }
                    .ring-menu-item.sub { width: 30px; height: 30px; font-size: 9px; margin-left: -15px; margin-top: -15px; }
                    .ring-menu-item.sub2 { width: 26px; height: 26px; font-size: 8px; margin-left: -13px; margin-top: -13px; }
                    .ring-menu-item.sub3 { width: 22px; height: 22px; font-size: 7px; margin-left: -11px; margin-top: -11px; }
                    .ring-slide-arrow { width: 22px; height: 22px; font-size: 11px; }
                    .ring-menu-trigger { width: 50px; height: 50px; font-size: 22px; }
                }
            </style>

            <div class="ring-current-label" id="ring-current-label">
                <div class="index" id="ring-current-index">1 / 1</div>
                <div class="name" id="ring-current-name">首页</div>
                <div style="color:#555;font-size:11px;">长按展开 · 点击跳转</div>
            </div>

            <button class="ring-menu-trigger" id="ring-menu-trigger">${config.triggerLabel || '☰'}</button>

            <div class="ring-menu-wrapper" id="ring-menu-wrapper">
                <div class="ring-menu-bg" id="ring-menu-bg"></div>
                <div class="ring-layer-wrapper" id="ring-layer-wrapper"></div>
            </div>
        `;

        // 获取元素
        var wrapper = container.querySelector('#ring-menu-wrapper');
        var triggerEl = container.querySelector('#ring-menu-trigger');
        var bgEl = container.querySelector('#ring-menu-bg');
        var layerWrapper = container.querySelector('#ring-layer-wrapper');
        var labelEl = container.querySelector('#ring-current-label');
        var currentNameEl = container.querySelector('#ring-current-name');
        var currentIndexEl = container.querySelector('#ring-current-index');

        // 创建菜单实例
        var menu = new MenuCore(data, config);

        // 挂载引用
        menu.container = wrapper;
        menu.triggerEl = triggerEl;
        menu.bgEl = bgEl;
        menu.layerWrapper = layerWrapper;
        menu.labelEl = labelEl;
        menu.currentNameEl = currentNameEl;
        menu.currentIndexEl = currentIndexEl;

        // 事件绑定
        triggerEl.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu(menu, !menu.isOpen);
        });

        document.addEventListener('click', function(e) {
            if (menu.isOpen && !wrapper.contains(e.target) && e.target !== triggerEl) {
                toggleMenu(menu, false);
            }
        });

        // 滚轮旋转
        wrapper.addEventListener('wheel', function(e) {
            if (!menu.isOpen) return;
            var isInMenu = wrapper.contains(e.target) || e.target === triggerEl;
            if (!isInMenu) return;
            e.preventDefault();
            var delta = e.deltaY > 0 ? 10 : -10;
            menu.rotationOffset += delta;
            renderMenu(menu);
        }, { passive: false });

        // 鼠标拖拽旋转
        wrapper.addEventListener('mousedown', function(e) {
            if (!menu.isOpen) return;
            if (e.target.closest('.ring-menu-item') || e.target === triggerEl) return;
            var isDragging = true;
            var dragStartX = e.clientX;
            var dragStartRot = menu.rotationOffset;
            e.preventDefault();

            function onMove(ev) {
                if (!isDragging) return;
                var dx = ev.clientX - dragStartX;
                menu.rotationOffset = dragStartRot + dx * 0.5;
                renderMenu(menu);
            }

            function onUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // 触摸拖拽
        wrapper.addEventListener('touchstart', function(e) {
            if (!menu.isOpen) return;
            if (e.target.closest('.ring-menu-item') || e.target === triggerEl) return;
            var touch = e.touches[0];
            if (!touch) return;
            var isDragging = true;
            var touchStartX = touch.clientX;
            var touchStartRot = menu.rotationOffset;

            function onMove(ev) {
                if (!isDragging) return;
                var touch2 = ev.touches[0];
                if (!touch2) return;
                var dx = touch2.clientX - touchStartX;
                menu.rotationOffset = touchStartRot + dx * 0.5;
                renderMenu(menu);
            }

            function onUp() {
                isDragging = false;
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onUp);
            }

            document.addEventListener('touchmove', onMove, { passive: true });
            document.addEventListener('touchend', onUp, { passive: true });
        }, { passive: true });

        // 键盘
        document.addEventListener('keydown', function(e) {
            if (!menu.isOpen) return;
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                menu.rotationOffset -= 10;
                renderMenu(menu);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                menu.rotationOffset += 10;
                renderMenu(menu);
            } else if (e.key === 'Escape') {
                toggleMenu(menu, false);
            }
        });

        // 鼠标离开容器收拢
        wrapper.addEventListener('mouseleave', function() {
            if (menu.isOpen) {
                menu.resetToPrimary();
                renderMenu(menu);
                updateLabel(menu);
            }
        });

        // 窗口自适应
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (menu.isOpen) renderMenu(menu);
            }, 300);
        });

        // 初始化
        menu.selectedPath = [0];
        menu.offsets = {};
        menu.rotationOffset = 0;
        menu._lastHoverPrimary = -1;
        renderMenu(menu);
        toggleMenu(menu, false);

        // 保存实例到元素上，方便调试
        container._ringMenu = menu;

        return menu;
    };

    window.RingMenu = RingMenu;
})();