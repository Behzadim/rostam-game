// جوایز روزانه (۲۰ روزه - متصل به حافظه بومی موبایل در gameStore)
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { ZarIcon, GoharIcon } from '../../components/CurrencyIcon';
import '../../styles/DailyRewardsModal.css';

// =========================================================================
// محل وارد کردن عکس نوشدارو و پر سیمرغ
// بعد از قرار دادن فایل‌ها در src/assets/images/ از کامنت خارج کنید:
// =========================================================================
import nooshdarooFile from '../../assets/images/bazaar-nooshdaroo.png';
import simorghFile from '../../assets/images/bazaar-simorgh.png';

const NOOSHDAROO_IMG = nooshdarooFile; // تغییر دهید به: nooshdarooFile
const SIMORGH_IMG = simorghFile;    // تغییر دهید به: simorghFile

export const TOTAL_DAYS = 20;
const EMPTY_DAILY = { claimedCount: 0, lastClaimDate: null, streak: 0 };

// تاریخ روز جاری به فرمت YYYY-MM-DD (بر اساس ساعت محلی دستگاه بازیکن)
export function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// خواندن وضعیت ذخیره شده از استور یکپارچه موبایل
export function getDailyRewardState() {
  const dr = useGameStore.getState().dailyRewards || EMPTY_DAILY;
  return {
    claimedCount: Math.min(TOTAL_DAYS, Math.max(0, Number(dr.claimedCount) || 0)),
    lastClaimDate: dr.lastClaimDate || null,
  };
}

// تابع بررسی نمایش یا مخفی شدن دایره قرمز در MainMenu
export function hasAvailableDailyReward() {
  const { claimedCount, lastClaimDate } = getDailyRewardState();
  if (claimedCount >= TOTAL_DAYS) return false;
  return lastClaimDate !== getTodayKey();
}

// نمایش تصویر هر جایزه (زر و گوهر از CurrencyIcon، نوشدارو و پر سیمرغ از عکس اختصاصی)
function renderRewardImage(item, size = 40) {
  if (item.type === 'coins') {
    return <ZarIcon size={size} className="daily-reward-img" />;
  }
  if (item.type === 'gems') {
    return <GoharIcon size={size} className="daily-reward-img" />;
  }
  if (item.type === 'potion') {
    return NOOSHDAROO_IMG ? (
      <img
        src={NOOSHDAROO_IMG}
        alt="نوشدارو"
        className="daily-reward-img"
        style={{ width: size, height: size }}
        draggable="false"
      />
    ) : (
      <span>🧪</span>
    );
  }
  if (item.type === 'simorgh') {
    return SIMORGH_IMG ? (
      <img
        src={SIMORGH_IMG}
        alt="پر سیمرغ"
        className="daily-reward-img"
        style={{ width: size, height: size }}
        draggable="false"
      />
    ) : (
      <span>🪶</span>
    );
  }
  return null;
}

// ساخت دقیق جدول ۲۰ روزه جوایز
function buildTwentyRewards() {
  const list = [];
  let coinAmount = 150;

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    if (day === 5) {
      list.push({
        day,
        type: 'gems',
        title: 'گوهر شاهوار',
        amountLabel: '۱۰ گوهر',
        gems: 10,
        isSpecial: true,
      });
    } else if (day === 10) {
      list.push({
        day,
        type: 'potion',
        title: 'نوشدارو',
        amountLabel: '۱ نوشدارو',
        nooshdaroo: 1,
        isSpecial: true,
      });
    } else if (day === 15) {
      list.push({
        day,
        type: 'gems',
        title: 'گوهر هفت‌خوان',
        amountLabel: '۱۵ گوهر',
        gems: 15,
        isSpecial: true,
      });
    } else if (day === 20) {
      list.push({
        day,
        type: 'simorgh',
        title: 'پر سیمرغ',
        amountLabel: '۲ پر سیمرغ',
        simorghFeathers: 2,
        isSpecial: true,
      });
    } else {
      list.push({
        day,
        type: 'coins',
        title: 'سکه زر',
        amountLabel: `${coinAmount} زر`,
        coins: coinAmount,
        isSpecial: false,
      });
      coinAmount += 20;
    }
  }

  return list;
}

const DAILY_REWARDS = buildTwentyRewards();

