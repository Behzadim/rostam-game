// این صفحه مربوط به لودینگ عکس های بک گراند و صدا است

import { useEffect, useState } from 'react';
import { initAndPlayMusic, toggleMuteMusic } from '../../utils/soundManager';
import mainBg from '../../assets/images/main-bg.png';
import "../../styles/App.css";

export default function MainMenu() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    initAndPlayMusic();
  }, []);

  const handleToggleSound = (e) => {
    e.stopPropagation();
    initAndPlayMusic();
    const currentMuteState = toggleMuteMusic();
    setIsMuted(currentMuteState);
  };

  return (
    <div
      className="main-menu-container"
      style={{
        backgroundImage: `url(${mainBg})`
      }}
    >
      {/* دکمه حرفه‌ای قطع و وصل صدا در گوشه بالا سمت راست */}
      <button
        className={`sound-toggle-btn ${isMuted ? 'muted' : ''}`}
        onClick={handleToggleSound}
        aria-label="تنظیم صدا"
      >
        {isMuted ? (
          /* آیکون صدای قطع‌شده */
          <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          /* آیکون صدای روشن */
          <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        )}
      </button>
    </div>
  );
}