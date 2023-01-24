import { BehaviorSubject, throttleTime, elementAt, takeUntil, timer, merge, } from 'rxjs'

const THROTTLE_TIME = 100;
const UNTIL = 50;
const loadingCount$ = new BehaviorSubject(0);
const throttledLoadingCount$ = loadingCount$.pipe(
  throttleTime(THROTTLE_TIME, undefined, { leading: true, trailing: true }),
);
const firstLoadAfterMount$ = loadingCount$.pipe(elementAt(1), takeUntil(timer(UNTIL)));
const loadingState$ = merge(throttledLoadingCount$, firstLoadAfterMount$)
// .pipe(
//   map((v) => (v > 0 ? "pending" : "idle")),
//   distinctUntilChanged(),
// )

subComp(loadingState$, (v) => console.log(v));

setTimeout(() => obsComp(loadingCount$, 100), 1_000)

// helpers

function add(sub) {
  sub.next(sub.getValue() + 1);
}

function remove(sub) {
  sub.next(sub.getValue() - 1);
}

function obsComp(sub, timeout = 1_000) {
  add(sub)
  setTimeout(() => {
    remove(sub)
  }, timeout)
}

function subComp(source, cb) {
  source.subscribe({ next: cb });
}