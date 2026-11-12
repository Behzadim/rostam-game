import { useEffect } from 'react';
import { Howl } from 'howler';
import { useGameStore } from './store/gameStore';
import LoadingScreen from './components/Loading/LoadingScreen';
import MainMenu from './pages/MainMenu/MainMenu';
import 'bootstrap/dist/css/bootstrap.min.css';

// ۱. تعریف موزیک در بالاترین سطح برنامه تا با عوض شدن صفحات قطع نشود
const epicSoundtrack = new Howl({
  src: ['/assets/audio/epic-theme.mp3'], // مسیر فایل صوتی در پوشه public
  loop: true,
  volume: 0.5,
});

export default function App() {
  const gameStage = useGameStore((state) => state.gameStage);

  // ۲. مدیریت پخش موزیک به محض ورود کاربر و تعامل با صفحه (رد کردن محدودیت اتوپلی مرورگر)
  const handleStartAudio = () => {
    if (!epicSoundtrack.playing()) {
      epicSoundtrack.play();
    }
  };

  return (
    <div onClick={handleStartAudio}onTouchStart={handleStartAudio}>
      {gameStage === 'LOADING' && <LoadingScreen />}
      {gameStage === 'MENU' && <MainMenu />}
      {gameStage === 'PLAYING' && (
        <div className="container-fluid vh-100 bg-black text-white d-flex flex-column justify-content-center align-items-center">
          <h3 className="text-warning mb-3">خوان اول: بیشه‌زار تاریک</h3>
          <p className="text-secondary mb-4">موتور بازی Phaser در این صفحه بارگذاری خواهد شد.</p>
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={() => useGameStore.getState().setGameStage('MENU')}
          >
            بازگشت به لابی
          </button>
        </div>
      )}
    </div>
  );
}