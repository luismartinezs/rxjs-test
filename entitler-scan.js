import { BehaviorSubject, map, distinctUntilChanged, debounce, timer, merge, debounceTime, scan, tap } from 'rxjs';

let elapsedTime = 0;

function delayCall(callback, wait) {
  elapsedTime += wait
  setTimeout(callback, elapsedTime)
}


const TITLE_DEBOUNCE_TIME = 100
const TITLE_LIVE_REGION_TIMEOUT = 1e3

const documentEntitlerItems$ = new BehaviorSubject([])


function addEntitler(item) {
  return documentEntitlerItems$.next([...documentEntitlerItems$.getValue(), item])
}

function removeEntitler(id) {
  documentEntitlerItems$.next(documentEntitlerItems$.getValue().filter((item) => item.id !== id))
}

function sortByPriority(a, b) {
  return b.priority <= a.priority ? -1 : 1
}

function emitAfterTimeout(source$, timeout, value) {
  return source$.pipe(
    debounceTime(timeout),
    map(() => value)
  )
}

function handleHistory(history, item) {
  if (!item) {
    return history
  }
  const { disableAnnounceTitle, title, id } = item
  const isIdInHistory = history.find((el) => el.id === id)

  if (title) {
    if (disableAnnounceTitle) {
      return [{ ...item, title: '--title-disabled' }]
    }
    if (isIdInHistory) {
      return [{ ...item, title: '--title-repeated' }]
    }
    return [item]
  }
  if (disableAnnounceTitle) {
    return [...history, { ...item, title: '--no-title-disabled' }]
  }
  return history
}

export function subscribeToAnnouncedTitle(callback) {
  const announcedTitle$ = documentEntitlerItems$.pipe(
    map((state) => {
      return state.sort(sortByPriority)[0]
    }),
    distinctUntilChanged((a, b) => a && b && a.id === b.id),
    debounce(() => timer(TITLE_DEBOUNCE_TIME)),
    scan(handleHistory, []),
    map((data) => data.length > 0 ? data.at(-1).title : '--empty'),
  )

  const sub = announcedTitle$
  merge(announcedTitle$, emitAfterTimeout(announcedTitle$, TITLE_LIVE_REGION_TIMEOUT, '--cleanup'))
    .subscribe(callback)

  return () => sub.unsubscribe()
}

export const cases = {
  '1': () => {
    setTimeout(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
  },
  '2.1': () => {
    setTimeout(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
    setTimeout(() => addEntitler({ id: 2, title: 'modal', priority: 1, disableAnnounceTitle: true }), 0)
    setTimeout(() => removeEntitler(2), 2e3)
  },
  '2.2': () => {
    setTimeout(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
    setTimeout(() => addEntitler({ id: 2, title: '', priority: 1, disableAnnounceTitle: true }), 0)
    setTimeout(() => removeEntitler(2), 2e3)
  },
  '3.1': () => {
    setTimeout(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
    setTimeout(() => addEntitler({ id: 2, title: 'modal', priority: 1, disableAnnounceTitle: true }), 1.5e3)
    setTimeout(() => removeEntitler(2), 2e3)
  },
  '3.2': () => {
    setTimeout(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
    setTimeout(() => addEntitler({ id: 2, title: '', priority: 1, disableAnnounceTitle: true }), 1.5e3)
    setTimeout(() => removeEntitler(2), 2e3)
  },
  '4.1': () => {
    delayCall(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
    delayCall(() => addEntitler({ id: 2, title: '', priority: 1, disableAnnounceTitle: true }), 1.5e3)
    delayCall(() => removeEntitler(2), 500)
    delayCall(() => addEntitler({ id: 3, title: 'modal', priority: 1, disableAnnounceTitle: true }), 1e3)
    delayCall(() => removeEntitler(3), 500)
  },
  '5.1': () => {
    delayCall(() => addEntitler({ id: 1, title: 'page', priority: 0, disableAnnounceTitle: false }), 0)
    delayCall(() => addEntitler({ id: 2, title: '', priority: 10, disableAnnounceTitle: true }), 110)
    delayCall(() => addEntitler({ id: 3, title: 'modal', priority: 1, disableAnnounceTitle: true }), 110)
    delayCall(() => removeEntitler(3), 200)
    delayCall(() => removeEntitler(2), 200)
  }
}

/**
case 1
expected = actual
X: page
Y: page
X: --cleanup
Y: --cleanup

case 2.1
expected = actual
X: --disabled-title
Y: --disabled-title
X: --cleanup
Y: --cleanup
X: page
Y: page
X: --cleanup
Y: --cleanup

case 2.2
expected = actual
X: --disabled-no-title
Y: --disabled-no-title
X: --cleanup
Y: --cleanup
X: page
Y: page
X: --cleanup
Y: --cleanup

case 3.1
expected = actual
X: page
Y: page
X: --cleanup
Y: --cleanup
X: --disabled-title
Y: --disabled-title
X: page
Y: page
X: --cleanup
Y: --cleanup

case 3.2
expected:
X: page
Y: page
X: --cleanup
Y: --cleanup
X: --disabled-no-title
Y: --disabled-no-title
X: --repeated
Y: --repeated
X: --cleanup
Y: --cleanup

actual:
X: page
Y: page
X: --cleanup
Y: --cleanup
X: --disabled-no-title
Y: --disabled-no-title
X: page
Y: page
Y: --cleanup
X: --cleanup
*/

function parseValue(val) {
  if (typeof val === 'string') {
    return val
  }
  return JSON.stringify(val)
}

const FakeComponent = (label) => {
  subscribeToAnnouncedTitle(val => console.log(`${label}: ${parseValue(val)}`))
}

// FakeComponent('X')
// FakeComponent('Y')

// cases['1']()
// cases['2.1']()
// cases['2.2']()
// cases['3.1']()
// cases['5.1']()

