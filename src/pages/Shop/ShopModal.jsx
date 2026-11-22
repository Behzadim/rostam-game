import { useRef, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import '../../styles//ShopModal.css'

const STORAGE_KEY = 'rostam_shop_prices_v1';

const HEALTH_BASE_PRICE = 200;
const HEALTH_STEP = 200;
const HEALTH_BONUS = 25;

const POTION_BASE_PRICE = 500;
const POTION_STEP = 500;

function loadPurchases() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { healthBuys: 0, potionBuys: 0 };
        const parsed = JSON.parse(raw);
        return {
            healthBuys: Math.max(0, Number(parsed.healthBuys) || 0),
            potionBuys: Math.max(0, Number(parsed.potionBuys) || 0),
        };
    } catch {
        return { healthBuys: 0, potionBuys: 0 };
    }
}

export default function ShopModal() {
    const coins = useGameStore((state) => state.coins ?? 0);
    const inventory = useGameStore((state) => state.inventory || {});
    const stats = useGameStore((state) => state.stats || {});
    const buyShopItem = useGameStore((state) => state.buyShopItem);
    const setActiveModal = useGameStore((state) => state.setActiveModal);

    const [purchases, setPurchases] = useState(() => loadPurchases());
    const [feedback, setFeedback] = useState(null);
    const timerRef = useRef(null);

    const healthPrice = HEALTH_BASE_PRICE + purchases.healthBuys * HEALTH_STEP;
    const potionPrice = POTION_BASE_PRICE + purchases.potionBuys * POTION_STEP;

    const currentMaxHealth = stats.maxHealth ?? 150;
    const potionCount = inventory.nooshdaroo ?? 0;

    const showFeedback = (result) => {
        setFeedback(result);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setFeedback(null), 2500);
    };

    const savePurchases = (updated) => {
        setPurchases(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    // بخش ۱: افزایش جان رستم (شروع ۲۰۰، هر بار +۲۰۰ سکه)
    const handleBuyHealth = () => {
        if (coins < healthPrice) {
            showFeedback({ success: false, message: 'سکه زر کافی برای افزایش جان رستم نداری!' });
            return;
        }

        const nextMaxHealth = currentMaxHealth + HEALTH_BONUS;

        useGameStore.setState((s) => ({
            coins: Math.max(0, (s.coins ?? 0) - healthPrice),
            stats: {
                ...(s.stats || {}),
                maxHealth: (s.stats?.maxHealth ?? 150) + HEALTH_BONUS,
            },
        }));

        savePurchases({ ...purchases, healthBuys: purchases.healthBuys + 1 });
        showFeedback({
            success: true,
            message: `جان رستم +${HEALTH_BONUS} واحد افزایش یافت! (حداکثر جان: ${nextMaxHealth})`,
        });
    };

    // بخش ۲: خرید نوشدارو (شروع ۵۰۰، هر بار +۵۰۰ سکه)
    const handleBuyPotion = () => {
        if (coins < potionPrice) {
            showFeedback({ success: false, message: 'سکه زر کافی برای خرید نوشدارو نداری!' });
            return;
        }

        if (typeof buyShopItem === 'function') {
            const result = buyShopItem('nooshdaroo', potionPrice);
            if (result?.success) {
                savePurchases({ ...purchases, potionBuys: purchases.potionBuys + 1 });
            }
            showFeedback(result || { success: true, message: '۱ عدد نوشدارو به کوله‌پشتی اضافه شد!' });
            return;
        }

        useGameStore.setState((s) => ({
            coins: Math.max(0, (s.coins ?? 0) - potionPrice),
            inventory: {
                ...(s.inventory || {}),
                nooshdaroo: (s.inventory?.nooshdaroo ?? 0) + 1,
            },
        }));

        savePurchases({ ...purchases, potionBuys: purchases.potionBuys + 1 });
        showFeedback({ success: true, message: '۱ عدد نوشدارو به کوله‌پشتی اضافه شد!' });
    };

    const canAffordHealth = coins >= healthPrice;
    const canAffordPotion = coins >= potionPrice;

    return (
        <div className="rpg-modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="rpg-modal-box" onClick={(e) => e.stopPropagation()}>

                {/* هدر پنجره بازارچه */}
                <div className="rpg-modal-header">
                    <h4 className="m-0 fw-bold text-warning">بازارچه اساطیر</h4>
                    <button className="rpg-close-btn" onClick={() => setActiveModal(null)}>✕</button>
                </div>

                {/* نمایش پیام خرید موفق یا عدم موجودی سکه */}
                {feedback && (
                    <div className={`rpg-alert ${feedback.success ? 'alert-success-rpg' : 'alert-error-rpg'}`}>
                        {feedback.message}
                    </div>
                )}

                {/* دو بخش بازارچه */}
                <div className="rpg-modal-body">

                    {/* بخش اول: افزایش جان رستم */}
                    <div className="shop-item-card">
                        <div className="shop-item-icon">❤️</div>

                        <div className="shop-item-info">
                            <div className="d-flex align-items-center gap-2">
                                <span className="shop-item-title">افزایش جان رستم</span>
                                <span className="shop-item-owned">جان فعلی: {currentMaxHealth}</span>
                            </div>
                            <p className="shop-item-desc m-0">
                                +{HEALTH_BONUS} واحد به حداکثر جان اضافه می‌شود (قیمت بعدی: {(healthPrice + HEALTH_STEP).toLocaleString()} سکه)
                            </p>
                        </div>

                        <button
                            className={`rpg-buy-btn ${!canAffordHealth ? 'disabled' : ''}`}
                            onClick={handleBuyHealth}
                        >
                            <span>{healthPrice.toLocaleString()}</span>
                            <small>سکه</small>
                        </button>
                    </div>

                    {/* بخش دوم: نوشدارو */}
                    <div className="shop-item-card">
                        <div className="shop-item-icon">🧪</div>

                        <div className="shop-item-info">
                            <div className="d-flex align-items-center gap-2">
                                <span className="shop-item-title">نوشدارو (معجون حیات)</span>
                                <span className="shop-item-owned">موجودی: {potionCount}</span>
                            </div>
                            <p className="shop-item-desc m-0">
                                بازیابی کامل جان رستم در میانه نبرد (قیمت بعدی: {(potionPrice + POTION_STEP).toLocaleString()} سکه)
                            </p>
                        </div>

                        <button
                            className={`rpg-buy-btn ${!canAffordPotion ? 'disabled' : ''}`}
                            onClick={handleBuyPotion}
                        >
                            <span>{potionPrice.toLocaleString()}</span>
                            <small>سکه</small>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}