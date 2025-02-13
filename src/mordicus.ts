import { assert } from 'ts-essentials';
import {
  defer,
  exhaustMap,
  filter,
  forkJoin,
  from,
  last,
  merge,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Canvas, toggleUseOriginalTitleScreen } from './canvas';
import { Levels } from './levels';
import { Logic } from './logic';
import {
  State,
  initalState,
  updateBestScore,
  updateBestTotalScore,
} from './game-state';
import { KeyboardEvents } from './keyboard-events';

export class Game {
  private _state = new State();
  private _levels = new Levels();
  private _canvas: Canvas;

  constructor(private _canvasElement: HTMLCanvasElement) {
    this._canvas = new Canvas(this._canvasElement);
  }

  get start$(): Observable<unknown> {
    return forkJoin({
      images: this._canvas.loadImages$(),
      levels: from(this._levels.loadLevels()),
    }).pipe(
      switchMap(() =>
        this._state.screen$.pipe(
          switchMap((screen) => {
            this._canvas.drawSync(this._state.snapshot);
            switch (screen) {
              case 'title':
                return this._titleScreen$;
              case 'usePassword':
                return this._usePasswordScreen$;
              case 'inputPassword':
                return this._inputPasswordScreen$;
              case 'level':
                return this._levelScreen$;
              case 'retry':
                return this._retryScreen$;
              case 'complete':
                return this._completeScreen$;
              case 'gameOver':
                return this._gameOverScreen$;
              case 'end':
                return this._endScreen$;
            }
          }),
        ),
      ),
    );
  }

  private _titleScreen$ = defer(() =>
    merge(
      KeyboardEvents.all$.pipe(
        filter((event) => event.key === 'o'),
        tap(() => {
          toggleUseOriginalTitleScreen();
          this._canvas.drawSync(this._state.snapshot);
        }),
      ),
      KeyboardEvents.confirm$.pipe(
        tap(() => this._state.update({ screen: 'usePassword' })),
      ),
    ),
  );

  private _usePasswordScreen$ = defer(() =>
    KeyboardEvents.number$.pipe(
      filter((event) => event.key === '1' || event.key === '2'),
      tap((event) => {
        if (event.key === '1') {
          this._state.update({
            screen: 'inputPassword',
          });
        } else {
          const isCustom = this._state.snapshot.isCustom;
          const firstLevel = this._levels.findLevelWithStageNumber(1, isCustom);
          assert(
            firstLevel,
            `there are no levels in the list of ${isCustom ? 'custom' : 'original'} levels`,
          );

          this._state.update({
            screen: 'level',
            score: initalState.score,
            bonus: initalState.bonus,
            lives: initalState.lives,
            ...firstLevel,
          });
        }
      }),
    ),
  );

  private _inputPasswordScreen$ = defer(() =>
    merge(
      KeyboardEvents.number$.pipe(
        tap((event) => {
          this._state.update({
            input: `${this._state.snapshot.input.substring(0, 5)}${event.key.toLowerCase()}`,
          });
          this._canvas.drawSync(this._state.snapshot);
        }),
      ),
      KeyboardEvents.backspace$.pipe(
        tap(() => {
          this._state.update({
            input: this._state.snapshot.input.slice(0, -1),
          });
          this._canvas.drawSync(this._state.snapshot);
        }),
      ),
      KeyboardEvents.enter$.pipe(
        tap(() => {
          const level = this._levels.findLevelWithPassword(
            this._state.snapshot.input,
          );

          if (!level) {
            return;
          }

          this._state.update({
            screen: 'level',
            score: initalState.score,
            bonus: initalState.bonus,
            lives: initalState.lives,
            input: initalState.input,
            ...level,
          });
        }),
      ),
      KeyboardEvents.escape$.pipe(
        tap(() => {
          const isCustom = !!this._levels.findLevelWithPassword(
            this._state.snapshot.password,
          )?.isCustom;
          const firstLevel = this._levels.findLevelWithStageNumber(1, isCustom);
          assert(
            firstLevel,
            `there are no levels in the list of ${isCustom ? 'custom' : 'original'} levels`,
          );

          this._state.update({
            screen: 'level',
            score: initalState.score,
            bonus: initalState.bonus,
            lives: initalState.lives,
            input: initalState.input,
            ...firstLevel,
          });
        }),
      ),
    ),
  );

