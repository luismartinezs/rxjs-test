import {
  BehaviorSubject, throttleTime, tap
} from 'rxjs';

const THROTTLE_TIME = 500;
const INITIAL_VALUE = 0;

const sub$ = new BehaviorSubject(INITIAL_VALUE);
const source$ = sub$.pipe(tap(x => console.log('Processing: ', x)), throttleTime(THROTTLE_TIME, undefined, { leading: true, trailing: true }),);

function add() {
  sub$.next(sub$.getValue() + 1);
}

function remove() {
  sub$.next(sub$.getValue() - 1);
}

function obsComp(timeout = 1_000) {
  add()
  setTimeout(() => {
    remove()
  }, timeout)
}

function subComp(source, cb) {
  source.subscribe({ next: cb });
}

subComp(source$, (v) => console.log(v));

obsComp(THROTTLE_TIME + 100)
setTimeout(() => obsComp(200), 100)
setTimeout(() => obsComp(200), 100)
setTimeout(() => obsComp(200), 100)
setTimeout(() => obsComp(200), 100)
setTimeout(() => obsComp(600), 400)
setTimeout(() => obsComp(100), 600)

