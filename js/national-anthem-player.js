// national-anthem-player.js
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

        const melody = [
            { note: 'C5', dur: 0.25 }, { note: 'C5', dur: 0.25 },
            { note: 'C5', dur: 0.25 }, { note: 'C5', dur: 0.5 },
            { note: 'G4', dur: 0.25 }, { note: 'C5', dur: 0.25 },
            { note: 'E5', dur: 0.5 }, { note: 'C5', dur: 0.25 },
            { note: 'E5', dur: 0.25 }, { note: 'G5', dur: 0.5 },
            { note: 'C6', dur: 0.5 }, { note: 'G5', dur: 0.25 },
            { note: 'E5', dur: 0.25 }, { note: 'C5', dur: 0.75 }
        ];

        let time = audioCtx.currentTime;

        melody.forEach(({ note, dur }) => {
            playNote(audioCtx, getNoteFreq(note), time, dur, 'square', 0.18);
            time += dur;
        });

        time = audioCtx.currentTime;
        const bassLine = [
            { note: 'C3', dur: 1.0 }, { note: 'C3', dur: 1.0 },
            { note: 'G2', dur: 1.0 }, { note: 'C3', dur: 1.0 },
            { note: 'C3', dur: 1.5 }, { note: 'C3', dur: 0.5 }
        ];
        bassLine.forEach(({ note, dur }) => {
            playNote(audioCtx, getNoteFreq(note), time, dur, 'square', 0.12);
            time += dur;
        });

        time = audioCtx.currentTime;
        for (let i = 0; i < 16; i++) {
            playNote(audioCtx, 200 + Math.random() * 50, time + i * 0.3, 0.08, 'triangle', 0.15);
        }

        setTimeout(() => { isPlaying = false; }, 7000);
    }

    // 自动播放：用户首次点击页面任意位置时触发
    function autoPlayOnClick() {
        play();
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
    }

    document.addEventListener('click', autoPlayOnClick);
    document.addEventListener('touchstart', autoPlayOnClick);

    // 暴露手动控制
    window.playNationalAnthem = play;
    window.stopNationalAnthem = function() {
        if (audioCtx) { audioCtx.close(); audioCtx = null; isPlaying = false; }
    };
})();