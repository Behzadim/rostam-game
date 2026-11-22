// رخت‌خانه و سلیح پهلوانی (متصل به حافظه بومی موبایل در gameStore)
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import '../../styles/EquipmentModal.css';

// =========================================================================
// محل وارد کردن عکس‌ها (وقتی عکس‌ها را در پوشه assets/images گذاشتید از کامنت خارج کنید):
// =========================================================================
import maceImgFile from '../../assets/images/mace.png';
import armorImgFile from '../../assets/images/armor.png';
import zar from '../../assets/images/zar.png'
const MACE_IMAGE = maceImgFile;  // بعد از ایمپورت تغییر دهید به: maceImgFile
const ARMOR_IMAGE = armorImgFile; // بعد از ایمپورت تغییر دهید به: armorImgFile

const EMPTY_STATS = {};

export default function EquipmentModal({ onClose }) {
  const coins = useGameStore((state) => state.coins ?? 0);
  const rawStats = useGameStore((state) => state.stats);
  const upgradeEquipment = useGameStore((state) => state.upgradeEquipment);
  const setActiveModal = useGameStore((state) => state.setActiveModal);

  const stats = rawStats || EMPTY_STATS;
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      setActiveModal(null);
    }
  };

  const maceLevel = Math.max(1, Number(stats.maceLevel) || 1);
  const armorLevel = Math.max(1, Number(stats.armorLevel) || 1);
  const attackPower = Number(stats.attackPower) || 35;
  const maxHealth = Number(stats.maxHealth) || 150;

  const maceCost = maceLevel * 300;
  const armorCost = armorLevel * 350;

  const handleUpgrade = (type) => {
    const result = upgradeEquipment(type);
    setFeedback(result);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="equip-overlay" onClick={handleClose}>
      <div className="equip-modal" onClick={(e) => e.stopPropagation()}>

        {/* هدر پنجره + موجودی سکه */}
        <div className="equip-header">
          <h4 className="equip-title">⚔️ سلاح پهلوانی</h4>
          <div className="equip-header-left">
            <div className="equip-coin-badge">
              <span><img style={{ width: "30px" }} src={zar} alt="زر" /></span>
              <span>{coins.toLocaleString()}</span>
            </div>
            <button
              type="button"
              className="equip-close-btn"
              onClick={handleClose}
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>

        {/* پیام نتیجه ارتقا یا کمبود سکه */}
        {feedback && (
          <div className={`equip-alert ${feedback.success ? 'is-success' : 'is-error'}`}>
            {feedback.message}
          </div>
        )}

        {/* کارت‌های ارتقای سلاح و زره */}
        <div className="equip-body">

          {/* کارت ارتقای گرز گاوسر */}
          <div className="equip-card">
            <div className="equip-item-media">
              {MACE_IMAGE ? (
                <img src={MACE_IMAGE} alt="گرز گاوسر" className="equip-item-img" />
              ) : (
                <span className="equip-item-emoji">🔨</span>
              )}
            </div>

            <div className="equip-card-info">
              <div className="equip-card-top">
                <span className="equip-card-title">گرز گاوسر</span>
                <span className="equip-lv-badge">سطح {maceLevel}</span>
              </div>
              <p className="equip-card-desc">
                قدرت ضربه فعلی: <strong>{attackPower}</strong>
                <span className="equip-next-bonus"> (+۱۸ در سطح بعد)</span>
              </p>
            </div>

            <button
              type="button"
              className={`equip-buy-btn ${coins < maceCost ? 'is-locked' : ''}`}
              onClick={() => handleUpgrade('mace')}
            >
              <span>{maceCost.toLocaleString()}</span>
              <small>ارتقا <img style={{width : "30px"}} src={zar} alt="زر"  /></small>
            </button>
          </div>

          {/* کارت ارتقای زره ببر بیان */}
          <div className="equip-card">
            <div className="equip-item-media">
              {ARMOR_IMAGE ? (
                <img src={ARMOR_IMAGE} alt="لباس رزم" className="equip-item-img" />
              ) : (
                <span className="equip-item-emoji">🛡️</span>
              )}
            </div>

            <div className="equip-card-info">
              <div className="equip-card-top">
                <span className="equip-card-title">لباس رزم</span>
                <span className="equip-lv-badge">سطح {armorLevel}</span>
              </div>
              <p className="equip-card-desc">
                حداکثر جان: <strong>{maxHealth}</strong>
                <span className="equip-next-bonus"> (+۴۰ در سطح بعد)</span>
              </p>
            </div>

            <button
              type="button"
              className={`equip-buy-btn ${coins < armorCost ? 'is-locked' : ''}`}
              onClick={() => handleUpgrade('armor')}
            >
              <span>{armorCost.toLocaleString()}</span>
              <small>ارتقا <img style={{width : "30px"}} src={zar} alt="زر"  /></small>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}