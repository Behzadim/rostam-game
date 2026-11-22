import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mobileStorage } from "./mobileStorage";

// تاریخ روز جاری به فرمت YYYY-MM-DD (بر اساس ساعت دستگاه)
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATS = {
  maceLevel: 1, // سطح گرز گاوسر
  armorLevel: 1, // سطح زره ببر بیان
  strengthLevel: 1, // سطح زور بازو
  vitalityLevel: 1, // سطح جان پهلوانی
  attackPower: 35, // قدرت ضربه گرز
  maxHealth: 150, // جان رستم
};

const DEFAULT_INVENTORY = {
  nooshdaroo: 2,
  goldenKey: 0,
  simorghFeather: 0, // پر سیمرغ
  rageElixir: 0, // اکسیر خشم پهلوانی
  ironShield: 0, // طلسم سپر پولادین
};

const DEFAULT_DAILY_REWARDS = {
  claimedCount: 0, // تعداد روزهای دریافت‌شده (از ۰ تا ۱۰۰)
  lastClaimDate: null, // تاریخ آخرین دریافت (YYYY-MM-DD)
  streak: 0,
};

const DEFAULT_MISSIONS = {
  progress: {
    enemiesDefeated: 0,
    khansCompleted: 0,
    upgradesDone: 0,
    itemsBought: 0,
    adsWatched: 0,
    nooshdarooUsed: 0,
  },
  claimedIds: [],
};

const DEFAULT_RAKHSH = {
  speedLevel: 1,
  staminaLevel: 1,
  armorLevel: 1,
  equippedSkin: "default",
  ownedSkins: ["default"],
};

const DEFAULT_CLOTHES = {
  equippedId: "default",
  ownedIds: ["default"],
};

const DEFAULT_GIFTS = {
  claimedIds: [],
};

const DEFAULT_ADS = {
  lastWatchDate: null,
  watchedToday: 0,
  totalWatched: 0,
};

