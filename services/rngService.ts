import { MATERIALS_LIST } from "../data/materials";

interface WeekData {
  week_number: number;
  yes_count: number;
}

const STORAGE_KEY = 'rng_week_data';

// Helper to get current ISO week number
const getCurrentWeek = (): number => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

// Load data mimicking the Python load_week_data
export const loadWeekData = (): WeekData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const currentWeek = getCurrentWeek();
  
  if (!raw) {
    const newData = { week_number: currentWeek, yes_count: 0 };
    saveWeekData(newData);
    return newData;
  }

  const data = JSON.parse(raw) as WeekData;
  if (data.week_number !== currentWeek) {
    const newData = { week_number: currentWeek, yes_count: 0 };
    saveWeekData(newData);
    return newData;
  }

  return data;
};

const saveWeekData = (data: WeekData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetWins = () => {
  const data = loadWeekData();
  data.yes_count = 0;
  saveWeekData(data);
};

// Logic for probabilities based on day of week
// Python: Mon=0, Sun=6. JS: Sun=0, Mon=1.
const getTodayProbabilities = (): [number, number] | null => {
  const jsDay = new Date().getDay();
  // Map JS Day to Python Index (Mon=0, ..., Fri=4, Sat=5, Sun=6)
  const pythonDay = jsDay === 0 ? 6 : jsDay - 1;

  const probabilities: Record<number, [number, number]> = {
    0: [0.80, 0.20], // Mon
    1: [0.60, 0.40], // Tue
    2: [0.60, 0.40], // Wed
    3: [0.99, 0.01], // Thu
    4: [0.80, 0.20], // Fri
  };

  return probabilities[pythonDay] || null;
};

export const rollWithLimit = (): string => {
  const data = loadWeekData();

  if (data.yes_count >= 3) {
    return "Dont Break The Rule!";
  }

  const probs = getTodayProbabilities();
  if (!probs) {
    return "No Rolls For The Weekend!";
  }

  const [probNo, probYes] = probs;
  // Random float 0-1
  const rand = Math.random();
  
  // Logic: if rand < probNo, it's No. Else Yes.
  // E.g. 0.80 No. if rand 0.7 -> No. if rand 0.9 -> Yes.
  const result = rand < probNo ? "No 🥶" : "Yes 🥵";

  if (result === "Yes 🥵") {
    data.yes_count += 1;
    saveWeekData(data);
  }

  return result;
};

export const checkMultiple = (): string => {
  const result = Math.random() < 0.5 ? "No" : "Yes";
  return result;
};

export const getMaterials = (num: number): string[] => {
  const selected: string[] = [];
  const list = [...MATERIALS_LIST];
  for (let i = 0; i < num; i++) {
    if (list.length === 0) break;
    const randomIndex = Math.floor(Math.random() * list.length);
    selected.push(list[randomIndex]);
    // Optional: Avoid duplicates in one draw? Python random.choice doesn't remove, 
    // but typically gacha might want distinct. The python script used random.choice inside a loop 
    // without removing, so duplicates were possible. I will replicate that behavior.
    // To replicate Python exactly: don't remove from list.
  }
  return selected;
};