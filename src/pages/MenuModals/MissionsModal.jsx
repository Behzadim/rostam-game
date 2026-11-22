// ماموریت‌ها (۱۰۰ چالش ابیات شاهنامه فردوسی - مرحله‌ای و متصل به حافظه بومی موبایل)
import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { SHAHNAMEH_MISSIONS } from '../../game/data/shahnamehMissions';
import '../../styles/MissionsModal.css';

// =========================================================================
// عکس حکیم فردوسی
// =========================================================================
import ferdowsiFile from '../../assets/images/ferdowsi.png';
import zar from '../../assets/images/zar.png'

const FERDOWSI_IMAGE = ferdowsiFile;

const EMPTY_ARR = [];
const REWARD_COINS = 20;

// نرمال‌سازی هوشمند متن فارسی (یکسان‌سازی ی/ي، ک/ك، آ/ا، حذف فاصله‌ها و علائم نگارشی)
function normalizePersian(text) {
  return String(text || '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ةۀ]/g, 'ه')
    .replace(/[\u064B-\u065F\u0670\u200C\u200D]/g, '')
    .replace(/[.,،؛:!؟«»"'\-()[\]\s]/g, '')
    .trim();
}

export default function MissionsModal({ onClose }) {
  const coins = useGameStore((state) => state.coins ?? 0);
  const rawCompletedIds = useGameStore((state) => state.missions?.claimedIds);
  const claimMissionReward = useGameStore((state) => state.claimMissionReward);

  const completedIds = rawCompletedIds || EMPTY_ARR;
  const totalCount = SHAHNAMEH_MISSIONS.length;

  // محاسبه آخرین ماموریت بازشده (اولین ماموریت حل‌نشده)
  const firstPendingIndex = SHAHNAMEH_MISSIONS.findIndex(
    (m) => !completedIds.includes(m.id)
  );
  const maxUnlockedIndex =
    firstPendingIndex === -1 ? totalCount - 1 : firstPendingIndex;

  const isMissionUnlocked = (idx) =>
    idx >= 0 &&
    idx < totalCount &&
    (idx <= maxUnlockedIndex ||
      completedIds.includes(SHAHNAMEH_MISSIONS[idx].id));

  const [activeIndex, setActiveIndex] = useState(() =>
    firstPendingIndex === -1 ? 0 : firstPendingIndex
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const currentMission =
    SHAHNAMEH_MISSIONS[activeIndex] || SHAHNAMEH_MISSIONS[0];
  const isCurrentDone = completedIds.includes(currentMission.id);
  const completedCount = SHAHNAMEH_MISSIONS.filter((m) =>
    completedIds.includes(m.id)
  ).length;
  const canGoNext =
    activeIndex < totalCount - 1 && isMissionUnlocked(activeIndex + 1);

  const handleSelectMission = (index) => {
    if (!isMissionUnlocked(index)) return;
    setActiveIndex(index);
    setAnswer('');
    setFeedback({ type: '', text: '' });
  };

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    if (isCurrentDone || !isMissionUnlocked(activeIndex)) return;

    const userClean = normalizePersian(answer);
    if (!userClean) {
      setFeedback({ type: 'error', text: 'ابتدا مصراع دوم را بنویس!' });
      return;
    }

    const correctClean = normalizePersian(currentMission.misra2);

    if (userClean === correctClean) {
      const result = claimMissionReward(currentMission.id, {
        coins: REWARD_COINS,
      });
      if (!result?.success) {
        setFeedback({
          type: 'error',
          text: result?.message || 'این ماموریت قبلاً ثبت شده است!',
        });
        return;
      }

      setAnswer('');
      const hasNext = activeIndex < totalCount - 1;
      setFeedback({
        type: 'success',
        text: hasNext
          ? `آفرین پهلوان! +${REWARD_COINS} سکه زر دریافت کردی و قفل ماموریت بعدی باز شد.`
          : `آفرین پهلوان! +${REWARD_COINS} سکه زر دریافت کردی و تمام ۱۰۰ ماموریت شاهنامه را کامل کردی!`,
      });
    } else {
      setFeedback({
        type: 'error',
        text: 'پاسخ نادرست بود! دوباره تلاش کن.',
      });
    }
  };

  const handleNextMission = () => {
    if (canGoNext) {
      handleSelectMission(activeIndex + 1);
    }
  };

  const handlePrevMission = () => {
    if (activeIndex > 0) {
      handleSelectMission(activeIndex - 1);
    }
  };

  return (
    <div className="missions-overlay" onClick={onClose}>
      <div className="missions-modal" onClick={(e) => e.stopPropagation()}>

        {/* هدر پنجره */}
        <div className="missions-header">
          <div className="missions-header-right">
            <h5 className="missions-title">📜 ماموریت‌های شاهنامه</h5>
            <span className="missions-progress-pill">
              تکمیل‌شده: {completedCount} / {totalCount}
            </span>
          </div>
          <div className="missions-header-left">
            <div className="missions-coin-badge">
              <span><img style={{width : "30px"}} src={zar} alt="زر" /></span>
              <span>{coins.toLocaleString()}</span>
            </div>
            <button
              className="missions-close-btn"
              onClick={onClose}
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>

        {/* بدنه دو ستونه: راست = عملیات ماموریت | چپ = عکس فردوسی */}
        <div className="missions-content">

          {/* ستون سمت راست: شرایط، بیت جاری، ورودی پاسخ و لیست ۱۰۰ ماموریت */}
          <div className="missions-work-panel">

            {/* باکس توضیح شرایط ماموریت */}
            <div className="missions-rules-box">
              <div className="rules-title">📌 شرایط ماموریت:</div>
              <p className="rules-text">
                ماموریت‌ها به ترتیب باز می‌شوند؛ مصراع دوم هر بیت را کامل کن تا{' '}
                <strong className="text-win">+{REWARD_COINS} سکه زر</strong>{' '}
                بگیری و قفل ماموریت بعدی باز شود (در پاسخ اشتباه سکه‌ای کسر نمی‌شود).
              </p>
            </div>

            {/* کارت ماموریت فعال */}
            <div
              className={`missions-active-card ${
                isCurrentDone ? 'is-completed' : ''
              }`}
            >
              <div className="active-card-top">
                <span className="mission-num-badge">
                  ماموریت {currentMission.id} از {totalCount}
                </span>
                <div className="mission-nav-btns">
                  <button
                    type="button"
                    className="mini-nav-btn"
                    onClick={handlePrevMission}
                    disabled={activeIndex === 0}
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    className="mini-nav-btn"
                    onClick={handleNextMission}
                    disabled={!canGoNext}
                  >
                    بعدی
                  </button>
                </div>
              </div>

              {/* نمایش مصراع اول */}
              <div className="verse-box">
                <span className="verse-label">مصراع اول:</span>
                <div className="verse-first-line">« {currentMission.misra1} »</div>
              </div>

              {/* فرم وارد کردن مصراع دوم یا نمایش پاسخ تکمیل‌شده */}
              {isCurrentDone ? (
                <div className="verse-completed-box">
                  <span className="verse-label">مصراع دوم (تکمیل‌شده ✓):</span>
                  <div className="verse-second-done">
                    « {currentMission.misra2} »
                  </div>
                </div>
              ) : (
                <form
                  className="mission-answer-form"
                  onSubmit={handleCheckAnswer}
                >
                  <input
                    type="text"
                    className="mission-answer-input"
                    placeholder="مصراع دوم بیت را اینجا بنویس..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    autoComplete="off"
                  />
                  <button type="submit" className="mission-submit-btn">
                    ثبت پاسخ
                  </button>
                </form>
              )}

              {/* پیام نتیجه بررسی پاسخ */}
              {feedback.text && (
                <div
                  className={`missions-alert ${
                    feedback.type === 'success' ? 'is-success' : 'is-error'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </div>

            {/* لیست شماره‌های ۱ تا ۱۰۰ با حالت قفل */}
            <div className="missions-list-section">
              <div className="missions-list-label">
                انتخاب ماموریت (۱ تا ۱۰۰):
              </div>
              <div className="missions-number-grid">
                {SHAHNAMEH_MISSIONS.map((m, idx) => {
                  const done = completedIds.includes(m.id);
                  const unlocked = isMissionUnlocked(idx);
                  const active = idx === activeIndex;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!unlocked}
                      title={
                        unlocked
                          ? `ماموریت ${m.id}`
                          : 'ابتدا ماموریت قبلی را کامل کن'
                      }
                      onClick={() => handleSelectMission(idx)}
                      className={[
                        'mission-num-chip',
                        done ? 'is-done' : '',
                        !unlocked ? 'is-locked' : '',
                        active ? 'is-active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {done ? `✓ ${m.id}` : unlocked ? m.id : `🔒 ${m.id}`}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ستون سمت چپ: جای عکس حکیم ابوالقاسم فردوسی */}
          <div className="missions-ferdowsi-panel">
            <div className="ferdowsi-portrait-frame">
              {FERDOWSI_IMAGE ? (
                <img
                  src={FERDOWSI_IMAGE}
                  alt="حکیم ابوالقاسم فردوسی"
                  className="ferdowsi-portrait-img"
                />
              ) : (
                <div className="ferdowsi-placeholder">
                  <span className="ferdowsi-placeholder-icon">🪶</span>
                  <span className="ferdowsi-placeholder-text">
                    محل تصویر حکیم فردوسی
                  </span>
                </div>
              )}
            </div>

            <div className="ferdowsi-caption">
              <div className="ferdowsi-name">حکیم ابوالقاسم فردوسی</div>
              <div className="ferdowsi-quote">«توانا بود هر که دانا بود»</div>
            </div>

            <div className="ferdowsi-progress-box">
              <div className="ferdowsi-progress-meta">
                <span>پیشرفت کل</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="ferdowsi-progress-track">
                <div
                  className="ferdowsi-progress-fill"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}