// eslint-disable-next-line no-unused-vars
import { Observable, Subject, from, timer, switchMap, of, map, timeout, repeat, delayWhen, delay, auditTime, debounce, debounceTime, merge } from 'rxjs';

const subject$ = new Subject();
const delayed$ = subject$.pipe(
  debounceTime(2000),
  map(() => 'empty')
)
const merge$ = merge(subject$, delayed$)

merge$.subscribe(val => console.log(val));

subject$.next(1);
setTimeout(() => {
  subject$.next(2);
}, 500);
setTimeout(() => {
  subject$.next(3);
}, 1000);
setTimeout(() => {
  subject$.next(4);
}, 1500 + 2100)