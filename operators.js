import { of, map, first } from 'rxjs';

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