const DEFAULT_SETTINGS = {
  isMuted: false,
  musicVolume: 0.7,
  sfxVolume: 0.8,
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      // وضعیت بارگذاری سیو از حافظه موبایل
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // وضعیت‌های موقت صفحه (ذخیره نمی‌شوند)
      gameStage: "LOADING",
      setGameStage: (stage) => set({ gameStage: stage }),

      activeModal: null,
      setActiveModal: (modalName) => set({ activeModal: modalName }),

      // ---------------- دارایی‌ها و سطح بازیکن ----------------
      coins: 1500,
      addCoins: (amount) =>
        set((state) => ({
          coins: Math.max(0, (state.coins ?? 0) + amount),
        })),

      gems: 120,
      addGems: (amount) =>
        set((state) => ({
          gems: Math.max(0, (state.gems ?? 0) + amount),
        })),

      level: 1,
      xp: 0,
      xpToNext: 100,
      addXp: (amount) =>
        set((state) => {
          let newXp = (state.xp ?? 0) + amount;
          let newLevel = state.level ?? 1;
          let nextReq = state.xpToNext ?? 100;

          while (newXp >= nextReq) {
            newXp -= nextReq;
            newLevel += 1;
            nextReq = Math.round(nextReq * 1.35);
          }

          return { level: newLevel, xp: newXp, xpToNext: nextReq };
        }),

      // ---------------- ویژگی‌های رزمی، کوله‌پشتی و بازارچه ----------------
      stats: { ...DEFAULT_STATS },
      inventory: { ...DEFAULT_INVENTORY },
      bazaarPurchases: {},

      // ---------------- پیشرفت در هفت‌خوان ----------------
      currentKhan: 1,
      unlockedKhan: 1,
      khanStars: {},
      isGameCompleted: false,

      setCurrentKhan: (khanId) =>
        set({
          currentKhan: Math.max(1, Math.min(7, Number(khanId) || 1)),
        }),

      completeKhan: (khanId, rewardCoins = 0, earnedStars = 10) =>
        set((state) => {
          const finishedId = Math.max(
            1,
            Math.min(7, Number(khanId) || state.currentKhan || 1)
          );
          const nextUnlocked = Math.min(
            7,
            Math.max(state.unlockedKhan ?? 1, finishedId + 1)
          );
          const prevStars = state.khanStars?.[finishedId] ?? 0;
          const completedAll = state.isGameCompleted || finishedId === 7;
          const prevMissions = state.missions || DEFAULT_MISSIONS;

          return {
            coins: (state.coins ?? 0) + rewardCoins,
            unlockedKhan: nextUnlocked,
            currentKhan: finishedId < 7 ? finishedId + 1 : 7,
            isGameCompleted: completedAll,
            khanStars: {
              ...(state.khanStars || {}),
              [finishedId]: Math.max(prevStars, Math.min(10, earnedStars)),
            },
            missions: {
              ...prevMissions,
              progress: {
                ...DEFAULT_MISSIONS.progress,
                ...(prevMissions.progress || {}),
                khansCompleted:
                  (prevMissions.progress?.khansCompleted ?? 0) + 1,
              },
            },
            gameStage: "MENU",
          };
        }),

      advanceToNextKhan: (rewardCoins = 0, earnedStars = 10) => {
        const current = get().currentKhan ?? 1;
        get().completeKhan(current, rewardCoins, earnedStars);
      },

      // ---------------- مصرف آیتم‌ها در نبرد ----------------
      useNooshdaroo: () => {
        const { inventory, missions } = get();
        if ((inventory.nooshdaroo || 0) <= 0) return false;
        const prevMissions = missions || DEFAULT_MISSIONS;

        set({
          inventory: {
            ...inventory,
            nooshdaroo: inventory.nooshdaroo - 1,
          },
          missions: {
            ...prevMissions,
            progress: {
              ...DEFAULT_MISSIONS.progress,
              ...(prevMissions.progress || {}),
              nooshdarooUsed:
                (prevMissions.progress?.nooshdarooUsed ?? 0) + 1,
            },
          },
        });
        return true;
      },

      consumeInventoryItem: (itemKey) => {
        const { inventory } = get();
        if ((inventory[itemKey] || 0) <= 0) return false;
        set({
          inventory: {
            ...inventory,
            [itemKey]: inventory[itemKey] - 1,
          },
        });
        return true;
      },

      // ---------------- ارتقای گرز گاوسر و زره ببر بیان ----------------
      upgradeEquipment: (type) => {
        const { coins, stats, missions } = get();
        const currentMaceLvl = stats.maceLevel || 1;
        const currentArmorLvl = stats.armorLevel || 1;
        const prevMissions = missions || DEFAULT_MISSIONS;

        if (type === "mace") {
          const cost = currentMaceLvl * 300;
          if (coins < cost) {
            return {
              success: false,
              message: "سکه کافی برای ارتقای گرز نداری پهلوان!",
            };
          }

          set({
            coins: coins - cost,
            stats: {
              ...stats,
              maceLevel: currentMaceLvl + 1,
              attackPower: stats.attackPower + 18,
            },
            missions: {
              ...prevMissions,
              progress: {
                ...DEFAULT_MISSIONS.progress,
                ...(prevMissions.progress || {}),
                upgradesDone: (prevMissions.progress?.upgradesDone ?? 0) + 1,
              },
            },
          });
          return {
            success: true,
            message: "گرز گاوسر سنگین‌تر و کوبنده‌تر شد!",
          };
        }

        if (type === "armor") {
          const cost = currentArmorLvl * 350;
          if (coins < cost) {
            return {
              success: false,
              message: "سکه کافی برای تقویت زره نداری پهلوان!",
            };
          }

          set({
            coins: coins - cost,
            stats: {
              ...stats,
              armorLevel: currentArmorLvl + 1,
              maxHealth: stats.maxHealth + 40,
            },
            missions: {
              ...prevMissions,
              progress: {
                ...DEFAULT_MISSIONS.progress,
                ...(prevMissions.progress || {}),
                upgradesDone: (prevMissions.progress?.upgradesDone ?? 0) + 1,
              },
            },
          });
          return {
            success: true,
            message: "زره ببر بیان و شنل رزم مقاوم‌تر شد!",
          };
        }

        return { success: false, message: "نوع ارتقا نامعتبر است." };
      },

      buyShopItem: (itemKey, price) => {
        const { coins, inventory, bazaarPurchases, missions } = get();
        if (coins < price) {
          return { success: false, message: "سکه کافی برای این خرید نداری!" };
        }
        const prevMissions = missions || DEFAULT_MISSIONS;

        set({
          coins: coins - price,
          inventory: {
            ...inventory,
            [itemKey]: (inventory[itemKey] || 0) + 1,
          },
          bazaarPurchases: {
            ...(bazaarPurchases || {}),
            [itemKey]: (bazaarPurchases?.[itemKey] || 0) + 1,
          },
          missions: {
            ...prevMissions,
            progress: {
              ...DEFAULT_MISSIONS.progress,
              ...(prevMissions.progress || {}),
              itemsBought: (prevMissions.progress?.itemsBought ?? 0) + 1,
            },
          },
        });
        return { success: true, message: "آیتم به توشه رزم رستم اضافه شد!" };
      },

      // ---------------- جوایز روزانه (۱۰۰ روزه) ----------------
      dailyRewards: { ...DEFAULT_DAILY_REWARDS },

      canClaimDailyReward: () => {
        const dr = get().dailyRewards || DEFAULT_DAILY_REWARDS;
        const claimed = Math.min(100, Math.max(0, Number(dr.claimedCount) || 0));
        if (claimed >= 100) return false;
        return dr.lastClaimDate !== getTodayKey();
      },

      claimDailyReward: (dayNumber, reward = {}) => {
        const today = getTodayKey();
        const state = get();
        const dr = state.dailyRewards || DEFAULT_DAILY_REWARDS;
        const currentCount = Math.min(
          100,
          Math.max(0, Number(dr.claimedCount) || 0)
        );

        if (currentCount >= 100) {
          return {
            success: false,
            message: "تمام ۱۰۰ جایزه روزانه قبلاً دریافت شده است!",
          };
        }
        if (dr.lastClaimDate === today) {
          return {
            success: false,
            message: "جایزه امروز را قبلاً دریافت کرده‌ای!",
          };
        }

        const nextInventory = { ...(state.inventory || DEFAULT_INVENTORY) };
        if (reward.nooshdaroo) {
          nextInventory.nooshdaroo =
            (nextInventory.nooshdaroo || 0) + reward.nooshdaroo;
        }
        if (reward.itemKey && reward.itemAmount) {
          nextInventory[reward.itemKey] =
            (nextInventory[reward.itemKey] || 0) + reward.itemAmount;
        }

        set({
          coins: (state.coins ?? 0) + (reward.coins || 0),
          gems: (state.gems ?? 0) + (reward.gems || 0),
          inventory: nextInventory,
          dailyRewards: {
            claimedCount: Math.min(100, currentCount + 1),
            lastClaimDate: today,
            streak: (dr.streak || 0) + 1,
          },
        });

        if (reward.xp) {
          get().addXp(reward.xp);
        }

        return { success: true, message: "جایزه روزانه با موفقیت ذخیره شد!" };
      },

      // ---------------- ماموریت‌ها ----------------
      missions: {
        progress: { ...DEFAULT_MISSIONS.progress },
        claimedIds: [],
      },

      updateMissionProgress: (progressKey, amount = 1) =>
        set((state) => {
          const prevMissions = state.missions || DEFAULT_MISSIONS;
          return {
            missions: {
              ...prevMissions,
              progress: {
                ...DEFAULT_MISSIONS.progress,
                ...(prevMissions.progress || {}),
                [progressKey]:
                  (prevMissions.progress?.[progressKey] || 0) + amount,
              },
            },
          };
        }),

      claimMissionReward: (missionId, reward = {}) => {
        const state = get();
        const prevMissions = state.missions || DEFAULT_MISSIONS;
        const claimed = prevMissions.claimedIds || [];

        if (claimed.includes(missionId)) {
          return {
            success: false,
            message: "جایزه این ماموریت قبلاً دریافت شده!",
          };
        }

        const nextInventory = { ...(state.inventory || DEFAULT_INVENTORY) };
        if (reward.nooshdaroo) {
          nextInventory.nooshdaroo =
            (nextInventory.nooshdaroo || 0) + reward.nooshdaroo;
        }
        if (reward.itemKey && reward.itemAmount) {
          nextInventory[reward.itemKey] =
            (nextInventory[reward.itemKey] || 0) + reward.itemAmount;
        }

        set({
          coins: (state.coins ?? 0) + (reward.coins || 0),
          gems: (state.gems ?? 0) + (reward.gems || 0),
          inventory: nextInventory,
          missions: {
            ...prevMissions,
            claimedIds: [...claimed, missionId],
          },
        });

        if (reward.xp) {
          get().addXp(reward.xp);
        }

        return { success: true, message: "پاداش ماموریت دریافت و ذخیره شد!" };
      },

      // ---------------- اصطبل رخش ----------------
      rakhsh: { ...DEFAULT_RAKHSH, ownedSkins: ["default"] },

      upgradeRakhsh: (statKey, cost) => {
        const state = get();
        if ((state.coins ?? 0) < cost) {
          return { success: false, message: "سکه کافی برای ارتقای رخش نداری!" };
        }
        const prevMissions = state.missions || DEFAULT_MISSIONS;

        set({
          coins: state.coins - cost,
          rakhsh: {
            ...(state.rakhsh || DEFAULT_RAKHSH),
            [statKey]: (state.rakhsh?.[statKey] || 1) + 1,
          },
          missions: {
            ...prevMissions,
            progress: {
              ...DEFAULT_MISSIONS.progress,
              ...(prevMissions.progress || {}),
              upgradesDone: (prevMissions.progress?.upgradesDone ?? 0) + 1,
            },
          },
        });
        return { success: true, message: "رخش نیرومندتر شد!" };
      },

      // ---------------- لباس‌ها ----------------
      clothes: { ...DEFAULT_CLOTHES, ownedIds: ["default"] },

      buyCloth: (clothId, cost, currency = "coins") => {
        const state = get();
        const owned = state.clothes?.ownedIds || ["default"];
        if (owned.includes(clothId)) {
          return { success: false, message: "این لباس را قبلاً خریده‌ای!" };
        }

        const balance = currency === "gems" ? state.gems ?? 0 : state.coins ?? 0;
        if (balance < cost) {
          return {
            success: false,
            message: currency === "gems" ? "الماس کافی نداری!" : "سکه کافی نداری!",
          };
        }

        set({
          [currency]: balance - cost,
          clothes: {
            equippedId: clothId,
            ownedIds: [...owned, clothId],
          },
        });
        return { success: true, message: "لباس جدید خریداری و پوشیده شد!" };
      },

      equipCloth: (clothId) =>
        set((state) => {
          const owned = state.clothes?.ownedIds || ["default"];
          if (!owned.includes(clothId)) return state;
          return {
            clothes: {
              ...state.clothes,
              equippedId: clothId,
            },
          };
        }),

      // ---------------- هدایا و تبلیغات ----------------
      gifts: { claimedIds: [] },

      claimGift: (giftId, reward = {}) => {
        const state = get();
        const claimed = state.gifts?.claimedIds || [];
        if (claimed.includes(giftId)) {
          return { success: false, message: "این هدیه قبلاً دریافت شده است!" };
        }

        set({
          coins: (state.coins ?? 0) + (reward.coins || 0),
          gems: (state.gems ?? 0) + (reward.gems || 0),
          gifts: {
            claimedIds: [...claimed, giftId],
          },
        });
        return { success: true, message: "هدیه با موفقیت دریافت شد!" };
      },

      ads: { ...DEFAULT_ADS },

      recordAdWatched: (reward = { coins: 50, gems: 0 }) => {
        const today = getTodayKey();
        const state = get();
        const prevAds = state.ads || DEFAULT_ADS;
        const prevMissions = state.missions || DEFAULT_MISSIONS;
        const watchedToday =
          prevAds.lastWatchDate === today ? (prevAds.watchedToday || 0) + 1 : 1;

        set({
          coins: (state.coins ?? 0) + (reward.coins || 0),
          gems: (state.gems ?? 0) + (reward.gems || 0),
          ads: {
            lastWatchDate: today,
            watchedToday,
            totalWatched: (prevAds.totalWatched || 0) + 1,
          },
          missions: {
            ...prevMissions,
            progress: {
              ...DEFAULT_MISSIONS.progress,
              ...(prevMissions.progress || {}),
              adsWatched: (prevMissions.progress?.adsWatched ?? 0) + 1,
            },
          },
        });
      },

      // ---------------- تنظیمات صدا ----------------
      settings: { ...DEFAULT_SETTINGS },

      setMuted: (muted) =>
        set((state) => ({
          settings: {
            ...(state.settings || DEFAULT_SETTINGS),
            isMuted: Boolean(muted),
          },
        })),

      // ---------------- ریست کامل سیو (برای تست) ----------------
      resetProgress: () =>
        set({
          coins: 1500,
          gems: 120,
          level: 1,
          xp: 0,
          xpToNext: 100,
          stats: { ...DEFAULT_STATS },
          inventory: { ...DEFAULT_INVENTORY },
          bazaarPurchases: {},
          currentKhan: 1,
          unlockedKhan: 1,
          khanStars: {},
          isGameCompleted: false,
          dailyRewards: { ...DEFAULT_DAILY_REWARDS },
          missions: {
            progress: { ...DEFAULT_MISSIONS.progress },
            claimedIds: [],
          },
          rakhsh: { ...DEFAULT_RAKHSH, ownedSkins: ["default"] },
          clothes: { ...DEFAULT_CLOTHES, ownedIds: ["default"] },
          gifts: { claimedIds: [] },
          ads: { ...DEFAULT_ADS },
          activeModal: null,
          gameStage: "MENU",
        }),
    }),
    {
      name: "rostam-haft-khan-native-save-v1",
      version: 2,
      storage: createJSONStorage(() => mobileStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // اصلاح خودکار سیو قبلی بدون پاک شدن سکه و سایر پیشرفت‌ها
      migrate: (persistedState, version) => {
        const saved = persistedState || {};
        if (version < 2) {
          const stars = saved.khanStars || {};
          const highestFromStars = Object.entries(stars).reduce(
            (max, [id, count]) =>
              Number(count) > 0 ? Math.max(max, Number(id) + 1) : max,
            1
          );
          const fixedUnlocked = Math.min(7, highestFromStars);

          return {
            ...saved,
            unlockedKhan: fixedUnlocked,
            currentKhan: Math.min(saved.currentKhan ?? 1, fixedUnlocked),
          };
        }
        return saved;
      },
      // تمام اطلاعات دائمی بازی ذخیره می‌شوند
      partialize: (state) => ({
        coins: state.coins,
        gems: state.gems,
        level: state.level,
        xp: state.xp,
        xpToNext: state.xpToNext,
        stats: state.stats,
        inventory: state.inventory,
        bazaarPurchases: state.bazaarPurchases,
        currentKhan: state.currentKhan,
        unlockedKhan: state.unlockedKhan,
        khanStars: state.khanStars,
        isGameCompleted: state.isGameCompleted,
        dailyRewards: state.dailyRewards,
        missions: state.missions,
        rakhsh: state.rakhsh,
        clothes: state.clothes,
        gifts: state.gifts,
        ads: state.ads,
        settings: state.settings,
      }),
      // ادغام ایمن: هرگز currentKhan باعث باز شدن قفل unlockedKhan نمی‌شود
      merge: (persistedState, currentState) => {
        const saved = persistedState || {};
        const restoredUnlocked = Math.max(
          1,
          Math.min(7, Number(saved.unlockedKhan) || 1)
        );
        const restoredCurrentKhan = Math.max(
          1,
          Math.min(restoredUnlocked, Number(saved.currentKhan) || 1)
        );

        return {
          ...currentState,
          ...saved,
          stats: { ...DEFAULT_STATS, ...(saved.stats || {}) },
          inventory: { ...DEFAULT_INVENTORY, ...(saved.inventory || {}) },
          bazaarPurchases: saved.bazaarPurchases || {},
          khanStars: saved.khanStars || {},
          unlockedKhan: restoredUnlocked,
          currentKhan: restoredCurrentKhan,
          dailyRewards: {
            ...DEFAULT_DAILY_REWARDS,
            ...(saved.dailyRewards || {}),
          },
          missions: {
            progress: {
              ...DEFAULT_MISSIONS.progress,
              ...(saved.missions?.progress || {}),
            },
            claimedIds: saved.missions?.claimedIds || [],
          },
          rakhsh: {
            ...DEFAULT_RAKHSH,
            ...(saved.rakhsh || {}),
            ownedSkins: saved.rakhsh?.ownedSkins || ["default"],
          },
          clothes: {
            ...DEFAULT_CLOTHES,
            ...(saved.clothes || {}),
            ownedIds: saved.clothes?.ownedIds || ["default"],
          },
          gifts: {
            claimedIds: saved.gifts?.claimedIds || [],
          },
          ads: {
            ...DEFAULT_ADS,
            ...(saved.ads || {}),
          },
          settings: {
            ...DEFAULT_SETTINGS,
            ...(saved.settings || {}),
          },
        };
      },
    }
  )
);