export default function DailyRewardsModal({ onClose }) {
  const rawDailyRewards = useGameStore((state) => state.dailyRewards);
  const claimDailyReward = useGameStore((state) => state.claimDailyReward);

  const rewardState = rawDailyRewards || EMPTY_DAILY;
  const [msg, setMsg] = useState('');
  const activeCardRef = useRef(null);

  const claimedCount = Math.min(TOTAL_DAYS, Math.max(0, Number(rewardState.claimedCount) || 0));
  const lastClaimDate = rewardState.lastClaimDate || null;
  const isAllDone = claimedCount >= TOTAL_DAYS;
  const canClaimToday = !isAllDone && lastClaimDate !== getTodayKey();
  const nextDayNumber = isAllDone ? TOTAL_DAYS : claimedCount + 1;
  const currentReward = DAILY_REWARDS[nextDayNumber - 1];

  // اسکرول خودکار به روز فعلی هنگام باز شدن پنجره
  useEffect(() => {
    if (activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleClaim = () => {
    if (!canClaimToday || !currentReward) return;

    const result = claimDailyReward(currentReward.day, currentReward);
    if (!result?.success) {
      setMsg(result?.message || 'خطا در دریافت جایزه روزانه!');
      return;
    }

    setMsg(`جایزه روز ${currentReward.day} (${currentReward.title}: ${currentReward.amountLabel}) دریافت شد!`);

    // اطلاع‌رسانی لحظه‌ای برای هر بخشی که به این رویداد گوش می‌دهد
    window.dispatchEvent(new Event('daily-reward-updated'));
  };

  return (
    <div className="daily-overlay" onClick={onClose}>
      <div className="daily-modal" onClick={(e) => e.stopPropagation()}>

        {/* هدر پنجره */}
        <div className="daily-header">
          <div className="daily-header-right">
            <h5 className="daily-title">🎁 جوایز روزانه (۲۰ روز)</h5>
            <span className="daily-counter">
              دریافت‌شده: {claimedCount} / {TOTAL_DAYS}
            </span>
          </div>
          <button className="daily-close-btn" onClick={onClose} aria-label="بستن">
            ✕
          </button>
        </div>

        {/* نوار پیشرفت ۲۰ روز */}
        <div className="daily-progress-track">
          <div
            className="daily-progress-fill"
            style={{ width: `${(claimedCount / TOTAL_DAYS) * 100}%` }}
          />
        </div>

        {/* پیام دریافت جایزه */}
        {msg && <div className="daily-alert">{msg}</div>}

        {/* شبکه ۲۰ کارت جایزه */}
        <div className="daily-grid">
          {DAILY_REWARDS.map((item) => {
            const isClaimed = item.day <= claimedCount;
            const isTodayAvailable = canClaimToday && item.day === nextDayNumber;
            const isNextLocked = !canClaimToday && !isAllDone && item.day === nextDayNumber;

            return (
              <div
                key={item.day}
                ref={item.day === nextDayNumber ? activeCardRef : null}
                onClick={isTodayAvailable ? handleClaim : undefined}
                className={[
                  'daily-card',
                  item.isSpecial ? 'is-special' : '',
                  isClaimed ? 'is-claimed' : '',
                  isTodayAvailable ? 'is-available' : '',
                  isNextLocked ? 'is-tomorrow' : '',
                ].join(' ')}
              >
                <div className="daily-card-day">روز {item.day}</div>

                <div className="daily-card-icon">
                  {renderRewardImage(item, 40)}
                </div>

                <div className="daily-card-label">{item.amountLabel}</div>

                {isClaimed && <span className="daily-badge claimed">✓</span>}
                {isTodayAvailable && <span className="daily-badge ready">امروز</span>}
                {isNextLocked && <span className="daily-badge tomorrow">فردا</span>}
              </div>
            );
          })}
        </div>

        {/* نوار پایین: دکمه دریافت جایزه روز جاری */}
        <div className="daily-footer">
          {isAllDone ? (
            <div className="daily-status-done">
              🏆 تبریک! تمام ۲۰ جایزه روزانه با موفقیت دریافت شد.
            </div>
          ) : canClaimToday ? (
            <button className="daily-claim-btn" onClick={handleClaim}>
              <span>دریافت جایزه روز {currentReward.day}</span>
              <span className="daily-claim-preview">
                ({renderRewardImage(currentReward, 22)} {currentReward.amountLabel})
              </span>
            </button>
          ) : (
            <div className="daily-status-wait">
              ⏳ جایزه امروز دریافت شد؛ فردا برای جایزه روز {nextDayNumber} برگرد!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}