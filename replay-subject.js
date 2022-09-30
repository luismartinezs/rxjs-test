import { ReplaySubject } from 'rxjs';
// Similar to BehaviorSubject
const subject = new ReplaySubject(100 /* Number of recorded values */, 500 /* how old the recorded values can be */);

const observers = [subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
})]

let i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => {
  observers.push(subject.subscribe({
    next: (v) => console.log(`observerB: ${v}`),
  }))
}, 1000);

setTimeout(() => {
  observers.forEach(observer => observer.unsubscribe());
}, 2000)