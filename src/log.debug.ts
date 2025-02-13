import { GridType } from './grid';

export const logWithUniquePrefix = (...messages: any[]): void => {
  console.log(`${Math.floor(Math.random() * 100)}`.padStart(3, '0'), ...messages);
};

export const logGrid = (grid: GridType): void => {
  logWithUniquePrefix(`${performance.now()}`);
  for (const row of grid) {
    logWithUniquePrefix(row.join(''));
  }
};
