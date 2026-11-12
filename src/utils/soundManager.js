import lobbyMusicFile from '../assets/audio/lobby-music.mp3';

let soundInstance = null;

export const initAndPlayMusic = async () => {
  // اگر صدا قبلاً پخش می‌شود، کاری نکن
  if (soundInstance && soundInstance.playing()) return;

  // اگر نمونه Howl هنوز ساخته نشده، لایبرری را لود کرده و نمونه را ایجاد می‌کنیم
  if (!soundInstance) {
    const { Howl } = await import('howler');
    
    soundInstance = new Howl({
      src: [lobbyMusicFile],
      loop: true,
      volume: 0.5,
      html5: true, // استفاده از حالت HTML5 برای سازگاری کامل با موبایل
      onloaderror: (id, err) => {
        console.warn("خطا در بارگذاری صوت:", err);
      }
    });
  }

  // پخش صدا پس از تعامل کاربر
  soundInstance.play();
};

export const stopMusic = () => {
  if (soundInstance && soundInstance.playing()) {
    soundInstance.stop();
  }
};