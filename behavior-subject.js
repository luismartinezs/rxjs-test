import { BehaviorSubject } from 'rxjs';
// BehaviorSubject is a Subject with a notion of "the current value".
// good for representing "values over time"

const subject = new BehaviorSubject(0); // 0 is the initial value

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`), // log A 0
});

subject.next(1); // log A 1
subject.next(2); // log A 2

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`), // log B 2
});

subject.next(3); // log A 3 B 3

// Logs
// observerA: 0
// observerA: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3