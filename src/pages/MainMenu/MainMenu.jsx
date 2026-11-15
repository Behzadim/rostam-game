import { useEffect, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { initAndPlayMusic, toggleMuteMusic } from '../../utils/soundManager';
import { KHANS_DATA } from '../../game/data/khansData';
import ShopModal from '../Shop/ShopModal';
import EquipmentModal from '../Shop/EquipmentModal';
import mainBg from '../../assets/images/main-bg.png';
import "../../styles/App.css";

export default function MainMenu() {
  const [isMuted, setIsMuted] = useState(false);

  const coins = useGameStore((state) => state.coins ?? 1500);
  const currentKhan = useGameStore((state) => state.currentKhan ?? 1);
  const addCoins = useGameStore((state) => state.addCoins);
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const setGameStage = useGameStore((state) => state.setGameStage);

  const khanInfo = KHANS_DATA[currentKhan] || KHANS_DATA[1];

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
      {/* پنل فرماندهی در سمت راست بالای صفحه */}
      <div className="top-right-command-hub">

        <div className="hub-status-row">
          <button
            className={`shahnameh-icon-btn ${isMuted ? 'muted' : ''}`}
            onClick={handleToggleSound}
            aria-label="تنظیم صدا"
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            )}
          </button>

          <div className="shahnameh-coin-box">
            <button
              className="coin-plus-btn"
              onClick={() => addCoins && addCoins(200)}
              title="افزایش سکه"
            >
              +
            </button>
            <span className="coin-text">{(coins || 0).toLocaleString()}</span>
            <div className="coin-emblem">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffd700" stroke="#8a5a00" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="7" fill="none" stroke="#fff3b0" strokeDasharray="2 2" />
                <text x="12" y="16" textAnchor="middle" fill="#4a2c00" fontSize="10" fontWeight="bold">زر</text>
              </svg>
            </div>
          </div>
        </div>

        {/* دکمه اصلی شروع رزم (خطی بر اساس خوان فعلی) */}
        <button
          className="shahnameh-btn battle-start-btn"
          onClick={() => setGameStage('PLAYING')}
        >
          <div className="battle-btn-text">
            <span className="battle-main-title">آغاز رزم</span>
            <span className="battle-sub-title">{khanInfo.title}</span>
          </div>
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="#fff3b0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2L22 9.5l-4.5 4.5-7.5-7.5L14.5 2z" />
            <path d="M11 8.5L3 16.5V21h4.5l8-8" />
          </svg>
        </button>

        {/* دکمه‌های بازارچه و سلاح و زره */}
        <div className="hub-sub-actions">
          <button
            className={`shahnameh-btn sub-action-btn ${activeModal === 'SHOP' ? 'is-active' : ''}`}
            onClick={() => setActiveModal && setActiveModal('SHOP')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ffd700" strokeWidth="2" fill="none">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>بازارچه</span>
          </button>

          <button
            className={`shahnameh-btn sub-action-btn ${activeModal === 'EQUIPMENT' ? 'is-active' : ''}`}
            onClick={() => setActiveModal && setActiveModal('EQUIPMENT')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ffd700" strokeWidth="2" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>سلاح و زره</span>
          </button>
        </div>

      </div>

      {/* نمایش پنجره‌های مودال */}
      {activeModal === 'SHOP' && <ShopModal />}
      {activeModal === 'EQUIPMENT' && <EquipmentModal />}
    </div>
  );
}