// play-audio.js
(function() {
    let audio = null;
    function play() {
        if (audio) { audio.pause(); audio.currentTime = 0; }
        audio = new Audio('audio/people-long-live.mp3');
        audio.play();
    }

    function autoPlayOnClick() {
        play();
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
        localStorage.setItem('playFlag', '1')
    }
    let getPlayFlag = !!!localStorage.getItem('playFlag')
    if(getPlayFlag) {
        document.addEventListener('click', autoPlayOnClick);
        document.addEventListener('touchstart', autoPlayOnClick);
    }
    window.addEventListener('beforeunload', function (e) {
        // 取消事件的默认行为
        e.preventDefault();
        // Chrome 需要返回非空字符串才会显示确认对话框
        localStorage.setItem('playFlag', null)
    });


    window.playAudio = play;
})();