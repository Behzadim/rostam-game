import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
const SHOP_ITEMS = [
    {
        id: 'nooshdaroo',
        name: 'نوشدارو (معجون حیات)',
        desc: 'بازیابی کامل جان رستم در میانه نبردهای سخت',
        price: 250,
        icon: '🧪',
    },
    {
        id: 'goldenKey',
        name: 'کلید زرین گنجینه',
        desc: 'برای گشودن صندوقچه‌های اسرارآمیز در پایان هر خوان',
        price: 450,
        icon: '🗝️',
    },
];

export default function ShopModal() {
    const coins = useGameStore((state) => state.coins);
    const inventory = useGameStore((state) => state.inventory);
    const buyShopItem = useGameStore((state) => state.buyShopItem);
    const setActiveModal = useGameStore((state) => state.setActiveModal);

    const [feedback, setFeedback] = useState(null);

    const handleBuy = (item) => {
        const result = buyShopItem(item.id, item.price);
        setFeedback(result);
        // پاک کردن پیام بعد از ۲.۵ ثانیه
        setTimeout(() => setFeedback(null), 2500);
    };

    return (
        <div className="rpg-modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="rpg-modal-box" onClick={(e) => e.stopPropagation()}>

                {/* هدر پنجره فروشگاه */}
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

                {/* لیست آیتم‌های قابل خرید */}
                <div className="rpg-modal-body">
                    {SHOP_ITEMS.map((item) => {
                        const ownedCount = inventory[item.id] || 0;
                        const canAfford = coins >= item.price;

                        return (
                            <div key={item.id} className="shop-item-card">
                                <div className="shop-item-icon">{item.icon}</div>

                                <div className="shop-item-info">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="shop-item-title">{item.name}</span>
                                        <span className="shop-item-owned">موجودی: {ownedCount}</span>
                                    </div>
                                    <p className="shop-item-desc m-0">{item.desc}</p>
                                </div>

                                <button
                                    className={`rpg-buy-btn ${!canAfford ? 'disabled' : ''}`}
                                    onClick={() => handleBuy(item)}
                                >
                                    <span>{item.price}</span>
                                    <small>سکه</small>
                                </button>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}