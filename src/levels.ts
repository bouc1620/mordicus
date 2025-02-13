import { assert } from 'ts-essentials';
import { GridType } from './grid';

export type Level = Readonly<{
  grid: GridType;
  isCustom: boolean;
  stage: number;
  password: string;
}>;

const simpleLength6Hash = (str: string): string =>
  [...str]
    .reduce((hash, char) => (Math.imul(31, hash) + char.charCodeAt(0)) | 0, 123456)
    .toString()
    .slice(-6);

const getAugmentedGrid = (
  grid: GridType,
  isCustom: boolean,
  index: number,
): Omit<Level, 'password'> => ({
  grid,
  isCustom,
  stage: index + 1,
});

export class Levels {
  private _originalLevels = new Map<string, Level>();
  private _customLevels = new Map<string, Level>();

  async loadLevels(): Promise<void> {
    const rawLevels = (await (await fetch('/levels/levels.json')).json()) as {
      original: GridType[];
      custom: GridType[];
    };

    for (const [type, list] of Object.entries(rawLevels)) {
      const isCustom = type === 'custom';
      const levelsMap = isCustom ? this._customLevels : this._originalLevels;
      list.forEach((grid, index) => {
        let password = simpleLength6Hash(JSON.stringify(grid));
        while (levelsMap.has(password)) {
          password = `${Number(password) + 1}`.slice(-6);
        }

        levelsMap.set(password, {
          ...getAugmentedGrid(grid, isCustom, index),
          password,
        });
      });
    }

    // logs level passwords
    // for (const levelsMap of [this._customLevels, this._originalLevels]) {
    //   const iter = levelsMap.entries();
    //   let value;
    //   let stage = 1;
    //   while ((value = iter.next().value)) {
    //     console.log(
    //       `${value[1].isCustom ? 'custom' : 'original'} level #${stage} password: ${value[0]}`,
    //     );
    //     stage++;
    //   }
    // }
  }

  findLevelWithPassword(password: string): Level | undefined {
    return this._originalLevels.get(password) ?? this._customLevels.get(password);
  }

  findLevelWithStageNumber(
    stage: number,
    isCustom: boolean = false,
  ): Level | undefined {
    assert(
      stage > 0,
      `stage number should be an integer greater than zero, requested stage #${stage}`,
    );

    const levelsMap = !isCustom ? this._originalLevels : this._customLevels;
    const iter = levelsMap.entries();
    while (--stage > 0) iter.next();
    return iter.next().value?.[1];
  }
}
