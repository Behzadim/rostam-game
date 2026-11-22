// قدرت رستم (سمت راست: تمرین‌های پهلوانی | سمت چپ: تصویر رستم - متصل به حافظه بومی موبایل)
import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import '../../styles/RostamPowerModal.css';

// =========================================================================
// عکس رستم و آیکون‌های تمرین (دقیقاً طبق مسیر فایل‌های خودتان)
// =========================================================================
import rostamPowerFile from '../../assets/images/rostam-power.png';
import TheStrengthOfRostam from '../../assets/images/The-Strength-of-Rostam.png';
import JohnRostam from '../../assets/images/John-Rostam.png';
import zar from '../../assets/images/zar.png'
const ROSTAM_IMAGE = rostamPowerFile;
const POWER = TheStrengthOfRostam;
const JOHNROSTAM = JohnRostam;

const EMPTY_STATS = {};

export default function RostamPowerModal({ onClose }) {
  const coins = useGameStore((state) => state.coins ?? 0);
  const rawStats = useGameStore((state) => state.stats);

  const stats = rawStats || EMPTY_STATS;
  const [alert, setAlert] = useState({ type: '', text: '' });

  const strengthLv = Math.max(1, Number(stats.strengthLevel) || 1);
  const vitalityLv = Math.max(1, Number(stats.vitalityLevel) || 1);
  const strengthCost = strengthLv * 300;
  const vitalityCost = vitalityLv * 250;

  const handleTrain = (statType, cost, title) => {
    if (coins < cost) {
      setAlert({ type: 'error', text: 'سکه کافی برای تمرین پهلوانی نداری!' });
      return;
    }

    const nextLv = (statType === 'strength' ? strengthLv : vitalityLv) + 1;

    useGameStore.setState((s) => {
      const currentStats = s.stats || {};
      const prevMissions = s.missions || { progress: {}, claimedIds: [] };
      const prevProgress = prevMissions.progress || {};

      const nextStats =
        statType === 'strength'
          ? {
            ...currentStats,
            strengthLevel: nextLv,
            attackPower: (currentStats.attackPower ?? 35) + 10,
          }
          : {
            ...currentStats,
            vitalityLevel: nextLv,
            maxHealth: (currentStats.maxHealth ?? 150) + 25,
          };

      return {
        coins: Math.max(0, (s.coins ?? 0) - cost),
        stats: nextStats,
        missions: {
          ...prevMissions,
          progress: {
            ...prevProgress,
            upgradesDone: (prevProgress.upgradesDone ?? 0) + 1,
          },
        },
      };
    });

    setAlert({ type: 'success', text: `${title} به سطح ${nextLv} رسید!` });
  };

  return (
    <div className="power-overlay" onClick={onClose}>
      <div className="power-modal" onClick={(e) => e.stopPropagation()}>

        {/* هدر پنجره + موجودی سکه */}
        <div className="power-header">
          <h5 className="power-title">💪 قدرت رستم</h5>
          <div className="power-header-left">
            <div className="power-coin-badge">
              <span><img style={{ width: "30px" }} src={zar} alt="زر" /></span>
              <span>{coins.toLocaleString()}</span>
            </div>
            <button className="power-close-btn" onClick={onClose} aria-label="بستن">
              ✕
            </button>
          </div>
        </div>

        {/* پیام موفقیت یا کمبود سکه */}
        {alert.text && (
          <div className={`power-alert ${alert.type === 'success' ? 'is-success' : 'is-error'}`}>
            {alert.text}
          </div>
        )}

        {/* بدنه دو ستونه: راست = ارتقاها | چپ = عکس رستم */}
        <div className="power-content">

          {/* ستون سمت راست: کارت‌های تمرین پهلوانی */}
          <div className="power-upgrades-panel">
            <div className="power-card">
              <div className="power-card-icon">
                <img style={{ width: '100%' }} src={POWER} alt="قدرت رستم" />
              </div>
              <div className="power-card-info">
                <div className="power-card-top">
                  <span className="power-card-title">زور بازو (قدرت ضربه)</span>
                  <span className="power-lv-badge">سطح {strengthLv}</span>
                </div>
                <div className="power-card-desc">افزایش آسیب ضربات گرز گاوسر به باس‌ها</div>
              </div>
              <button
                className={`power-buy-btn ${coins < strengthCost ? 'is-locked' : ''}`}
                onClick={() => handleTrain('strength', strengthCost, 'زور بازو')}
              >
                <span>{strengthCost.toLocaleString()}</span>
                <small> <img style={{ width: "30px" }} src={zar} alt="زر" />سکه</small>
              </button>
            </div>

            <div className="power-card">
              <div className="power-card-icon">
                <img style={{ width: '100%' }} src={JOHNROSTAM} alt="جان رستم" />
              </div>
              <div className="power-card-info">
                <div className="power-card-top">
                  <span className="power-card-title">جان پهلوانی</span>
                  <span className="power-lv-badge">سطح {vitalityLv}</span>
                </div>
                <div className="power-card-desc">افزایش حداکثر نوار سلامت رستم در میدان نبرد</div>
              </div>
              <button
                className={`power-buy-btn ${coins < vitalityCost ? 'is-locked' : ''}`}
                onClick={() => handleTrain('vitality', vitalityCost, 'جان پهلوانی')}
              >
                <span>{vitalityCost.toLocaleString()}</span>
                <small><img style={{ width: "30px" }} src={zar} alt="زر" />سکه</small>
              </button>
            </div>
          </div>

          {/* ستون سمت چپ: جای عکس رستم */}
          <div className="power-preview-panel">
            <div className="power-preview-stage">
              {ROSTAM_IMAGE ? (
                <img
                  src={ROSTAM_IMAGE}
                  alt="رستم دستان"
                  className="power-preview-img"
                />
              ) : (
                <div className="power-preview-placeholder">
                  <span className="power-placeholder-icon">🦁</span>
                  <span className="power-placeholder-text">محل تصویر رستم</span>
                </div>
              )}
            </div>

            <div className="power-preview-caption">
              <div className="power-caption-name">رستم دستان</div>
              <div className="power-caption-stats">
                <span>🔥 زور بازو: Lv.{strengthLv}</span>
                <span>❤️ جان: Lv.{vitalityLv}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}