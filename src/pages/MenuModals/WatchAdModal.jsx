// تبلیغات جایزه‌دار (نامحدود - هر تبلیغ ۵۰ سکه - متصل به حافظه بومی موبایل)
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';

const EMPTY_ADS = { lastWatchDate: null, watchedToday: 0, totalWatched: 0 };
const REWARD_COINS = 50;
const AD_DURATION_SEC = 5;

export default function WatchAdModal({ onClose }) {
  const rawAds = useGameStore((state) => state.ads);
  const recordAdWatched = useGameStore((state) => state.recordAdWatched);

  const ads = rawAds || EMPTY_ADS;

  const [watching, setWatching] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SEC);
  const [adFinished, setAdFinished] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // جلوگیری از ثبت دوباره‌ی جایزه در StrictMode
  const rewardGrantedRef = useRef(false);

  // تایمر شمارش معکوس تبلیغ آزمایشی
  useEffect(() => {
    if (!watching || adFinished) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [watching, adFinished]);

  // اعطای جایزه دقیقاً به محض رسیدن شمارش به صفر
  useEffect(() => {
    if (!watching || secondsLeft > 0 || rewardGrantedRef.current) return;

    rewardGrantedRef.current = true;
    setAdFinished(true);
    setConfirmSkip(false);
    recordAdWatched({ coins: REWARD_COINS, gems: 0 });
  }, [watching, secondsLeft, recordAdWatched]);

  const startWatchAd = () => {
    if (watching) return;

    // نکته برای زمان خروجی APK:
    // اینجا می‌توانی پلاگین Capacitor (تپسل یا AdMob) را صدا بزنی
    rewardGrantedRef.current = false;
    setMsg({ type: '', text: '' });
    setConfirmSkip(false);
    setAdFinished(false);
    setSecondsLeft(AD_DURATION_SEC);
    setWatching(true);
  };

  const handleCloseAdOverlay = () => {
    if (!watching) return;

    if (adFinished) {
      setWatching(false);
      setAdFinished(false);
      setMsg({
        type: 'success',
        text: `تبریک! +${REWARD_COINS} سکه زر به خزانه اضافه شد.`,
      });
      return;
    }

    // اگر هنوز تمام نشده، هشدار بده
    setConfirmSkip(true);
  };

  const handleForceSkip = () => {
    setWatching(false);
    setAdFinished(false);
    setConfirmSkip(false);
    setMsg({
      type: 'error',
      text: 'تبلیغ را نیمه‌کاره بستی؛ جایزه‌ای تعلق نگرفت.',
    });
  };

  const progressPercent = watching
    ? Math.min(100, ((AD_DURATION_SEC - secondsLeft) / AD_DURATION_SEC) * 100)
    : 0;

  return (
    <>
      <div
        className="rpg-modal-overlay"
        onClick={watching ? undefined : onClose}
      >
        <div className="rpg-modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="rpg-modal-header">
            <div>
              <h5 className="m-0 text-warning fw-bold">🎬 تماشای تبلیغ و جایزه</h5>
              <small style={{ color: '#d8c59e', fontSize: '0.78rem' }}>
                تماشای نامحدود • کل تبلیغ‌های دیده‌شده: {ads.totalWatched || 0}
              </small>
            </div>
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

          <div className="rpg-modal-body">
            <div className="shop-item-card">
              <div className="shop-item-icon">🎥</div>
              <div className="shop-item-info">
                <div className="shop-item-title">ویدیوی سکه رایگان</div>
                <div className="shop-item-desc">
                  هر چقدر دوست داری تبلیغ ببین و با هر ویدیو ۵۰ سکه زر بگیر.
                </div>
              </div>
              <button
                className={`rpg-buy-btn ${watching ? 'disabled' : ''}`}
                disabled={watching}
                onClick={startWatchAd}
              >
                <span>{watching ? '...' : 'تماشا'}</span>
                <small>+{REWARD_COINS}</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* پخش‌کننده تمام‌صفحه تبلیغ آزمایشی (شبیه‌ساز AdMob / تپسل) */}
      {watching && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'radial-gradient(circle at center, #1e2433 0%, #0a0c12 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            direction: 'rtl',
          }}
        >
          {/* نوار بالای تبلیغ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <span
              style={{
                background: 'rgba(255, 193, 7, 0.18)',
                border: '1px solid rgba(255, 193, 7, 0.55)',
                color: '#ffd866',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              TEST AD • تبلیغ آزمایشی
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {adFinished ? (
                <button
                  type="button"
                  onClick={handleCloseAdOverlay}
                  style={{
                    background: '#22c55e',
                    color: '#052e16',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                  }}
                >
                  ✓ دریافت جایزه و بستن
                </button>
              ) : (
                <>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                    }}
                  >
                    جایزه تا {secondsLeft} ثانیه دیگر...
                  </span>
                  <button
                    type="button"
                    onClick={handleCloseAdOverlay}
                    aria-label="بستن تبلیغ"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.35)',
                      background: 'rgba(0,0,0,0.45)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>

          {/* محتوای مرکزی تبلیغ آزمایشی */}
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              margin: '0 auto',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '20px',
              padding: '26px 20px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ fontSize: '3.2rem', marginBottom: '10px' }}>
              {adFinished ? '🎉' : '🎥'}
            </div>
            <h4 style={{ margin: '0 0 8px', color: '#ffd866', fontWeight: 800 }}>
              {adFinished ? 'جایزه آماده دریافت است!' : 'تبلیغ ویدیویی جایزه‌دار (حالت تست)'}
            </h4>
            <p style={{ margin: '0 0 18px', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {adFinished
                ? `پاداش +${REWARD_COINS} سکه زر با موفقیت در حافظه بازی ثبت شد.`
                : 'این صفحه جایگزین تبلیغ واقعی AdMob یا تپسل در حالت توسعه است تا کل فرآیند پاداش و ذخیره را تست کنی.'}
            </p>

            {/* نوار پیشرفت پخش تبلیغ */}
            <div
              style={{
                width: '100%',
                height: '10px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.12)',
                overflow: 'hidden',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: adFinished
                    ? 'linear-gradient(90deg, #22c55e, #86efac)'
                    : 'linear-gradient(90deg, #f59e0b, #fde047)',
                  transition: 'width 0.9s linear',
                }}
              />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              پاداش این تبلیغ: <strong style={{ color: '#ffd866' }}>+{REWARD_COINS} سکه زر</strong>
            </div>

            {/* پنجره هشدار بستن زودهنگام */}
            {confirmSkip && !adFinished && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '1px solid rgba(239, 68, 68, 0.55)',
                }}
              >
                <div style={{ fontSize: '0.84rem', marginBottom: '10px', color: '#fecaca' }}>
                  اگر الان تبلیغ را ببندی، جایزه (+{REWARD_COINS} سکه) را از دست می‌دهی!
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmSkip(false)}
                    style={{
                      background: '#f59e0b',
                      color: '#1f1300',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ادامه تماشا
                  </button>
                  <button
                    type="button"
                    onClick={handleForceSkip}
                    style={{
                      background: 'transparent',
                      color: '#fca5a5',
                      border: '1px solid rgba(252,165,165,0.5)',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    خروج بدون جایزه
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* فوتر تبلیغ */}
          <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748b' }}>
            شبیه‌ساز شبکه تبلیغاتی موبایل — در نسخه APK به تپسل / AdMob متصل می‌شود
          </div>
        </div>
      )}
    </>
  );
}