import { useGameStore } from './game/gameStore/gameStore';
import { initAndPlayMusic } from './utils/soundManager';
import LoadingScreen from './components/Loading/LoadingScreen';
import MainMenu from './pages/MainMenu/MainMenu';
import PhaserGame from './game/phaser/PhaserGame';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

export default function App() {
  const gameStage = useGameStore((state) => state.gameStage);

  const handleStartAudio = () => {
    if (gameStage !== 'PLAYING') {
      initAndPlayMusic();
    }
  };

  return (
    <div onClick={handleStartAudio} onTouchStart={handleStartAudio}>
      {gameStage === 'LOADING' && <LoadingScreen />}
      {gameStage === 'MENU' && <MainMenu />}
      {gameStage === 'PLAYING' && <PhaserGame />}
    </div>
  );
}
