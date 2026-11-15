import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGameStore = create(
  persist(
    (set, get) => ({
      gameStage: "LOADING",
      setGameStage: (stage) => set({ gameStage: stage }),

      activeModal: null,
      setActiveModal: (modalName) => set({ activeModal: modalName }),

      coins: 1500,
      addCoins: (amount) =>
        set((state) => ({ coins: (state.coins ?? 0) + amount })),

      // ویژگی‌های رزمی رستم با محوریت «گرز گاوسر» و «ببر بیان»
      stats: {
        maceLevel: 1, // سطح گرز گاوسر
        armorLevel: 1, // سطح زره ببر بیان
        attackPower: 35, // قدرت ضربه گرز
        maxHealth: 150, // جان رستم
      },

      inventory: {
        nooshdaroo: 2,
        goldenKey: 0,
      },

      // پیشرفت خطی در هفت‌خوان (از ۱ تا ۷)
      currentKhan: 1,
      isGameCompleted: false,

      // پیروزی بر باس‌فایت و رفتن به خوان بعدی به صورت خطی
      advanceToNextKhan: (rewardCoins) =>
        set((state) => {
          const nextKhan = state.currentKhan < 7 ? state.currentKhan + 1 : 7;
          const completed = state.currentKhan === 7;
          return {
            coins: state.coins + rewardCoins,
            currentKhan: nextKhan,
            isGameCompleted: completed,
            gameStage: "MENU",
          };
        }),

      // مصرف نوشدارو در حین مبارزه
      useNooshdaroo: () => {
        const { inventory } = get();
        if ((inventory.nooshdaroo || 0) <= 0) return false;
        set({
          inventory: {
            ...inventory,
            nooshdaroo: inventory.nooshdaroo - 1,
          },
        });
        return true;
      },

      // ارتقای گرز گاوسر و زره ببر بیان
      upgradeEquipment: (type) => {
        const { coins, stats } = get();
        const currentMaceLvl = stats.maceLevel || 1;
        const currentArmorLvl = stats.armorLevel || 1;

        if (type === "mace") {
          const cost = currentMaceLvl * 300;
          if (coins < cost)
            return {
              success: false,
              message: "سکه کافی برای ارتقای گرز نداری پهلوان!",
            };

          set({
            coins: coins - cost,
            stats: {
              ...stats,
              maceLevel: currentMaceLvl + 1,
              attackPower: stats.attackPower + 18,
            },
          });
          return {
            success: true,
            message: "گرز گاوسر سنگین‌تر و کوبنده‌تر شد!",
          };
        }

        if (type === "armor") {
          const cost = currentArmorLvl * 350;
          if (coins < cost)
            return {
              success: false,
              message: "سکه کافی برای تقویت زره نداری پهلوان!",
            };

          set({
            coins: coins - cost,
            stats: {
              ...stats,
              armorLevel: currentArmorLvl + 1,
              maxHealth: stats.maxHealth + 40,
            },
          });
          return {
            success: true,
            message: "زره ببر بیان و شنل رزم مقاوم‌تر شد!",
          };
        }
      },

      buyShopItem: (itemKey, price) => {
        const { coins, inventory } = get();
        if (coins < price) {
          return { success: false, message: "سکه کافی برای این خرید نداری!" };
        }

        set({
          coins: coins - price,
          inventory: {
            ...inventory,
            [itemKey]: (inventory[itemKey] || 0) + 1,
          },
        });
        return { success: true, message: "آیتم به توشه رزم رستم اضافه شد!" };
      },
    }),
    {
      name: "rostam-linear-save",
      partialize: (state) => ({
        coins: state.coins,
        stats: state.stats,
        inventory: state.inventory,
        currentKhan: state.currentKhan,
        isGameCompleted: state.isGameCompleted,
      }),
    },
  ),
);
