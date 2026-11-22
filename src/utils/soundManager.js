import lobbyMusicFile from "../assets/audio/lobby-music.mp3";
import { useGameStore } from "../game/gameStore/gameStore";

// نگهداری وضعیت سراسری روی window تا حتی با HMR در Vite دو نمونه ساخته نشود
const STATE_KEY = "__ROSTAM_HOWLER_BGM__";

function getAudioState() {
  if (typeof window === "undefined") {
    return {
      soundInstance: null,
      initPromise: null,
      isStarting: false,
      pausedByVisibility: false,
      visibilityBound: false,
    };
  }

  if (!window[STATE_KEY]) {
    window[STATE_KEY] = {
      soundInstance: null,
      initPromise: null,
      isStarting: false,
      pausedByVisibility: false,
      visibilityBound: false,
    };
  }

  return window[STATE_KEY];
}

function getStoreMuted() {
  return Boolean(useGameStore.getState().settings?.isMuted);
}

function bindVisibilityHandler() {
  if (typeof document === "undefined") return;
  const state = getAudioState();
  if (state.visibilityBound) return;

  state.visibilityBound = true;
  document.addEventListener("visibilitychange", () => {
    const s = getAudioState();
    const sound = s.soundInstance;
    if (!sound) return;

    if (document.hidden) {
      if (sound.playing()) {
        sound.pause();
        s.pausedByVisibility = true;
      }
      s.isStarting = false;
    } else if (s.pausedByVisibility) {
      s.pausedByVisibility = false;
      const stage = useGameStore.getState().gameStage;
      if (!getStoreMuted() && stage !== "PLAYING" && !sound.playing()) {
        sound.play();
      }
    }
  });
}

export const initAndPlayMusic = async () => {
  const state = getAudioState();
  bindVisibilityHandler();

  const muted = getStoreMuted();
  const stage = useGameStore.getState().gameStage;

  // اگر صدا قطع است، داخل نبرد هستیم، یا صدا همین الان در حال پخش/شروع است، کاری نکن
  if (muted || stage === "PLAYING") return;
  if (state.isStarting || (state.soundInstance && state.soundInstance.playing())) {
    return;
  }

  state.isStarting = true;

  try {
    // جلوگیری از ساخت همزمان دو نمونه Howl هنگام لود شدن کتابخانه
    if (!state.soundInstance) {
      if (!state.initPromise) {
        state.initPromise = import("howler").then(({ Howl }) => {
          const musicVolume = useGameStore.getState().settings?.musicVolume ?? 0.5;
          const instance = new Howl({
            src: [lobbyMusicFile],
            loop: true,
            volume: musicVolume,
            mute: getStoreMuted(),
            html5: true, // سازگاری کامل با موبایل
            onplay: () => {
              state.isStarting = false;
            },
            onstop: () => {
              state.isStarting = false;
            },
            onplayerror: () => {
              state.isStarting = false;
              // جلوگیری از صف شدن پخش تکراری در Howler پس از خطای Autoplay
              instance.stop();
            },
            onloaderror: (id, err) => {
              state.isStarting = false;
              console.warn("خطا در بارگذاری صوت:", err);
            },
          });

          state.soundInstance = instance;
          return instance;
        });
      }

      await state.initPromise;
    }

    const sound = state.soundInstance;
    const latestStage = useGameStore.getState().gameStage;

    // بررسی مجدد پس از await (مثلاً اگر کاربر در همین فاصله وارد نبرد شده یا صدا را قطع کرده)
    if (!sound || !state.isStarting || getStoreMuted() || latestStage === "PLAYING") {
      state.isStarting = false;
      return;
    }

    if (sound.playing()) {
      state.isStarting = false;
      return;
    }

    sound.mute(false);
    sound.stop(); // تضمین قطعی که هیچ صدای قبلی داخل همین نمونه باقی نمانده باشد
    sound.play();
  } catch (err) {
    state.isStarting = false;
    state.initPromise = null;
    console.warn("خطا در راه‌اندازی موسیقی:", err);
  }
};

// قطع و وصل کردن صدا + ذخیره دائمی در حافظه موبایل
export const toggleMuteMusic = () => {
  const state = getAudioState();
  const nextMuted = !getStoreMuted();

  useGameStore.getState().setMuted(nextMuted);

  if (state.soundInstance) {
    state.soundInstance.mute(nextMuted);
    if (nextMuted) {
      state.soundInstance.pause();
      state.isStarting = false;
    }
  }

  // اگر کاربر صدا را وصل کرد و در منو بود، آهنگ را پخش کن
  if (!nextMuted && useGameStore.getState().gameStage !== "PLAYING") {
    initAndPlayMusic();
  }

  return nextMuted;
};

export const stopMusic = () => {
  const state = getAudioState();
  state.isStarting = false;
  state.pausedByVisibility = false;

  if (state.soundInstance) {
    state.soundInstance.stop();
  }
};