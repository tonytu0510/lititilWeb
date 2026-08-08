// war-drum-player.js
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

    function playNoise(ctx, startTime, duration, volume) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(startTime);
        source.stop(startTime + duration);
    }

    function play() {
        if (isPlaying) return;
        isPlaying = true;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        let t = audioCtx.currentTime;

        // 战鼓：咚咚咚咚咚咚
        const drumHits = [
            0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1,
            2.5, 2.8, 3.1, 3.4, 3.7, 4.0, 4.3, 4.6,
            5.0, 5.3, 5.6, 5.9, 6.2, 6.5, 6.8, 7.1
        ];

        drumHits.forEach((hit, i) => {
            const vol = i % 4 === 0 ? 0.35 : 0.2;
            playNote(audioCtx, 80, t + hit, 0.2, 'sine', vol);
            playNote(audioCtx, 100, t + hit, 0.15, 'triangle', vol * 0.6);
        });

        // 大鼓：咚！咚！咚！
        for (let i = 0; i < 8; i++) {
            playNote(audioCtx, 55, t + i * 1.0, 0.4, 'sine', 0.4);
            playNote(audioCtx, 70, t + i * 1.0, 0.3, 'triangle', 0.25);
        }

        // 号角：冲锋！
        const hornCalls = [
            { note: 'C4', dur: 0.3 }, { note: 'C4', dur: 0.3 }, { note: 'C4', dur: 0.3 },
            { note: 'E4', dur: 0.4 }, { note: 'G4', dur: 0.4 },
            { note: 'C5', dur: 0.6 }, { note: 'G4', dur: 0.3 }, { note: 'E4', dur: 0.3 },
            { note: 'C4', dur: 0.6 }, { note: 'G4', dur: 0.3 }, { note: 'C5', dur: 0.6 },
            { note: 'E5', dur: 0.8 }, { note: 'C5', dur: 0.4 }, { note: 'G4', dur: 0.4 },
            { note: 'C5', dur: 1.0 }
        ];

        let hornTime = t + 0.5;
        hornCalls.forEach(({ note, dur }) => {
            playNote(audioCtx, getNoteFreq(note), hornTime, dur, 'sawtooth', 0.1);
            playNote(audioCtx, getNoteFreq(note), hornTime, dur, 'square', 0.06);
            hornTime += dur;
        });

        // 军镲
        for (let i = 0; i < 12; i++) {
            playNoise(audioCtx, t + i * 0.7 + 0.3, 0.08, 0.12);
        }

        // 低音持续
        playNote(audioCtx, 40, t, 8, 'sine', 0.15);

        setTimeout(() => { isPlaying = false; }, 9000);
    }

    function autoPlayOnClick() {
        play();
        document.removeEventListener('click', autoPlayOnClick);
        document.removeEventListener('touchstart', autoPlayOnClick);
    }

    document.addEventListener('click', autoPlayOnClick);
    document.addEventListener('touchstart', autoPlayOnClick);

    window.playWarDrum = play;
    window.stopWarDrum = function() {
        if (audioCtx) { audioCtx.close(); audioCtx = null; isPlaying = false; }
    };
})();