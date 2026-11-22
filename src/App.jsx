import { useGameStore } from './game/gameStore/gameStore';
import { initAndPlayMusic } from './utils/soundManager';
import LoadingScreen from './components/Loading/LoadingScreen';
import MainMenu from './pages/MainMenu/MainMenu';
import PhaserGame from './game/phaser/PhaserGame';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

export default function App() {
  const hasHydrated = useGameStore((state) => state._hasHydrated);
  const gameStage = useGameStore((state) => state.gameStage);
  const isMuted = useGameStore((state) => state.settings?.isMuted ?? false);

  // تا زمانی که سیو از حافظه موبایل کامل لود نشده، روی صفحه لودینگ بمان
  const effectiveStage = !hasHydrated ? 'LOADING' : gameStage;

  const handleStartAudio = () => {
    if (hasHydrated && !isMuted && effectiveStage !== 'PLAYING') {
      initAndPlayMusic();
    }
  };
  return (
    <div onPointerDown={handleStartAudio}>
      {effectiveStage === 'LOADING' && <LoadingScreen />}
      {effectiveStage === 'MENU' && <MainMenu />}
      {effectiveStage === 'PLAYING' && <PhaserGame />}
    </div>
  );
}