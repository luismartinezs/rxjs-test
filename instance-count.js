import { BehaviorSubject } from 'rxjs';

const sub$ = new BehaviorSubject(0);

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

function subComp(cb) {
  sub$.subscribe({ next: cb });
}

subComp((v) => console.log(`subComp: ${v}`));
obsComp()
obsComp()
obsComp()
obsComp()
obsComp(3_000)
