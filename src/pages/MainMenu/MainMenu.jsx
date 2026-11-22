import { useEffect, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { initAndPlayMusic, toggleMuteMusic } from '../../utils/soundManager';
import { KHANS_DATA } from '../../game/data/khansData';
import EquipmentModal from '../Shop/EquipmentModal';
import { ZarIcon, GoharIcon } from '../../components/CurrencyIcon';

// کامپوننت‌های اختصاصی هر دکمه
import DailyRewardsModal, { getTodayKey } from '../MenuModals/DailyRewardsModal';
import MissionsModal from '../MenuModals/MissionsModal';
import WatchAdModal from '../MenuModals/WatchAdModal';
import GiftModal from '../MenuModals/GiftModal';
import RakhshModal from '../MenuModals/RakhshModal';
import RostamPowerModal from '../MenuModals/RostamPowerModal';
import ClothesModal from '../MenuModals/ClothesModal';
import BazaarModal from '../MenuModals/BazaarModal';

import mainBg from '../../assets/images/main-bg.png';
import TitelNeme from '../../assets/images/titel-neme.png';
import '../../styles/App.css';

// =========================================================================
// عکس دکمه‌ها (دقیقاً طبق فایل خودتان)
// =========================================================================
import startBtnFile from '../../assets/images/start-btn.png';
import rakhshBtnFile from '../../assets/images/rakhsh-btn.png';
import powerBtnFile from '../../assets/images/power-btn.png';
import equipBtnFile from '../../assets/images/equip-btn.png';
import clothesBtnFile from '../../assets/images/clothes-btn.png';
import AdvertisementImg from '../../assets/images/AdvertisementImg.png';
import MarketImg from '../../assets/images/MarketImg.png';
import DailyRewardsImg from '../../assets/images/DailyRewardsImg.png';
import mssionsImg from '../../assets/images/mssions.png';

// =========================================================================
// عکس اختصاصی کارت هر ۷ خوان
// =========================================================================
import khan1CardImg from '../../assets/images/khans/khan1-card.png';
import khan2CardImg from '../../assets/images/khans/khan2-card.png';
import khan3CardImg from '../../assets/images/khans/khan3-card.png';
import khan4CardImg from '../../assets/images/khans/khan4-card.png';
import khan5CardImg from '../../assets/images/khans/khan5-card.png';
import khan6CardImg from '../../assets/images/khans/khan6-card.png';
import khan7CardImg from '../../assets/images/khans/khan7-card.png';

const KHAN_IMAGES = {
  1: khan1CardImg,
  2: khan2CardImg,
  3: khan3CardImg,
  4: khan4CardImg,
  5: khan5CardImg,
  6: khan6CardImg,
  7: khan7CardImg,
};

const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const TOTAL_DAILY_DAYS = 100;
const KHAN_ORDINALS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم'];

// بررسی اینکه آیا هدیه یک خوان خاص قبلاً دریافت شده یا نه
function isKhanGiftClaimed(claimedIds, khanNum) {
  const target = String(khanNum);
  const pattern = new RegExp(`(?:^|[_-]|khan)${target}(?:$|[_-])`, 'i');
  return claimedIds.some((id) => {
    const str = String(id ?? '');
    return str === target || pattern.test(str);
  });
}

export default function MainMenu() {
  const [toast, setToast] = useState('');
  const [slideDir, setSlideDir] = useState('next');
  const [todayKey, setTodayKey] = useState(() => getTodayKey());

  const hasHydrated = useGameStore((state) => state._hasHydrated);
  const coins = useGameStore((state) => state.coins ?? 1500);
  const currentKhan = useGameStore((state) => state.currentKhan ?? 1);
  const activeModal = useGameStore((state) => state.activeModal);
  const setActiveModal = useGameStore((state) => state.setActiveModal);
  const setGameStage = useGameStore((state) => state.setGameStage);

  const gems = useGameStore((state) => state.gems ?? 120);
  const level = useGameStore((state) => state.level ?? state.playerLevel ?? 1);
  const xp = useGameStore((state) => state.xp ?? 0);
  const xpToNext = useGameStore((state) => state.xpToNext ?? 100);
  const rawKhanStars = useGameStore((state) => state.khanStars);
  const storeUnlockedKhan = useGameStore(
    (state) => state.unlockedKhan ?? state.maxUnlockedKhan ?? 1
  );
  const isGameCompleted = useGameStore((state) => state.isGameCompleted ?? false);
  const dailyClaimedCount = useGameStore((state) => state.dailyRewards?.claimedCount ?? 0);
  const dailyLastClaimDate = useGameStore((state) => state.dailyRewards?.lastClaimDate ?? null);
  const rawClaimedGifts = useGameStore((state) => state.gifts?.claimedIds);

  const isMuted = useGameStore((state) => state.settings?.isMuted ?? false);
  const setMuted = useGameStore((state) => state.setMuted);
  const setCurrentKhan = useGameStore((state) => state.setCurrentKhan);

  const khanStars = rawKhanStars || EMPTY_OBJ;
  const claimedGiftIds = rawClaimedGifts || EMPTY_ARR;
  const totalKhans = Object.keys(KHANS_DATA || EMPTY_OBJ).length || 7;

  // محاسبه بالاترین خوان باز شده فقط از حافظه یکپارچه بازی
  const completedHighest = Object.entries(khanStars).reduce((max, [id, starCount]) => {
    return Number(starCount) > 0 ? Math.max(max, Number(id) + 1) : max;
  }, 1);

  const unlockedKhan = Math.min(
    totalKhans,
    Math.max(1, storeUnlockedKhan, completedHighest)
  );

  // ۱) وضعیت دایره قرمز جایزه روزانه
  const hasDailyRewardNotif =
    hasHydrated &&
    dailyClaimedCount < TOTAL_DAILY_DAYS &&
    dailyLastClaimDate !== todayKey;

  // ۲) وضعیت دایره قرمز هدیه (فقط وقتی خوانی رد شده و هدیه‌اش هنوز دریافت نشده)
  let hasGiftNotif = false;
  if (hasHydrated) {
    for (let k = 1; k <= totalKhans; k++) {
      const isKhanPassed =
        Number(khanStars[k] || 0) > 0 ||
        unlockedKhan > k ||
        (k === totalKhans && isGameCompleted);

      if (isKhanPassed && !isKhanGiftClaimed(claimedGiftIds, k)) {
        hasGiftNotif = true;
        break;
      }
    }
  }

  const khanInfo = KHANS_DATA?.[currentKhan] || KHANS_DATA?.[1] || { title: '' };
  const stars = khanStars[currentKhan] ?? 0;
  const isKhanLocked = currentKhan > unlockedKhan;
  const khanCardImage = KHAN_IMAGES[currentKhan] || khanInfo?.image || null;
  const xpPercent = Math.min(100, Math.max(0, (xp / (xpToNext || 100)) * 100));

  // به‌روزرسانی خودکار تاریخ هنگام تغییر روز (حتی اگر بازی در پس‌زمینه باز بماند)
  useEffect(() => {
    const syncToday = () => {
      const nextKey = getTodayKey();
      setTodayKey((prev) => (prev === nextKey ? prev : nextKey));
    };

    const handleVisibility = () => {
      if (!document.hidden) syncToday();
    };

    const interval = setInterval(syncToday, 60000);
    window.addEventListener('focus', syncToday);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncToday);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isMuted) {
      initAndPlayMusic();
    }
  }, [hasHydrated, isMuted]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  const openModal = (modalName) => setActiveModal && setActiveModal(modalName);
  const closeModal = () => setActiveModal && setActiveModal(null);

  const selectKhan = (targetKhan) => {
    if (targetKhan < 1 || targetKhan > totalKhans || targetKhan === currentKhan) return;
    setSlideDir(targetKhan > currentKhan ? 'next' : 'prev');

    if (typeof setCurrentKhan === 'function') {
      setCurrentKhan(targetKhan);
    } else {
      useGameStore.setState({ currentKhan: targetKhan });
    }
  };

  const goKhan = (dir) => {
    selectKhan(currentKhan + dir);
  };

  const handleStartBattle = () => {
    if (isKhanLocked) {
      const prevName = KHAN_ORDINALS[currentKhan - 2] || currentKhan - 1;
      setToast(`ابتدا خوان ${prevName} را با پیروزی به پایان برسان!`);
      return;
    }
    setGameStage('PLAYING');
  };

  const handleToggleSound = (e) => {
    e.stopPropagation();
    initAndPlayMusic();
    let nextMuteState = toggleMuteMusic();
    if (nextMuteState === isMuted) {
      nextMuteState = toggleMuteMusic();
    }
    setMuted?.(nextMuteState);
  };

  return (
    <div
      className="main-menu-container"
      style={{
        backgroundImage: `url(${mainBg})`,
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
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* عنوان بازی */}
      <div className="game-title-block">
        <img src={TitelNeme} alt="هفت خوان رستم" />
      </div>

      {/* ستون سمت چپ */}
      <div className="side-menu">
        <button
          className={`nav-tile ${activeModal === 'DAILY_REWARDS' ? 'is-active' : ''}`}
          onClick={() => openModal('DAILY_REWARDS')}
        >
          {hasDailyRewardNotif && <i className="notif-dot" aria-hidden="true" />}
          <img src={DailyRewardsImg} alt="جوایز روزانه" />
          <span>جایزه روزانه</span>
        </button>

        <button
          className={`nav-tile ${activeModal === 'MISSIONS' ? 'is-active' : ''}`}
          onClick={() => openModal('MISSIONS')}
        >
          <img src={mssionsImg} alt="ماموریت ها" />
          <span>ماموریت‌ها</span>
        </button>

        <button
          className={`nav-tile ${activeModal === 'WATCH_AD' ? 'is-active' : ''}`}
          onClick={() => openModal('WATCH_AD')}
        >
          <img src={AdvertisementImg} alt="تبلیغ" />
          <span>تماشا تبلیغ</span>
        </button>

        <button
          className={`sub-action-btn ${activeModal === 'SHOP' ? 'is-active' : ''}`}
          onClick={() => openModal('SHOP')}
        >
          <img src={MarketImg} alt="بازارچه" />
          <span>بازارچه</span>
        </button>
      </div>

      {/* کارت خوان فعلی با انیمیشن سبک GPU و حالت قفل */}
      <div className={`khan-card ${isKhanLocked ? 'is-locked' : ''}`}>
        <div
          key={currentKhan}
          className={`khan-slide-stage ${slideDir === 'next' ? 'khan-enter-next' : 'khan-enter-prev'}`}
        >
          <div className="khan-card-art">
            {khanCardImage && (
              <img
                src={khanCardImage}
                alt={`خوان ${KHAN_ORDINALS[currentKhan - 1] || currentKhan}`}
                className="khan-card-img"
                decoding="async"
                draggable="false"
              />
            )}

            {/* لایه قفل برای خوان‌های باز نشده */}
            {isKhanLocked && (
              <div className="khan-lock-overlay">
                <div className="khan-lock-badge">
                  <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                    <path
                      d="M7 10V7a5 5 0 0 1 10 0v3h1.5A1.5 1.5 0 0 1 20 11.5v8A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-8A1.5 1.5 0 0 1 5.5 10H7zm2 0h6V7a3 3 0 0 0-6 0v3zm3 4a1.6 1.6 0 0 0-.8 3v1.5h1.6V17a1.6 1.6 0 0 0-.8-3z"
                      fill="#ffd966"
                    />
                  </svg>
                </div>
                <span className="khan-lock-text">
                  قفل — خوان {KHAN_ORDINALS[currentKhan - 2] || currentKhan - 1} را تمام کن
                </span>
              </div>
            )}
          </div>

          <div className="khan-card-title">
            خوان {KHAN_ORDINALS[currentKhan - 1] || currentKhan}
          </div>
          <div className="khan-card-stars">
            {isKhanLocked ? (
              <span className="khan-locked-pill">🔒 قفل شده</span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z"
                    fill="#ffd700"
                    stroke="#8a5a00"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{stars}/10</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* کنترلر جابه‌جایی بین ۷ خوان */}
      <div className="khan-pager">
        <button
          className="khan-arrow"
          onClick={() => goKhan(-1)}
          disabled={currentKhan <= 1}
          aria-label="خوان قبلی"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 5 16 12 9 19" />
          </svg>
        </button>

        <div className="khan-dots">
          {Array.from({ length: totalKhans }, (_, i) => {
            const num = i + 1;
            const lockedDot = num > unlockedKhan;
            return (
              <button
                key={num}
                type="button"
                onClick={() => selectKhan(num)}
                aria-label={`خوان ${KHAN_ORDINALS[i] || num}`}
                className={`khan-dot ${num === currentKhan ? 'is-active' : ''} ${lockedDot ? 'is-locked' : 'is-unlocked'}`}
              />
            );
          })}
        </div>

        <button
          className="khan-arrow"
          onClick={() => goKhan(1)}
          disabled={currentKhan >= totalKhans}
          aria-label="خوان بعدی"
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
            onClick={() => openModal('GIFT')}
            aria-label="هدیه"
          >
            {hasGiftNotif && <span className="notif-dot" aria-hidden="true" />}
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="13" rx="1.5" />
              <path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z" />
            </svg>
          </button>

          {/* گوهر */}
          <div className="shahnameh-coin-box gem-box" title="گوهر">
            <span className="coin-text">{(gems || 0).toLocaleString()}</span>
            <div className="coin-emblem">
              <GoharIcon />
            </div>
          </div>

          {/* زر */}
          <div className="shahnameh-coin-box" title="زر">
            <span className="coin-text">{(coins || 0).toLocaleString()}</span>
            <div className="coin-emblem">
              <ZarIcon />
            </div>
          </div>
        </div>

        {/* دکمه اصلی شروع رزم */}
        <button
          className={`shahnameh-btn battle-start-btn ${isKhanLocked ? 'is-khan-locked' : ''}`}
          onClick={handleStartBattle}
        >
          {startBtnFile && <img src={startBtnFile} alt="آغاز رزم" className="start-btn-img" />}
          <div className="battle-btn-text">
            <span className="battle-main-title">
              {isKhanLocked ? '🔒 قفل است' : 'آغاز رزم'}
            </span>
            <span className="battle-sub-title">{khanInfo.title}</span>
          </div>
        </button>

        {/* نوار پایین: رخش، قدرت رستم، سلاح و زره، لباس‌ها */}
        <div className="hub-sub-actions">
          <button
            className={`shahnameh-btn nav-tile ${activeModal === 'RAKHSH' ? 'is-active' : ''}`}
            onClick={() => openModal('RAKHSH')}
          >
            {rakhshBtnFile && <img src={rakhshBtnFile} alt="رخش" className="nav-tile-img" />}
            <span>رخش</span>
          </button>

          <button
            className={`shahnameh-btn nav-tile ${activeModal === 'POWER' ? 'is-active' : ''}`}
            onClick={() => openModal('POWER')}
          >
            {powerBtnFile && <img src={powerBtnFile} alt="قدرت رستم" className="nav-tile-img" />}
            <span>قدرت رستم</span>
          </button>

          <button
            className={`shahnameh-btn nav-tile sub-action-btn ${activeModal === 'EQUIPMENT' ? 'is-active' : ''}`}
            onClick={() => openModal('EQUIPMENT')}
          >
            {equipBtnFile && <img src={equipBtnFile} alt="سلاح و زره" className="nav-tile-img" />}
            <span className="start-battle-btn">سلاح و زره</span>
          </button>

          <button
            className={`shahnameh-btn nav-tile ${activeModal === 'CLOTHES' ? 'is-active' : ''}`}
            onClick={() => openModal('CLOTHES')}
          >
            {clothesBtnFile && <img src={clothesBtnFile} alt="لباس‌ها" className="nav-tile-img" />}
            <span>لباس‌ها</span>
          </button>
        </div>
      </div>

      {/* پیام کوتاه */}
      {toast && <div className="menu-toast" role="status">{toast}</div>}

      {/* رندر کامپوننت اختصاصی هر دکمه */}
      {activeModal === 'SHOP' && <BazaarModal onClose={closeModal} />}
      {activeModal === 'EQUIPMENT' && <EquipmentModal onClose={closeModal} />}
      {activeModal === 'DAILY_REWARDS' && <DailyRewardsModal onClose={closeModal} />}
      {activeModal === 'MISSIONS' && <MissionsModal onClose={closeModal} />}
      {activeModal === 'WATCH_AD' && <WatchAdModal onClose={closeModal} />}
      {activeModal === 'GIFT' && <GiftModal onClose={closeModal} />}
      {activeModal === 'RAKHSH' && <RakhshModal onClose={closeModal} />}
      {activeModal === 'POWER' && <RostamPowerModal onClose={closeModal} />}
      {activeModal === 'CLOTHES' && <ClothesModal onClose={closeModal} />}
    </div>
  );
}  