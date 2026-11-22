// اصطبل رخش (سمت راست: ارتقاها | سمت چپ: تصویر رخش - متصل به حافظه بومی موبایل)
import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import '../../styles/RakhshModal.css';

// =========================================================================
// عکس رخش و آیکون‌های ارتقا (دقیقاً طبق فایل‌های خودتان)
// =========================================================================
import rakhshFile from '../../assets/images/rakhsh.png';
import MajesticSteedSpeedEmblem from '../../assets/images/Majestic-Steed-Speed-Emblem.png';
import GoldenHorseshoesofValor from '../../assets/images/Golden-Horseshoes-of-Valor.png';
import zar from '../../assets/images/zar.png'

const RAKHSH_IMAGE = rakhshFile;
const SpeedofRakhsh = MajesticSteedSpeedEmblem;
const Horseshoe = GoldenHorseshoesofValor;

const EMPTY_RAKHSH = { speedLevel: 1, staminaLevel: 1 };

export default function RakhshModal({ onClose }) {
  const coins = useGameStore((state) => state.coins ?? 0);
  const rawRakhsh = useGameStore((state) => state.rakhsh);
  const upgradeRakhsh = useGameStore((state) => state.upgradeRakhsh);

  const rakhsh = rawRakhsh || EMPTY_RAKHSH;
  const [alert, setAlert] = useState({ type: '', text: '' });

  const speedLv = Math.max(1, Number(rakhsh.speedLevel) || 1);
  const staminaLv = Math.max(1, Number(rakhsh.staminaLevel) || 1);
  const speedCost = speedLv * 250;
  const staminaCost = staminaLv * 300;

  const handleUpgrade = (statKey, cost, label) => {
    if (coins < cost) {
      setAlert({ type: 'error', text: 'سکه زر کافی نیست!' });
      return;
    }

    const result = upgradeRakhsh(statKey, cost);
    if (!result?.success) {
      setAlert({ type: 'error', text: result?.message || 'سکه زر کافی نیست!' });
      return;
    }

    const nextLv = useGameStore.getState().rakhsh?.[statKey] ?? 1;
    setAlert({ type: 'success', text: `${label} رخش به سطح ${nextLv} ارتقا یافت!` });
  };

  return (
    <div className="rakhsh-overlay" onClick={onClose}>
      <div className="rakhsh-modal" onClick={(e) => e.stopPropagation()}>

        {/* هدر پنجره + موجودی سکه */}
        <div className="rakhsh-header">
          <h5 className="rakhsh-title">🐎 اصطبل رخش</h5>
          <div className="rakhsh-header-left">
            <div className="rakhsh-coin-badge">
              <span><img style={{width : "30px"}} src={zar} alt="زر"  /></span>
              <span>{coins.toLocaleString()}</span>
            </div>
            <button className="rakhsh-close-btn" onClick={onClose} aria-label="بستن">
              ✕
            </button>
          </div>
        </div>

        {/* پیام موفقیت یا کمبود سکه */}
        {alert.text && (
          <div className={`rakhsh-alert ${alert.type === 'success' ? 'is-success' : 'is-error'}`}>
            {alert.text}
          </div>
        )}

        {/* بدنه دو ستونه: راست = ارتقاها | چپ = عکس رخش */}
        <div className="rakhsh-content">

          {/* ستون سمت راست: کارت‌های ارتقای رخش */}
          <div className="rakhsh-upgrades-panel">
            <div className="rakhsh-card">
              <div className="rakhsh-card-icon">
                <img style={{ width: '100%' }} src={SpeedofRakhsh} alt="سرعت تاخت رخش" />
              </div>
              <div className="rakhsh-card-info">
                <div className="rakhsh-card-top">
                  <span className="rakhsh-card-title">سرعت تاخت رخش</span>
                  <span className="rakhsh-lv-badge">سطح {speedLv}</span>
                </div>
                <div className="rakhsh-card-desc">افزایش سرعت حرکت و جاخالی در خوان‌ها</div>
              </div>
              <button
                className={`rakhsh-buy-btn ${coins < speedCost ? 'is-locked' : ''}`}
                onClick={() => handleUpgrade('speedLevel', speedCost, 'سرعت تاخت')}
              >
                <span>{speedCost.toLocaleString()}</span>
                <small>سکه <img style={{width : "20px"}} src={zar} alt="زر"  /></small>
              </button>
            </div>

            <div className="rakhsh-card">
              <div className="rakhsh-card-icon">
                <img style={{ width: '100%' }} src={Horseshoe} alt="استقامت و نعل زرین" />
              </div>
              <div className="rakhsh-card-info">
                <div className="rakhsh-card-top">
                  <span className="rakhsh-card-title">استقامت و نعل زرین</span>
                  <span className="rakhsh-lv-badge">سطح {staminaLv}</span>
                </div>
                <div className="rakhsh-card-desc">کاهش آسیب حملات ناگهانی در مسیر</div>
              </div>
              <button
                className={`rakhsh-buy-btn ${coins < staminaCost ? 'is-locked' : ''}`}
                onClick={() => handleUpgrade('staminaLevel', staminaCost, 'استقامت')}
              >
                <span>{staminaCost.toLocaleString()}</span>
                <small>سکه <img style={{width : "20px"}} src={zar} alt="زر"  /></small>
              </button>
            </div>
          </div>

          {/* ستون سمت چپ: جای عکس رخش */}
          <div className="rakhsh-preview-panel">
            <div className="rakhsh-preview-stage">
              {RAKHSH_IMAGE ? (
                <img
                  src={RAKHSH_IMAGE}
                  alt="رخش رستم"
                  className="rakhsh-preview-img"
                />
              ) : (
                <div className="rakhsh-preview-placeholder">
                  <span className="rakhsh-placeholder-icon">🐎</span>
                  <span className="rakhsh-placeholder-text">محل تصویر رخش</span>
                </div>
              )}
            </div>

            <div className="rakhsh-preview-caption">
              <div className="rakhsh-caption-name">رخشِ پیلتن</div>
              <div className="rakhsh-caption-stats">
                <span>⚡ سرعت: Lv.{speedLv}</span>
                <span>🛡️ استقامت: Lv.{staminaLv}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}