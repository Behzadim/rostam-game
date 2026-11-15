import { useEffect, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import loadingBg from '../../assets/images/loading-bg.jpg'; // اگر پسوند عکس لودینگ png است به .png تغییر دهید
import "../../styles/App.css";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const setGameStage = useGameStore((state) => state.setGameStage);

  // ۱. فقط افزایش درصد لودینگ تا ۱۰۰
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // ۲. انتقال قطعی به منوی اصلی به محض رسیدن به ۱۰۰ درصد
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        if (typeof setGameStage === 'function') {
          setGameStage('MENU');
        } else {
          console.error("خطا: تابع setGameStage در استور پیدا نشد!");
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [progress, setGameStage]);

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
              role="progressbar"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}