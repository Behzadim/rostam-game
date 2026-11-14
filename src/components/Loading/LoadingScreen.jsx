import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
// ایمپورت مستقیم عکس لودینگ برای جلوگیری از سیاه شدن صفحه
import loadingBg from '../../assets/images/loading-bg.jpg';
import "../../styles/App.css";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const setGameStage = useGameStore((state) => state.setGameStage);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGameStage('MENU');
          }, 0);
          return 100;
        }
        return oldProgress + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [setGameStage]);

  return (
    <div
      className="loading-container"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.85)), url(${loadingBg})`
      }}
    >
      <div className="loading-content">
        <div className="w-100">
          <div className="d-flex justify-content-between mb-2 small text-light fw-bold mt-5">
            <span>در حال بارگذاری ...</span>
            <span className="text-warning">{progress}%</span>
          </div>
          <div className="progress border border-secondary bg-dark bg-opacity-75" style={{ height: '14px' }}>
            <div
              className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}