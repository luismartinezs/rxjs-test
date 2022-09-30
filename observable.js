import { Observable } from 'rxjs';
// observable is like a mix of promise and iterator (a promise with a next() method, that can return multiple values)
// observable (producer) "pushes" data to the subscriber (consumer)

const observable = new Observable((subscriber) => {
  // push 1 2 3 synchronously
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  setTimeout(() => {
    // push 4 asynchronously
    subscriber.next(4);
    subscriber.complete();
  }, 1000);
});

const observer = {
  next(x) {
    console.log('got value ' + x);
  },
  error(err) {
    console.error('something wrong occurred: ' + err);
  },
  complete() {
    console.log('done');
  },
}

// to invoke the observable and see the values, we need to subscribe to it
console.log('just before subscribe');
observable.subscribe(observer);
console.log('just after subscribe');

/**
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
 */