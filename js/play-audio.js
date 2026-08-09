// play-audio.js
(function() {
    let audio = null;
    let isBound = false;
    let flag = getUrlParams().playFlag || null
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
        let getPlayFlag = !!!flag;
        if (getPlayFlag) {
            bindClick();
        }
        document.addEventListener('keydown', keyHandler);
    }

    autoPlay()

    window.playAudio = play;

    function keyHandler(e) {
        if (e.code === 'KeyM') {
            e.preventDefault();
            play(); // 直接播放
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