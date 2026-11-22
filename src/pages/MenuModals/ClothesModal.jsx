// لباس‌ها و اسکین‌های رستم (متصل به حافظه بومی موبایل در gameStore)
import { useState } from 'react';
import { useGameStore } from '../../game/gameStore/gameStore';
import { ZarIcon, GoharIcon } from '../../components/CurrencyIcon';
import '../../styles/ClothesModal.css';

// =========================================================================
// محل وارد کردن عکس اسکین‌ها:
// =========================================================================
import skinClassicImg from '../../assets/images/skins/skin-1.png';
import skinBabrImg from '../../assets/images/skins/skin-2.png';
import skinRoyalImg from '../../assets/images/skins/skin-3.png';
import skinMazandaranImg from '../../assets/images/skins/skin-4.png';
import skinTahamtanImg from '../../assets/images/skins/skin-5.png';

const EMPTY_CLOTHES = { equippedId: 'classic', ownedIds: ['classic'] };
const EMPTY_ARR = [];

const SKINS = [
  {
    id: 'classic',
    title: 'شنل سرخ و زره برنزی',
    desc: 'لباس اصلی پهلوان سیستان',
    price: 0,
    currency: 'coins',
    icon: '🧣',
    image: skinClassicImg,
  },
  {
    id: 'babr',
    title: 'ببر بیان (ضد آتش)',
    desc: 'پوشش افسانه‌ای رستم در برابر اژدها',
    price: 3500,
    currency: 'coins',
    icon: '🐅',
    image: skinBabrImg,
  },
  {
    id: 'royal',
    title: 'زره زرین شاهنامه',
    desc: 'درخشش طلایی با شکوه درباری',
    price: 5500,
    currency: 'coins',
    icon: '👑',
    image: skinRoyalImg,
  },
  {
    id: 'mazandaran',
    title: 'خز کوهستان مازندران',
    desc: 'پوشش گرم و سنگین برای نبرد با دیو سفید',
    price: 1000,
    currency: 'gems',
    icon: '🐺',
    image: skinMazandaranImg,
  },
  {
    id: 'tahamtan',
    title: 'زره پولادین تهمتن',
    desc: 'ساخته‌شده از فولاد سیاه و زر ناب',
    price: 1300,
    currency: 'gems',
    icon: '⚔️',
    image: skinTahamtanImg,
  },
];

