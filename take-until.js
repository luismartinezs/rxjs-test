import { interval, takeUntil, timer } from 'rxjs';

// This could be any observable stream
const source = interval(1000);

const result = source.pipe(
  takeUntil(timer(3000))
);

result.subscribe(console.log);