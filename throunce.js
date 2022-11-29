import { interval, throttleTime, debounceTime, merge } from 'rxjs';

const interval$ = interval(1_00);

const DURATION = 1_000

const source$ = merge(interval$.pipe(throttleTime(DURATION)), interval$.pipe(debounceTime(DURATION)))
  .pipe(throttleTime(0, undefined, { leading: true, trailing: false }))

function subComp(source, cb) {
  source.subscribe({ next: cb });
}

subComp(source$, (v) => console.log(v));