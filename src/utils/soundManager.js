import lobbyMusicFile from "../assets/audio/lobby-music.mp3";

let soundInstance = null;
let isMuted = false; // نگهداری وضعیت فعلی صدا (قطع یا وصل)

export const initAndPlayMusic = async () => {
  // اگر صدا قبلاً پخش می‌شود، کاری نکن
  if (soundInstance && soundInstance.playing()) return;

  // اگر نمونه Howl هنوز ساخته نشده، لایبرری را لود کرده و نمونه را ایجاد می‌کنیم
  if (!soundInstance) {
    const { Howl } = await import("howler");

    soundInstance = new Howl({
      src: [lobbyMusicFile],
      loop: true,
      volume: 0.5,
      mute: isMuted, // اعمال وضعیت میوت هنگام ساخت نمونه
      html5: true, // استفاده از حالت HTML5 برای سازگاری کامل با موبایل
      onloaderror: (id, err) => {
        console.warn("خطا در بارگذاری صوت:", err);
      },
    });
  }

  // پخش صدا پس از تعامل کاربر
  soundInstance.play();
};

// تابع جدید برای قطع و وصل کردن صدا
export const toggleMuteMusic = () => {
  isMuted = !isMuted; // تغییر وضعیت

  if (soundInstance) {
    soundInstance.mute(isMuted); // اعمال وضعیت جدید روی Howler
  }

  return isMuted; // برگرداندن وضعیت برای استفاده در دکمه UI
};

export const stopMusic = () => {
  if (soundInstance && soundInstance.playing()) {
    soundInstance.stop();
  }
};
