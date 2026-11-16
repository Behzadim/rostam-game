import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
export default function EquipmentModal() {
    const coins = useGameStore((state) => state.coins ?? 0);
    const stats = useGameStore((state) => state.stats);
    const upgradeEquipment = useGameStore((state) => state.upgradeEquipment);
    const setActiveModal = useGameStore((state) => state.setActiveModal);

    const [feedback, setFeedback] = useState(null);

    const maceLevel = stats?.maceLevel || 1;
    const armorLevel = stats?.armorLevel || 1;
    const maceCost = maceLevel * 300;
    const armorCost = armorLevel * 350;

    const handleUpgrade = (type) => {
        const result = upgradeEquipment(type);
        setFeedback(result);
        setTimeout(() => setFeedback(null), 2500);
    };

    return (
        <div className="rpg-modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="rpg-modal-box" onClick={(e) => e.stopPropagation()}>

                <div className="rpg-modal-header">
                    <h4 className="m-0 fw-bold text-warning">رخت‌خانه و سلیح پهلوانی</h4>
                    <button className="rpg-close-btn" onClick={() => setActiveModal(null)}>✕</button>
                </div>

                {feedback && (
                    <div className={`rpg-alert ${feedback.success ? 'alert-success-rpg' : 'alert-error-rpg'}`}>
                        {feedback.message}
                    </div>
                )}

                <div className="rpg-modal-body">

                    {/* کارت ارتقای گرز گاوسر */}
                    <div className="shop-item-card">
                        <div className="shop-item-icon">🔨{/* اینجا باید یک  عکس گرز جذاب قراربگیرد */}</div>
                        <div className="shop-item-info">
                            <div className="d-flex align-items-center gap-2">
                                <span className="shop-item-title">گرز گاوسر</span>
                                <span className="shop-item-owned">سطح {maceLevel}</span>
                            </div>
                            <p className="shop-item-desc m-0">
                                قدرت ضربه فعلی: <strong className="text-warning">{stats?.attackPower}</strong> (+۱۸ در سطح بعد)
                            </p>
                        </div>
                        <button
                            className={`rpg-buy-btn ${coins < maceCost ? 'disabled' : ''}`}
                            onClick={() => handleUpgrade('mace')}
                        >
                            <span>{maceCost}</span>
                            <small>ارتقا</small>
                        </button>
                    </div>

                    {/* کارت ارتقای زره ببر بیان */}
                    <div className="shop-item-card">
                        <div className="shop-item-icon">🛡️</div>
                        <div className="shop-item-info">
                            <div className="d-flex align-items-center gap-2">
                                <span className="shop-item-title"> لباس رزم  </span>
                                <span className="shop-item-owned">سطح {armorLevel}</span>
                            </div>
                            <p className="shop-item-desc m-0">
                                حداکثر جان: <strong className="text-warning">{stats?.maxHealth}</strong> (+۴۰ در سطح بعد)
                            </p>
                        </div>
                        <button
                            className={`rpg-buy-btn ${coins < armorCost ? 'disabled' : ''}`}
                            onClick={() => handleUpgrade('armor')}
                        >
                            <span>{armorCost}</span>
                            <small>ارتقا</small>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}