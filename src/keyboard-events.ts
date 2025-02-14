import { filter, fromEvent, map, merge, NEVER, of, switchMap, timer } from 'rxjs';
import { Directions, DirectionType } from './directions';
import { Canvas } from './canvas';

const isDirectionKey = (
  event: KeyboardEvent,
): event is KeyboardEvent & {
  key: DirectionType;
} => Directions.isDirectionKey(event.key);

export namespace KeyboardEvents {
  export const all$ = fromEvent<KeyboardEvent>(window, 'keydown');
  export const alphaNumeric$ = all$.pipe(
    filter((event) => /^[a-zA-Z0-9]$/.test(event.key)),
  );
  export const number$ = all$.pipe(filter((event) => /^[0-9]$/.test(event.key)));
  const directionKey$ = all$.pipe(filter(isDirectionKey));
  const keyupDirectionKey$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(
    filter(isDirectionKey),
  );
  // replicates the default KeyboardEvent.repeat delay with custom delay
  export const direction$ = merge(
    directionKey$.pipe(filter((event) => !event.repeat)),
    directionKey$.pipe(filter((event) => !event.repeat)).pipe(
      switchMap((event) =>
        merge(
          of(event),
          keyupDirectionKey$.pipe(
            filter((keyupEvent) => keyupEvent.key === event.key),
            map(() => null),
          ),
        ).pipe(
          switchMap((event) =>
            !event
              ? NEVER
              : timer(Canvas.activeMoveDelay * 2, Canvas.activeMoveDelay).pipe(
                  map(() => event),
                ),
          ),
        ),
      ),
    ),
  );
  export const escape$ = all$.pipe(filter((event) => event.key === 'Escape'));
  export const space$ = all$.pipe(filter((event) => event.key === ' '));
  export const enter$ = all$.pipe(filter((event) => event.key === 'Enter'));
  export const confirm$ = merge(space$, enter$);
  export const backspace$ = all$.pipe(filter((event) => event.key === 'Backspace'));
}
