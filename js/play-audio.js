// play-audio.js
(function() {
    // 自动加参数 M=0
    if (!location.search.includes('M=')) {
        location.replace(location.pathname + '?M=0' + location.hash);
        return; // 跳转时退出，等新URL加载后再执行
    }

    // 只有URL已经有M参数时，才执行以下逻辑
    let audio = null;
    let isBound = false;
    let flag = getUrlParams().M;

    function play() {
        if (audio) { audio.pause(); audio.currentTime = 0; }
        audio = new Audio('audio/people-long-live.mp3');
        audio.play();
    }

    function bindClick() {
        if (isBound) return;
        isBound = true;
        document.addEventListener('click', autoPlayOnClick);
        document.addEventListener('touchstart', autoPlayOnClick);
    }

    function autoPlayOnClick() {
        play();
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
        isBound = false;
    }

    function autoPlay() {
        // M=0 触发，M=1 不触发
        if (flag === '0') {
            bindClick();
        }
        document.addEventListener('keydown', keyHandler);
    }

    autoPlay();

    window.playAudio = play;

    function keyHandler(e) {
        if (e.code === 'KeyM') {
            e.preventDefault();
            play();
        }
    }

    function getUrlParams(url) {
        const params = {};
        const queryString = url ? url.split('?')[1] : window.location.search.slice(1);
        if (!queryString) return params;

        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }
})();