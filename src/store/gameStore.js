import { create } from 'zustand';
export const useGameStore = create((set) => ({
  gameStage: 'LOADING', // حالت‌های ممکن: 'LOADING', 'MENU', 'PLAYING'
  setGameStage: (stage) => set({ gameStage: stage }),
}));