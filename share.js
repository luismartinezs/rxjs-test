import { interval, tap, map, take, share, timer } from 'rxjs';

const source = interval(1000).pipe(
  tap(x => console.log('Processing: ', x)), // side effect, will log only once every second, regardless of number of subscribers
  map(x => x * x),
  take(6), // take first 6 values only
  share({ // run this chain once and share results with all subscribers
    resetOnRefCountZero: () => timer(1000) // after all subscribers unsubscribe, wait 1 second before resetting
  })
);

const subscriptions = [
  source.subscribe(x => console.log('subscription 1: ', x)),
  source.subscribe(x => console.log('subscription 2: ', x))
]

setTimeout(() => {
  subscriptions[0].unsubscribe();
}, 3000)


setTimeout(() => {
  subscriptions[1].unsubscribe();
}, 5000)