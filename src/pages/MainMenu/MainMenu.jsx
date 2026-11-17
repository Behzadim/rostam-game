import { useEffect, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { initAndPlayMusic, toggleMuteMusic } from '../../utils/soundManager';
import { KHANS_DATA } from '../../game/data/khansData';
import ShopModal from '../Shop/ShopModal';
import EquipmentModal from '../Shop/EquipmentModal';
import mainBg from '../../assets/images/main-bg.png';
import TitelNeme from '../../assets/images/titel-neme.png'
import "../../styles/App.css";
const KHAN_ORDINALS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم'];

export default function MainMenu() {
  const [isMuted, setIsMuted] = useState(false);
  const [toast, setToast] = useState('');

  const coins = useGameStore((state) => state.coins ?? 1500);
  const currentKhan = useGameStore((state) => state.currentKhan ?? 1);
  const addCoins = useGameStore((state) => state.addCoins);
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const setGameStage = useGameStore((state) => state.setGameStage);

  // ----- مقادیر جدید (اگه توی store نباشن، مقدار پیش‌فرض می‌گیرن) -----
  const gems = useGameStore((state) => state.gems ?? 120);
  const level = useGameStore((state) => state.level ?? state.playerLevel ?? 1);
  const xp = useGameStore((state) => state.xp ?? 0);
  const xpToNext = useGameStore((state) => state.xpToNext ?? 100);
  const stars = useGameStore((state) => state.khanStars?.[currentKhan] ?? 0);
  const setCurrentKhan = useGameStore((state) => state.setCurrentKhan);

  const khanInfo = KHANS_DATA[currentKhan] || KHANS_DATA[1];
  const totalKhans = Object.keys(KHANS_DATA).length || 7;
  const xpPercent = Math.min(100, Math.max(0, (xp / (xpToNext || 100)) * 100));

  useEffect(() => {
    initAndPlayMusic();
  }, []);

  // پیام «به‌زودی» برای دکمه‌هایی که هنوز صفحه‌شون ساخته نشده
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const showSoon = (name) => setToast(`${name} - به‌زودی`);

  const goKhan = (dir) => {
    if (!setCurrentKhan) return;
    const next = currentKhan + dir;
    if (next < 1 || next > totalKhans) return;
    setCurrentKhan(next);
  };

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
      {/* پروفایل بازیکن (بالا چپ) */}
      <div className="player-profile">
        <div className="player-info">
          <span className="player-name">رستم</span>
          <div className="player-level-row">
            <span className="player-level">Lv. {level}</span>
            <div
              className="player-xp-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(xpPercent)}
            >
              <div
                className="player-xp-fill"
                style={{ width: `${Math.min(100, Math.max(0, xpPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* عنوان بازی */}
      <div className="game-title-block">
        <img src={TitelNeme} alt="notFund" />
      </div>
      {/* ستون سمت چپ */}
      <div className="side-menu">
        <button className="shahnameh-btn nav-tile" onClick={() => showSoon('جایزه روزانه')}>
          <span className="notif-dot" />
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
            <path d="M8 14h2M12 14h2M16 14h0M8 17.5h2M12 17.5h2" />
          </svg>
          <span>جایزه روزانه</span>
        </button>

        <button className="shahnameh-btn nav-tile" onClick={() => showSoon('ماموریت‌ها')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4V2.5h6V4M8.5 10l1.5 1.5 3-3M8.5 16h7" />
          </svg>
          <span>ماموریت‌ها</span>
        </button>

        <button className="shahnameh-btn nav-tile" onClick={() => showSoon('تماشا تبلیغ')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M10 9.5v5l4.5-2.5z" fill="#ffd700" />
          </svg>
          <span>تماشا تبلیغ</span>
        </button>

        {/* دکمه‌ی بازارچه (همون دکمه‌ی قبلی، فقط به این ستون منتقل شده) */}
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
      </div>

      {/* کارت خان فعلی */}
      <div className="khan-card">
        <div
          className="khan-card-art"
          style={khanInfo?.image ? { backgroundImage: `url(${khanInfo.image})` } : undefined}
        />
        <div className="khan-card-title">خان {KHAN_ORDINALS[currentKhan - 1] || currentKhan}</div>
        <div className="khan-card-name">{khanInfo.title}</div>
        <div className="khan-card-stars">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z" fill="#ffd700" stroke="#8a5a00" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          <span>{stars}/10</span>
        </div>
      </div>

      <div className="khan-pager">
        <button
          className="khan-arrow"
          onClick={() => goKhan(-1)}
          disabled={!setCurrentKhan || currentKhan <= 1}
          aria-label="خان قبلی"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 5 16 12 9 19" />
          </svg>
        </button>
        <div className="khan-dots">
          {Array.from({ length: totalKhans }, (_, i) => (
            <span key={i} className={`khan-dot ${i + 1 === currentKhan ? 'is-active' : ''}`} />
          ))}
        </div>
        <button
          className="khan-arrow"
          onClick={() => goKhan(1)}
          disabled={!setCurrentKhan || currentKhan >= totalKhans}
          aria-label="خان بعدی"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 5 8 12 15 19" />
          </svg>
        </button>
      </div>

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

          {/* هدیه */}
          <button
            className="shahnameh-icon-btn gift-btn"
            onClick={() => showSoon('هدیه')}
            aria-label="هدیه"
          >
            <span className="notif-dot" />
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="13" rx="1.5" />
              <path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z" />
            </svg>
          </button>

          {/* الماس */}
          <div className="shahnameh-coin-box gem-box">
            <button
              className="coin-plus-btn"
              onClick={() => showSoon('الماس')}
              title="افزایش الماس"
            >
              +
            </button>
            <span className="coin-text">{(gems || 0).toLocaleString()}</span>
            <div className="coin-emblem">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M6 3h12l4 6-10 12L2 9z" fill="#35b8ff" stroke="#0b5a8a" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M2 9h20M9 3l-2 6 5 12M15 3l2 6-5 12" fill="none" stroke="#bfeaff" strokeWidth="0.9" />
              </svg>
            </div>
          </div>

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

        {/* نوار پایین: رخش، مراحل، قدرت رستم، سلاح و زره، لباس‌ها */}
        <div className="hub-sub-actions">
          <button className="shahnameh-btn nav-tile" onClick={() => showSoon('رخش')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 21v-6l-3-3 1-4 3-4 1-3 3 2 3 2 3 3v3l-3 2v8" />
              <path d="M10.5 5.5l1 3M14 10.5h.01" />
            </svg>
            <span>رخش</span>
          </button>

          <button className="shahnameh-btn nav-tile" onClick={() => showSoon('مراحل')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3h12a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2H7a2 2 0 0 1-2-2z" />
              <path d="M9 8h6M9 12h6M9 16h3" />
            </svg>
            <span>مراحل</span>
          </button>

          <button className="shahnameh-btn nav-tile" onClick={() => showSoon('قدرت رستم')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10v4M5 7v10M19 7v10M22 10v4M5 12h14" />
            </svg>
            <span>قدرت رستم</span>
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

          <button
            className="shahnameh-btn nav-tile"
            onClick={() => setActiveModal && setActiveModal('EQUIPMENT')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15a8 8 0 0 1 16 0v3H4z" />
              <path d="M12 7V3M8 11h8M9 18v-3M15 18v-3" />
            </svg>
            <span>لباس‌ها</span>
          </button>
        </div>

      </div>

      {/* پیام کوتاه «به‌زودی» */}
      {toast && <div className="menu-toast" role="status">{toast}</div>}

      {/* نمایش پنجره‌های مودال */}
      {activeModal === 'SHOP' && <ShopModal />}
      {activeModal === 'EQUIPMENT' && <EquipmentModal />}
    </div>
  );
}
