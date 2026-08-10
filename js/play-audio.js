// play-audio.js
(function() {
    if (!location.search.includes('M=')) {
        location.replace(location.pathname + '?M=0' + location.hash);
        return;
    }

    let audio = new Audio('audio/people-long-live.mp3');
    audio.preload = 'auto'; // 预加载
    let isBound = false;
    let flag = getUrlParams().M;

    function play() {
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // 如果浏览器限制自动播放，静默处理
            });
        }
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