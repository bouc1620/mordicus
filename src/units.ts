import { ElementOf } from 'ts-essentials';

export type UnitType = ElementOf<typeof Units.all>;
export type Arrow = ElementOf<typeof Units.arrows>;

export namespace Units {
  export const all = [
    '😮',
    '🟡',
    '🍌',
    '🦍',
    '🐵',
    '🙈',
    '🟩',
    '🟥',
    '⬆️',
    '➡️',
    '⬇️',
    '⬅️',
    '⬛',
  ] as const;
  export const arrows = ['⬆️', '➡️', '⬇️', '⬅️'] as const;
  export const attackers = ['🦍', '🐵'] as const;
  export const moveBlockers = ['🟥', '🙈'] as const;
  export const pushBlockers = [...moveBlockers, '🦍', '🐵', '🟡'] as const;
  export const moveables = [...arrows, '🍌', '🟩'] as const;
}
