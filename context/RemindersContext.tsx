import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderState {
  enabled: boolean;
  intervalMinutes: number;
  lastTrigger: number; // timestamp (ms)
}

interface StoredReminders {
  water: ReminderState;
  breaks: ReminderState;
  waterCount: number;
  waterCountDate: string; // YYYY-MM-DD, for daily reset
}

interface RemindersData {
  loaded: boolean;
  water: ReminderState;
  breaks: ReminderState;
  waterCount: number;
  waterGoal: number;
  waterDue: boolean;
  breaksDue: boolean;
  waterRemainingMs: number;
  breaksRemainingMs: number;
  setWaterEnabled: (v: boolean) => void;
  setWaterInterval: (mins: number) => void;
  setBreaksEnabled: (v: boolean) => void;
  setBreaksInterval: (mins: number) => void;
  logWater: () => void;
  snoozeWater: (mins: number) => void;
  takeBreak: () => void;
  snoozeBreak: (mins: number) => void;
}

const WATER_GOAL = 8;
const STORAGE_KEY = '@rova_reminders';

const defaultState: StoredReminders = {
  water: { enabled: true, intervalMinutes: 60, lastTrigger: Date.now() },
  breaks: { enabled: true, intervalMinutes: 30, lastTrigger: Date.now() },
  waterCount: 0,
  waterCountDate: new Date().toDateString(),
};

const RemindersContext = createContext<RemindersData>({
  loaded: false,
  water: defaultState.water,
  breaks: defaultState.breaks,
  waterCount: 0,
  waterGoal: WATER_GOAL,
  waterDue: false,
  breaksDue: false,
  waterRemainingMs: 0,
  breaksRemainingMs: 0,
  setWaterEnabled: () => {},
  setWaterInterval: () => {},
  setBreaksEnabled: () => {},
  setBreaksInterval: () => {},
  logWater: () => {},
  snoozeWater: () => {},
  takeBreak: () => {},
  snoozeBreak: () => {},
});

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredReminders>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Load persisted settings
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed: StoredReminders = JSON.parse(raw);
          const today = new Date().toDateString();
          setState({
            ...parsed,
            waterCount: parsed.waterCountDate === today ? parsed.waterCount : 0,
            waterCountDate: today,
          });
        } catch {
          // ignore corrupt storage
        }
      }
      setLoaded(true);
    });
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  // Tick every 15s so countdowns and "due" flags stay current
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15 * 1000);
    return () => clearInterval(id);
  }, []);

  const waterIntervalMs = state.water.intervalMinutes * 60 * 1000;
  const breaksIntervalMs = state.breaks.intervalMinutes * 60 * 1000;
  const waterRemainingMs = Math.max(0, state.water.lastTrigger + waterIntervalMs - now);
  const breaksRemainingMs = Math.max(0, state.breaks.lastTrigger + breaksIntervalMs - now);
  const waterDue = state.water.enabled && waterRemainingMs <= 0;
  const breaksDue = state.breaks.enabled && breaksRemainingMs <= 0;

  const setWaterEnabled = (v: boolean) =>
    setState(s => ({ ...s, water: { ...s.water, enabled: v, lastTrigger: Date.now() } }));
  const setWaterInterval = (mins: number) =>
    setState(s => ({ ...s, water: { ...s.water, intervalMinutes: mins, lastTrigger: Date.now() } }));
  const setBreaksEnabled = (v: boolean) =>
    setState(s => ({ ...s, breaks: { ...s.breaks, enabled: v, lastTrigger: Date.now() } }));
  const setBreaksInterval = (mins: number) =>
    setState(s => ({ ...s, breaks: { ...s.breaks, intervalMinutes: mins, lastTrigger: Date.now() } }));

  const logWater = () =>
    setState(s => {
      const today = new Date().toDateString();
      const count = s.waterCountDate === today ? s.waterCount : 0;
      return {
        ...s,
        water: { ...s.water, lastTrigger: Date.now() },
        waterCount: count + 1,
        waterCountDate: today,
      };
    });

  const snoozeWater = (mins: number) =>
    setState(s => ({ ...s, water: { ...s.water, lastTrigger: Date.now() - waterIntervalMs + mins * 60 * 1000 } }));

  const takeBreak = () =>
    setState(s => ({ ...s, breaks: { ...s.breaks, lastTrigger: Date.now() } }));

  const snoozeBreak = (mins: number) =>
    setState(s => ({ ...s, breaks: { ...s.breaks, lastTrigger: Date.now() - breaksIntervalMs + mins * 60 * 1000 } }));

  return (
    <RemindersContext.Provider
      value={{
        loaded,
        water: state.water,
        breaks: state.breaks,
        waterCount: state.waterCount,
        waterGoal: WATER_GOAL,
        waterDue,
        breaksDue,
        waterRemainingMs,
        breaksRemainingMs,
        setWaterEnabled,
        setWaterInterval,
        setBreaksEnabled,
        setBreaksInterval,
        logWater,
        snoozeWater,
        takeBreak,
        snoozeBreak,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  return useContext(RemindersContext);
}
