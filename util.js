export const emit = (obs$, value, timeout) => {
  setTimeout(() => {
    obs$.next(value);
  }, timeout);
}

export const delayCall = (fn, timeout) => {
  setTimeout(fn, timeout);
}