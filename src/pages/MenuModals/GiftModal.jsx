// صندوق هدایا (هدیه خوش‌آمدگویی + ۱۰ الماس برای فتح هر خوان — متصل به حافظه موبایل)
import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { KHANS_DATA } from '../../game/data/khansData';

const EMPTY_ARR = [];
const EMPTY_OBJ = {};
const KHAN_ORDINALS = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم'];
const KHAN_GEM_REWARD = 10;

// بررسی اینکه آیا بازیکن حداقل یک هدیه قابل دریافت دارد یا نه (برای نقطه قرمز در MainMenu)
export function hasAvailableGifts(state) {
  const s = state || useGameStore.getState();
  const claimedIds = s.gifts?.claimedIds || EMPTY_ARR;
  const unlockedKhan = s.unlockedKhan ?? 1;
  const khanStars = s.khanStars || EMPTY_OBJ;
  const isGameCompleted = Boolean(s.isGameCompleted);

  if (!claimedIds.includes('welcome_gift_500')) return true;

  for (let khanId = 1; khanId <= 7; khanId++) {
    const isCompleted =
      Number(khanStars[khanId]) > 0 ||
      khanId < unlockedKhan ||
      (khanId === 7 && isGameCompleted);

    if (isCompleted && !claimedIds.includes(`khan_${khanId}_gems`)) {
      return true;
    }
  }
  return false;
}

export default function GiftModal({ onClose }) {
  const rawClaimedIds = useGameStore((state) => state.gifts?.claimedIds);
  const unlockedKhan = useGameStore((state) => state.unlockedKhan ?? 1);
  const rawKhanStars = useGameStore((state) => state.khanStars);
  const isGameCompleted = useGameStore((state) => Boolean(state.isGameCompleted));
  const claimGift = useGameStore((state) => state.claimGift);

  const claimedIds = rawClaimedIds || EMPTY_ARR;
  const khanStars = rawKhanStars || EMPTY_OBJ;

  const [msg, setMsg] = useState({ type: '', text: '' });

  const isWelcomeClaimed = claimedIds.includes('welcome_gift_500');

  const handleClaim = (giftId, reward, successText) => {
    const result = claimGift(giftId, reward);
    if (!result?.success) {
      setMsg({ type: 'error', text: result?.message || 'این هدیه قبلاً دریافت شده است!' });
      return;
    }
    setMsg({ type: 'success', text: successText });
  };

  return (
    <div className="rpg-modal-overlay" onClick={onClose}>
      <div className="rpg-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="rpg-modal-header">
          <h5 className="m-0 text-warning fw-bold">🎀 صندوق هدایا</h5>
          <button className="rpg-close-btn" onClick={onClose} aria-label="بستن">
            ✕
          </button>
        </div>

        {msg.text && (
          <div
            className={`rpg-alert ${
              msg.type === 'error' ? 'alert-danger-rpg' : 'alert-success-rpg'
            }`}
          >
            {msg.text}
          </div>
        )}

        <div
          className="rpg-modal-body"
          style={{ maxHeight: '62dvh', overflowY: 'auto', paddingRight: '4px' }}
        >
          {/* هدیه خوش‌آمدگویی */}
          <div className="shop-item-card">
            <div className="shop-item-icon">📦</div>
            <div className="shop-item-info">
              <div className="shop-item-title">هدیه خوش‌آمدگویی پهلوان</div>
              <div className="shop-item-desc">۵۰۰ سکه زر برای آماده‌سازی در نبرد هفت‌خوان</div>
            </div>
            <button
              className={`rpg-buy-btn ${isWelcomeClaimed ? 'disabled' : ''}`}
              disabled={isWelcomeClaimed}
              onClick={() =>
                handleClaim(
                  'welcome_gift_500',
                  { coins: 500 },
                  'هدیه ویژه زابلستان (+500 سکه) با موفقیت دریافت شد!'
                )
              }
            >
              <span>{isWelcomeClaimed ? 'دریافت شد ✓' : 'دریافت'}</span>
              {!isWelcomeClaimed && <small>+500 سکه</small>}
            </button>
          </div>

          {/* هدایای فتح هر ۷ خوان (هر خوان = ۱۰ الماس) */}
          {KHAN_ORDINALS.map((ordinal, index) => {
            const khanId = index + 1;
            const giftId = `khan_${khanId}_gems`;
            const khanTitle = KHANS_DATA?.[khanId]?.title || '';

            const isCompleted =
              Number(khanStars[khanId]) > 0 ||
              khanId < unlockedKhan ||
              (khanId === 7 && isGameCompleted);

            const isClaimed = claimedIds.includes(giftId);
            const canClaim = isCompleted && !isClaimed;

            return (
              <div
                key={giftId}
                className="shop-item-card"
                style={!isCompleted && !isClaimed ? { opacity: 0.72 } : undefined}
              >
                <div className="shop-item-icon">{isClaimed ? '✅' : isCompleted ? '💎' : '🔒'}</div>
                <div className="shop-item-info">
                  <div className="shop-item-title">
                    فتح خوان {ordinal} {khanTitle ? `(${khanTitle})` : ''}
                  </div>
                  <div className="shop-item-desc">
                    {isCompleted
                      ? `پاداش پیروزی در خوان ${ordinal}: ${KHAN_GEM_REWARD} الماس آبی`
                      : `خوان ${ordinal} را با پیروزی به پایان برسان تا قفل این هدیه باز شود`}
                  </div>
                </div>
                <button
                  className={`rpg-buy-btn ${!canClaim ? 'disabled' : ''}`}
                  disabled={!canClaim}
                  onClick={() =>
                    handleClaim(
                      giftId,
                      { gems: KHAN_GEM_REWARD },
                      `پاداش فتح خوان ${ordinal} (+${KHAN_GEM_REWARD} الماس) به خزانه اضافه شد!`
                    )
                  }
                >
                  <span>
                    {isClaimed ? 'دریافت شد ✓' : isCompleted ? 'دریافت' : '🔒 قفل'}
                  </span>
                  {canClaim && <small>+{KHAN_GEM_REWARD} الماس</small>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}