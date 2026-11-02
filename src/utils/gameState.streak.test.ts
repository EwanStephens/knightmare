// src/utils/gameState.streak.test.ts
// Tests for daily streak tracking

import type { GlobalStats } from './gameState';

type GameStateModule = typeof import('./gameState');

let storage: Record<string, string>;
let gameState: GameStateModule;

beforeEach(async () => {
  storage = {};
  // gameState checks for `window` at import time, so stub browser globals before loading it
  Object.assign(globalThis, {
    window: {},
    localStorage: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    },
  });
  jest.resetModules();
  gameState = await import('./gameState');
});

afterEach(() => {
  const globals = globalThis as Record<string, unknown>;
  delete globals.window;
  delete globals.localStorage;
});

// Local-time Date, so tests behave the same in any timezone
const at = (year: number, month: number, day: number, hour = 12, minute = 0) =>
  new Date(year, month - 1, day, hour, minute);

const withStats = (stats: GlobalStats) => gameState.setGlobalStats(stats);

describe('updateStreakForDate', () => {
  it('starts a streak on first play', () => {
    gameState.updateStreakForDate('2026-11-02', at(2026, 11, 2));
    expect(gameState.getGlobalStats()).toEqual({
      daysPlayed: 1,
      currentStreak: 1,
      maxStreak: 1,
      lastPlayDate: '2026-11-02',
    });
  });

  it('continues the streak when the previous day was played', () => {
    withStats({ daysPlayed: 5, currentStreak: 5, maxStreak: 5, lastPlayDate: '2026-11-01' });
    gameState.updateStreakForDate('2026-11-02', at(2026, 11, 2));
    expect(gameState.getGlobalStats()).toMatchObject({ daysPlayed: 6, currentStreak: 6, maxStreak: 6 });
  });

  it('continues the streak across a month boundary', () => {
    withStats({ daysPlayed: 3, currentStreak: 3, maxStreak: 3, lastPlayDate: '2026-10-31' });
    gameState.updateStreakForDate('2026-11-01', at(2026, 11, 1));
    expect(gameState.getGlobalStats().currentStreak).toBe(4);
  });

  it('resets the streak when a day was missed', () => {
    withStats({ daysPlayed: 5, currentStreak: 5, maxStreak: 8, lastPlayDate: '2026-10-31' });
    gameState.updateStreakForDate('2026-11-02', at(2026, 11, 2));
    expect(gameState.getGlobalStats()).toMatchObject({ daysPlayed: 6, currentStreak: 1, maxStreak: 8 });
  });

  it('does nothing when the same day is completed again', () => {
    const stats = { daysPlayed: 5, currentStreak: 5, maxStreak: 5, lastPlayDate: '2026-11-02' };
    withStats(stats);
    gameState.updateStreakForDate('2026-11-02', at(2026, 11, 2, 18));
    expect(gameState.getGlobalStats()).toEqual(stats);
  });

  it("ignores yesterday's puzzle reopened in an old tab after today was played", () => {
    const stats = { daysPlayed: 5, currentStreak: 5, maxStreak: 5, lastPlayDate: '2026-11-02' };
    withStats(stats);
    gameState.updateStreakForDate('2026-11-01', at(2026, 11, 2, 18));
    expect(gameState.getGlobalStats()).toEqual(stats);
  });

  it('ignores an archive puzzle from an old tab before today is played', () => {
    const stats = { daysPlayed: 5, currentStreak: 5, maxStreak: 5, lastPlayDate: '2026-11-01' };
    withStats(stats);
    gameState.updateStreakForDate('2026-10-31', at(2026, 11, 2, 9));
    expect(gameState.getGlobalStats()).toEqual(stats);

    // Today's puzzle still continues the streak afterwards
    gameState.updateStreakForDate('2026-11-02', at(2026, 11, 2, 10));
    expect(gameState.getGlobalStats().currentStreak).toBe(6);
  });

  it("counts yesterday's puzzle finished within the grace period after midnight", () => {
    withStats({ daysPlayed: 5, currentStreak: 5, maxStreak: 5, lastPlayDate: '2026-10-31' });
    gameState.updateStreakForDate('2026-11-01', at(2026, 11, 2, 1, 59));
    expect(gameState.getGlobalStats()).toMatchObject({ currentStreak: 6, lastPlayDate: '2026-11-01' });

    // And today's puzzle continues the streak from there
    gameState.updateStreakForDate('2026-11-02', at(2026, 11, 2, 9));
    expect(gameState.getGlobalStats()).toMatchObject({ currentStreak: 7, lastPlayDate: '2026-11-02' });
  });

  it("ignores yesterday's puzzle finished after the grace period", () => {
    const stats = { daysPlayed: 5, currentStreak: 5, maxStreak: 5, lastPlayDate: '2026-10-31' };
    withStats(stats);
    gameState.updateStreakForDate('2026-11-01', at(2026, 11, 2, 2, 1));
    expect(gameState.getGlobalStats()).toEqual(stats);
  });

  it('ignores future puzzles', () => {
    gameState.updateStreakForDate('2026-11-03', at(2026, 11, 2));
    expect(gameState.getGlobalStats()).toEqual({ daysPlayed: 0, currentStreak: 0, maxStreak: 0 });
  });
});
