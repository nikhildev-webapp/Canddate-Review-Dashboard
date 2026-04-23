// LocalStorage utility for persisting candidate data

const STORAGE_KEY = 'candidate-dashboard-data';

export const loadCandidatesFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
};

export const saveCandidatesToStorage = (candidates) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};