//این صفحه مربوط به ساخت دکمه صدا است

import lobbyMusicFile from '../assets/audio/lobby-music.mp3';

let soundInstance = null;
let isMuted = false;

export const initAndPlayMusic = async () => {
    if (soundInstance && soundInstance.playing()) return;

    if (!soundInstance) {
        const { Howl } = await import('howler');

        soundInstance = new Howl({
            src: [lobbyMusicFile],
            loop: true,
            volume: 0.5,
            mute: isMuted,
            html5: true,
            onloaderror: (id, err) => {
                console.warn("خطا در بارگذاری صوت:", err);
            }
        });
    }

    soundInstance.play();
};

export const toggleMuteMusic = () => {
    isMuted = !isMuted;

    if (soundInstance) {
        soundInstance.mute(isMuted);
        if (!isMuted && !soundInstance.playing()) {
            soundInstance.play();
        }
    }

    return isMuted;
};

export const stopMusic = () => {
    if (soundInstance && soundInstance.playing()) {
        soundInstance.stop();
    }
};