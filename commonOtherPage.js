const closeBtn = document.querySelector('#dinoBar .close-btn');
if (closeBtn) {
    closeBtn.addEventListener('click', function() {
        toggleDino()
    });
}
const dinoIcon = document.getElementById('dinoIcon');
if (dinoIcon) {
    dinoIcon.addEventListener('click', function() {
        toggleDinoOther()
    });
}