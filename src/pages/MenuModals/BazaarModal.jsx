// بازارچه زابلستان (متصل به حافظه بومی موبایل در gameStore)
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import '../../styles/BazaarModal.css';

// =========================================================================
// عکس آیتم‌ها (دقیقاً طبق مسیر فایل‌های خودتان)
// =========================================================================
import nooshdarooImg from '../../assets/images/bazaar-nooshdaroo.png';
import simorghImg from '../../assets/images/bazaar-simorgh.png';
import rageImg from '../../assets/images/bazaar-rage.png';
import shieldImg from '../../assets/images/bazaar-shield.png';
import zar from '../../assets/images/zar.png'
const EMPTY_OBJ = {};

const BAZAAR_ITEMS = [
    {
        id: 'nooshdaroo',
        name: 'نوشدارو (معجون حیات)',
        desc: 'بازیابی کامل نوار جان رستم در میانه نبردهای سخت با باس‌ها',
        basePrice: 500,
        priceStep: 500,
        icon: '🧪',
        image: nooshdarooImg,
        theme: 'is-potion',
    },
    {
        id: 'simorghFeather',
        name: 'پر سیمرغ (جان دوباره)',
        desc: 'در صورت شکست جلوی باس، رستم را با نصف جان و ۲ ثانیه ضدضربه به میدان برمی‌گرداند',
        basePrice: 800,
        priceStep: 400,
        icon: '🪶',
        image: simorghImg,
        theme: 'is-simorgh',
    },
    {
        id: 'rageElixir',
        name: 'اکسیر خشم پهلوانی',
        desc: 'قدرت ضربات گرز گاوسر را به مدت ۱۵ ثانیه در میدان نبرد دو برابر می‌کند',
        basePrice: 400,
        priceStep: 200,
        icon: '🔥',
        image: rageImg,
        theme: 'is-rage',
    },
    {
        id: 'ironShield',
        name: 'طلسم سپر پولادین',
        desc: 'یک سپر زرین دور رستم می‌سازد که ۳ ضربه بعدی باس را کاملاً خنثی می‌کند',
        basePrice: 350,
        priceStep: 200,
        icon: '🛡️',
        image: shieldImg,
        theme: 'is-shield',
    },
];

export default function BazaarModal({ onClose }) {
    const coins = useGameStore((state) => state.coins ?? 0);
    const rawInventory = useGameStore((state) => state.inventory);
    const rawPurchases = useGameStore((state) => state.bazaarPurchases);
    const buyShopItem = useGameStore((state) => state.buyShopItem);
    const setActiveModal = useGameStore((state) => state.setActiveModal);

    const inventory = rawInventory || EMPTY_OBJ;
    const purchases = rawPurchases || EMPTY_OBJ;

    const [alert, setAlert] = useState({ type: '', text: '' });
    const alertTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
        };
    }, []);

    const handleClose = () => {
        if (typeof onClose === 'function') {
            onClose();
        } else if (typeof setActiveModal === 'function') {
            setActiveModal(null);
        }
    };

    const showAlert = (type, text) => {
        setAlert({ type, text });
        if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
        alertTimerRef.current = setTimeout(() => {
            setAlert({ type: '', text: '' });
        }, 2600);
    };

    const handleBuy = (item) => {
        const buyCount = Math.max(0, Number(purchases[item.id]) || 0);
        const currentPrice = item.basePrice + buyCount * item.priceStep;

        if (coins < currentPrice) {
            showAlert('error', `سکه زر کافی برای خرید «${item.name}» نداری!`);
            return;
        }

        const result = buyShopItem(item.id, currentPrice);
        if (!result?.success) {
            showAlert('error', result?.message || `سکه زر کافی برای خرید «${item.name}» نداری!`);
            return;
        }

        const nextOwned = useGameStore.getState().inventory?.[item.id] ?? 0;
        showAlert('success', `۱ عدد «${item.name}» به کوله‌پشتی اضافه شد! (موجودی: ${nextOwned})`);
    };

    return (
        <div className="bazaar-overlay" onClick={handleClose}>
            <div className="bazaar-modal" onClick={(e) => e.stopPropagation()}>

                {/* هدر بازارچه */}
                <div className="bazaar-header">
                    <div className="bazaar-title-group">
                        <h5 className="bazaar-title">🏪 بازارچه زابلستان</h5>
                        <span className="bazaar-subtitle">توشه و اکسیرهای نبرد هفت‌خوان</span>
                    </div>

                    <div className="bazaar-header-left">
                        <div className="bazaar-coin-badge">
                            <span> <img style={{width : "30px"}} src={zar} alt="زر"  /></span>
                            <span>{coins.toLocaleString()}</span>
                        </div>
                        <button className="bazaar-close-btn" onClick={handleClose} aria-label="بستن">
                            ✕
                        </button>
                    </div>
                </div>

                {/* پیام وضعیت خرید */}
                {alert.text && (
                    <div className={`bazaar-alert ${alert.type === 'success' ? 'is-success' : 'is-error'}`}>
                        {alert.text}
                    </div>
                )}

                {/* گرید آیتم‌های بازارچه */}
                <div className="bazaar-grid">
                    {BAZAAR_ITEMS.map((item) => {
                        const buyCount = Math.max(0, Number(purchases[item.id]) || 0);
                        const price = item.basePrice + buyCount * item.priceStep;
                        const nextPrice = price + item.priceStep;
                        const canAfford = coins >= price;

                        return (
                            <div key={item.id} className={`bazaar-card ${item.theme}`}>
                                <div className="bazaar-card-top">
                                    <div className="bazaar-icon-box">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="bazaar-item-img" />
                                        ) : (
                                            <span className="bazaar-item-emoji">{item.icon}</span>
                                        )}
                                    </div>

                                    <div className="bazaar-card-info">
                                        <div className="bazaar-title-row">
                                            <h6 className="bazaar-card-title">{item.name}</h6>
                                            <span className="bazaar-badge">موجودی: {inventory[item.id] ?? 0}</span>
                                        </div>
                                        <p className="bazaar-card-desc">{item.desc}</p>
                                    </div>
                                </div>

                                <div className="bazaar-card-footer">
                                    <span className="bazaar-next-price">
                                        قیمت بعدی: <strong>{nextPrice.toLocaleString()}</strong>  سکه
                                    </span>

                                    <button
                                        className={`bazaar-buy-btn ${!canAfford ? 'is-locked' : ''}`}
                                        onClick={() => handleBuy(item)}
                                    >
                                        <span>خرید</span>
                                        <span className="bazaar-price-pill"><img style={{width : "30px"}} src={zar} alt="زر"  />{price.toLocaleString()}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}