export default function ClothesModal({ onClose }) {
  const coins = useGameStore((state) => state.coins ?? 0);
  const gems = useGameStore((state) => state.gems ?? 0);
  const rawClothes = useGameStore((state) => state.clothes);
  const buyCloth = useGameStore((state) => state.buyCloth);
  const equipCloth = useGameStore((state) => state.equipCloth);

  const clothes = rawClothes || EMPTY_CLOTHES;
  const ownedIds = clothes.ownedIds || EMPTY_ARR;
  const equipped =
    !clothes.equippedId || clothes.equippedId === 'default'
      ? 'classic'
      : clothes.equippedId;

  const [selectedId, setSelectedId] = useState(equipped);
  const [alert, setAlert] = useState({ type: '', text: '' });

  const isSkinOwned = (id) => id === 'classic' || ownedIds.includes(id);
  const canAffordSkin = (skin) =>
    skin.currency === 'gems' ? gems >= skin.price : coins >= skin.price;

  const selectedSkin = SKINS.find((s) => s.id === selectedId) || SKINS[0];
  const isSelectedOwned = isSkinOwned(selectedSkin.id);
  const isSelectedEquipped = equipped === selectedSkin.id;
  const isSelectedGems = selectedSkin.currency === 'gems';

  const handleSelectSkin = (skin) => {
    setSelectedId(skin.id);
    setAlert({ type: '', text: '' });
  };

  const handleBuyOrEquip = (skin) => {
    if (isSkinOwned(skin.id)) {
      if (skin.id === 'classic' && !ownedIds.includes('classic')) {
        useGameStore.setState((s) => ({
          clothes: {
            equippedId: 'classic',
            ownedIds: [...new Set(['classic', ...(s.clothes?.ownedIds || [])])],
          },
        }));
      } else {
        equipCloth(skin.id);
      }
      setAlert({ type: 'success', text: `لباس «${skin.title}» تن رستم شد.` });
      return;
    }

    const isGemSkin = skin.currency === 'gems';
    const insufficientMsg = isGemSkin
      ? 'گوهر کافی برای خرید این لباس نداری!'
      : 'سکه زر کافی برای خرید این لباس نداری!';

    if (!canAffordSkin(skin)) {
      setAlert({ type: 'error', text: insufficientMsg });
      return;
    }

    const result = buyCloth(skin.id, skin.price, skin.currency);
    if (!result?.success) {
      setAlert({ type: 'error', text: result?.message || insufficientMsg });
      return;
    }

    setAlert({ type: 'success', text: `لباس «${skin.title}» خریداری و تن رستم شد!` });
  };

  return (
    <div className="clothes-overlay" onClick={onClose}>
      <div className="clothes-modal" onClick={(e) => e.stopPropagation()}>

        {/* هدر پنجره + نمایش موجودی زر و گوهر */}
        <div className="clothes-header">
          <h5 className="clothes-title">🛡️ لباس‌ها و پوشاک رستم</h5>
          <div className="clothes-header-left">
            <div className="clothes-coin-badge" title="زر">
              <ZarIcon size={24} />
              <span>{coins.toLocaleString()}</span>
            </div>
            <div className="clothes-coin-badge is-gem" title="گوهر">
              <GoharIcon size={24} />
              <span>{gems.toLocaleString()}</span>
            </div>
            <button className="clothes-close-btn" onClick={onClose} aria-label="بستن">
              ✕
            </button>
          </div>
        </div>

        {/* پیام موفقیت یا کمبود موجودی */}
        {alert.text && (
          <div className={`clothes-alert ${alert.type === 'success' ? 'is-success' : 'is-error'}`}>
            {alert.text}
          </div>
        )}

        {/* بدنه دو ستونه: سمت راست لیست ۵ اسکین | سمت چپ پیش‌نمایش عکس رستم */}
        <div className="clothes-content">

          {/* ستون سمت راست: لیست ۵ اسکین مختلف */}
          <div className="clothes-list-panel">
            {SKINS.map((skin) => {
              const isOwned = isSkinOwned(skin.id);
              const isEquipped = equipped === skin.id;
              const isSelected = selectedId === skin.id;
              const isGem = skin.currency === 'gems';

              return (
                <div
                  key={skin.id}
                  className={`clothes-skin-card ${isSelected ? 'is-selected' : ''} ${isEquipped ? 'is-equipped' : ''}`}
                  onClick={() => handleSelectSkin(skin)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="clothes-skin-thumb">
                    {skin.image ? (
                      <img src={skin.image} alt={skin.title} />
                    ) : (
                      <span>{skin.icon}</span>
                    )}
                  </div>

                  <div className="clothes-skin-info">
                    <div className="clothes-skin-name-row">
                      <span className="clothes-skin-name">{skin.title}</span>
                      {isEquipped && <span className="clothes-tag-equipped">تن رستم</span>}
                    </div>
                    <div className="clothes-skin-bonus">{skin.bonus}</div>
                  </div>

                  <div className="clothes-skin-status">
                    {isEquipped ? (
                      <span className="status-pill active">فعال</span>
                    ) : isOwned ? (
                      <span className="status-pill owned">دارید</span>
                    ) : (
                      <span className={`status-pill price ${isGem ? 'is-gem' : ''}`}>
                        {skin.price.toLocaleString()}{' '}
                        {isGem ? <GoharIcon size={18} /> : <ZarIcon size={18} />}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ستون سمت چپ: جای عکس رستم با اسکین انتخاب‌شده + دکمه خرید/پوشیدن */}
          <div className="clothes-preview-panel">
            <div className="clothes-preview-stage">
              {selectedSkin.image ? (
                <img
                  src={selectedSkin.image}
                  alt={selectedSkin.title}
                  className="clothes-preview-img"
                />
              ) : (
                <div className="clothes-preview-placeholder">
                  <span className="placeholder-icon">{selectedSkin.icon}</span>
                  <span className="placeholder-text">محل تصویر {selectedSkin.title}</span>
                </div>
              )}
            </div>

            <div className="clothes-preview-details">
              <div className="preview-skin-title">{selectedSkin.title}</div>
              <div className="preview-skin-desc">{selectedSkin.desc}</div>
            </div>

            <button
              className={`clothes-action-btn ${isSelectedEquipped
                ? 'is-disabled'
                : !isSelectedOwned && !canAffordSkin(selectedSkin)
                  ? 'is-locked'
                  : ''
                }`}
              disabled={isSelectedEquipped}
              onClick={() => handleBuyOrEquip(selectedSkin)}
            >
              {isSelectedEquipped ? (
                '✓ این لباس تن رستم است'
              ) : isSelectedOwned ? (
                'پوشاندن به رستم'
              ) : (
                <>
                  خرید لباس ({selectedSkin.price.toLocaleString()}{' '}
                  {isSelectedGems ? (
                    <>گوهر <GoharIcon size={18} /></>
                  ) : (
                    <>زر <ZarIcon size={18} /></>
                  )}
                  )
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}