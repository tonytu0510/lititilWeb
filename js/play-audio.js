// play-audio.js
(function() {
    let audio = null;
    let flag = getUrlParams().playFlag || null
    function play() {
        if (audio) { audio.pause(); audio.currentTime = 0; }
        audio = new Audio('audio/people-long-live.mp3');
        audio.play();
    }

    function autoPlayOnClick() {
        play();
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
    }
    let getPlayFlag = !flag
    if(getPlayFlag) {
        document.addEventListener('click', autoPlayOnClick);
        document.addEventListener('touchstart', autoPlayOnClick);
    }

    window.playAudio = play;

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