import { Subject, from, map } from 'rxjs';

// observable that allows multicasting to multiple observers
const subject = new Subject();

// subscribe does not trigger a new execution
subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

// every subject is an observer with next, error and complete methods
subject.next(1);
subject.next(2);

const observable = from([3, 4, 5]).pipe(map(x => x * x));

observable.subscribe(subject)
