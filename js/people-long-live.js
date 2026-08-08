// people-long-live.js
(function() {
    let audioCtx = null;
    let isPlaying = false;

    function getNoteFreq(note) {
        const notes = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const match = note.match(/^([A-G])(\d)$/);
        if (!match) return 440;
        const semitone = notes[match[1]];
        const octave = parseInt(match[2]);
        return 440 * Math.pow(2, (semitone - 9 + (octave - 4) * 12) / 12);
    }

    function playNote(ctx, freq, startTime, duration, type, volume) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    function play() {
        if (isPlaying) return;
        isPlaying = true;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let t = audioCtx.currentTime;

        // 开场大鼓——咚咚咚
        for (let i = 0; i < 4; i++) {
            playNote(audioCtx, 55, t + i * 0.8, 0.5, 'sine', 0.45);
            playNote(audioCtx, 80, t + i * 0.8, 0.3, 'triangle', 0.3);
        }

        // 号角旋律——人民万岁
        const melody = [
            { note: 'G4', dur: 0.6 }, { note: 'C5', dur: 0.6 },
            { note: 'E5', dur: 1.0 }, { note: 'D5', dur: 0.4 },
            { note: 'C5', dur: 0.8 }, { note: 'G4', dur: 0.4 },
            { note: 'E5', dur: 1.2 }, { note: 'D5', dur: 0.4 },
            { note: 'C5', dur: 1.5 }
        ];

        let mt = t + 2.5;
        melody.forEach(({ note, dur }) => {
            playNote(audioCtx, getNoteFreq(note), mt, dur, 'sawtooth', 0.12);
            playNote(audioCtx, getNoteFreq(note), mt, dur, 'square', 0.08);
            mt += dur;
        });

        // 和声
        const chords = [
            { notes: ['C3', 'G3', 'C4'], dur: 2.5 },
            { notes: ['G2', 'D3', 'G3'], dur: 2.0 },
            { notes: ['C3', 'G3', 'C4'], dur: 3.0 }
        ];
        let ct = t + 2.5;
        chords.forEach(({ notes, dur }) => {
            notes.forEach(n => playNote(audioCtx, getNoteFreq(n), ct, dur, 'sine', 0.08));
            ct += dur;
        });

        // 战鼓持续
        for (let i = 0; i < 20; i++) {
            const vol = i % 4 === 0 ? 0.25 : 0.12;
            playNote(audioCtx, 75, t + 3 + i * 0.35, 0.15, 'triangle', vol);
        }

        // 最后一声大鼓——咚！
        playNote(audioCtx, 50, t + 9.5, 0.8, 'sine', 0.5);

        setTimeout(() => { isPlaying = false; }, 11000);
    }

    function autoPlayOnClick() {
        play();
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
    }

    document.addEventListener('click', autoPlayOnClick);
    document.addEventListener('touchstart', autoPlayOnClick);

    window.playPeopleLongLive = play;
    window.stopPeopleLongLive = function() {
        if (audioCtx) { audioCtx.close(); audioCtx = null; isPlaying = false; }
    };
})();