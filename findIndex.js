import { findIndex, of } from 'rxjs';

const sub$ = of(1, 2, 3);
const source$ = sub$.pipe(findIndex(x => x === 1))

source$.subscribe(x => console.log(x))