  private _levelScreen$ = defer(() =>
    merge(
      of(undefined),
      KeyboardEvents.escape$.pipe(
        filter(
          () =>
            !Logic.isPlayerDead(this._state.snapshot) &&
            !Logic.isSuccess(this._state.snapshot),
        ),
      ),
    ).pipe(
      switchMap((event) =>
        event
          ? of(event).pipe(
              tap(() => {
                this._state.update({
                  lives: this._state.snapshot.lives - 1,
                });

                if (Logic.isGameOver(this._state.snapshot)) {
                  this._state.update({
                    screen: 'gameOver',
                  });
                } else {
                  this._state.update({
                    screen: 'retry',
                  });
                }
              }),
            )
          : KeyboardEvents.direction$.pipe(
              startWith(undefined),
              exhaustMap((keyboardEvent) =>
                keyboardEvent
                  ? this._canvas
                      .getMoveDrawingQueue$(
                        Logic.getMoveResultQueue(
                          this._state.snapshot,
                          keyboardEvent.key,
                        ),
                        (state) => this._state.update(state),
                      )
                      .pipe(last())
                  : this._canvas.getMoveDrawingQueue$(
                      Logic.getResolveStateResults(this._state.snapshot),
                      (state) => this._state.update(state),
                    ),
              ),
              tap((snapshot) => {
                if (Logic.isGameOver(snapshot)) {
                  this._state.update({
                    ...snapshot,
                    screen: 'gameOver',
                  });
                } else if (Logic.isPlayerDead(snapshot)) {
                  this._state.update({
                    ...snapshot,
                    screen: 'retry',
                  });
                } else if (Logic.isSuccess(snapshot)) {
                  updateBestScore(snapshot);

                  this._state.update({
                    ...snapshot,
                    screen: 'complete',
                  });
                } else {
                  this._state.update(snapshot);
                }
              }),
            ),
      ),
    ),
  );

  private _retryScreen$ = defer(() =>
    KeyboardEvents.confirm$.pipe(
      tap(() => {
        const password = this._state.snapshot.password;
        const currentLevel = this._levels.findLevelWithPassword(password);
        assert(
          currentLevel,
          `unexpected error, could not find level with password ${password}`,
        );

        this._state.update({
          screen: 'level',
          bonus: initalState.bonus,
          ...currentLevel,
        });
      }),
    ),
  );

  private _completeScreen$ = defer(() =>
    KeyboardEvents.number$.pipe(
      filter((event) => event.key === '1' || event.key === '2'),
      tap((event) => {
        const isRetry = event.key === '1';
        const nextLevel = this._levels.findLevelWithStageNumber(
          isRetry ? this._state.snapshot.stage : this._state.snapshot.stage + 1,
          this._state.snapshot.isCustom,
        );

        const newScore = this._state.snapshot.score + this._state.snapshot.bonus;
        if (nextLevel) {
          this._state.update({
            screen: 'level',
            score: isRetry ? this._state.snapshot.score : newScore,
            bonus: initalState.bonus,
            ...nextLevel,
          });
        } else {
          this._state.update({
            score: newScore,
          });
          updateBestTotalScore(this._state.snapshot);

          this._state.update({
            screen: 'end',
          });
        }
      }),
    ),
  );

  private _gameOverScreen$ = defer(() =>
    KeyboardEvents.confirm$.pipe(
      tap(() =>
        this._state.update({
          screen: 'title',
          input: this._state.snapshot.password,
        }),
      ),
    ),
  );

  private _endScreen$ = defer(() =>
    KeyboardEvents.confirm$.pipe(
      tap(() =>
        this._state.update({
          screen: 'end',
        }),
      ),
    ),
  );
}
