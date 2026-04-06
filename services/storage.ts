import { UserProgress } from '../types';

const STORAGE_KEY = 'piano_hero_save';

export const loadGame = (): UserProgress | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load game', e);
    return null;
  }
};

export const saveGame = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save game', e);
  }
};
