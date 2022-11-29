import { toArray, map, of, last, mergeMap, Subject } from 'rxjs';


// of({ id: 1 }, { id: 3 }, { id: 2 }, { id: 2 })


const subject$ = new Subject();
const source$ = subject$.pipe(
  toArray(),
  map((arr) => {
    const lastId = arr.at(-1)?.id;
    return arr.filter((el) => el.id !== lastId);
  }),
  map((arr) => arr.sort((a, b) => a.prio - b.prio)),
  mergeMap(arr => arr),
  // last()
);

source$.subscribe(x => console.log('Id: ', x.id))

subject$.next({ id: 1, prio: 1 })