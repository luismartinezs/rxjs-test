import { of, map, first, interval, concatAll } from 'rxjs';

// analogous to [1,2,3].map(x => x * x)
of(1, 2, 3)
  .pipe(map((x) => x * x))
  .subscribe((v) => console.log(`value: ${v}`));

of(1, 2, 3)
  .pipe(first())
  .subscribe((v) => console.log(`value: ${v}`));

// piping
of(1, 2, 3)
  .pipe(map(x => x + 1), map(x => x + 1), map(x => x + 1))
  .subscribe(x => console.log(x));

// const observable = interval(1000)

// observable.subscribe({ next: (x) => console.log(x) }) // infinite observer

console.log('higher order observables');

of(1, 2, 3)
  .pipe(
    map(x => of(x, 2 * x, 3 * x)), // observable of observables
    concatAll() // "flattens" observables
  )
  .subscribe(x => console.log(x))