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
        document.addEventListener("load", autoPlayOnClick);
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
    }
    document.addEventListener("load", autoPlayOnClick);
    document.addEventListener('click', autoPlayOnClick);
    document.addEventListener('touchstart', autoPlayOnClick);

    window.playAudio = play;
})();