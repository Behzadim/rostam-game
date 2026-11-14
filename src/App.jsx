import { useGameStore } from './store/gameStore';
import { initAndPlayMusic } from './utils/soundManager';
import LoadingScreen from './components/Loading/LoadingScreen';
import MainMenu from './pages/MainMenu/MainMenu';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

export default function App() {
  const gameStage = useGameStore((state) => state.gameStage);

  // مدیریت پخش موزیک با اولین تعامل کاربر در هر صفحه‌ای (LOADING یا MENU)
  const handleStartAudio = () => {
    initAndPlayMusic();
  };

  return (
    <div onClick={handleStartAudio} onTouchStart={handleStartAudio}>
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