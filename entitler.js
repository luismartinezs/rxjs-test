import { BehaviorSubject, map, distinctUntilChanged, debounce, timer, merge, debounceTime, delay } from 'rxjs';

import { delayCall } from './util.js';

export const PRIORITY_SORT_MAP = Object.freeze({
  page: 0,
  modal: 1,
  stackedModal: 2, // for a modal stacked on top of another modal
  topModal: 3, // modal that shows on top of any other modal
  max: 10,
})

const TITLE_DEBOUNCE_TIME = 100
const TITLE_LIVE_REGION_TIMEOUT = 1e3
const EMPTY = 'empty'

const documentEntitlerItems$ = new BehaviorSubject([])

const announcedIds = new Set()

function addAnnouncedId(id) {
  if (id) {
    announcedIds.add(id)
  }
}

function removeAnnouncedId(id) {
  if (id) {
    announcedIds.delete(id)
  }
}

function wasIdAnnounced(id) {
  if (id) {
    return announcedIds.has(id)
  }
}

function clearAnnouncedIds() {
  announcedIds.clear()
}


function addEntitler(item) {
  return documentEntitlerItems$.next([...documentEntitlerItems$.getValue(), item])
}

function removeEntitler(id) {
  documentEntitlerItems$.next(documentEntitlerItems$.getValue().filter((item) => item.id !== id))
}

function pipeDocumentEntitlerItems(
  mappingFn,
  debounceTime
) {
  return documentEntitlerItems$.pipe(
    map(mappingFn),
    distinctUntilChanged(),
    debounce(() => timer(debounceTime))
  )
}

function sortByPriority(a, b) {
  return PRIORITY_SORT_MAP[b.priority] <= PRIORITY_SORT_MAP[a.priority] ? -1 : 1
}

function emitAfterTimeout(source$, timeout, value) {
  return source$.pipe(
    debounceTime(timeout),
    map(() => value)
  )
}


function subscribeToAnnouncedTitle(callback) {
  const debouncedAnnouncedTitleItem$ = pipeDocumentEntitlerItems((state) => {
    return state.sort(sortByPriority)[0]
  }, TITLE_DEBOUNCE_TIME)

  const announcedTitle$ = debouncedAnnouncedTitleItem$.pipe(
    map((item) => {
      if (!item) {
        return EMPTY
      }
      if (item.disableAnnounceTitle) {
        if (item.title) {
          clearAnnouncedIds()
        }
        return EMPTY
      }
      if (!item.title) {
        return EMPTY
      }
      if (!wasIdAnnounced(item.id)) {
        clearAnnouncedIds()
        addAnnouncedId(item.id)
        return item.title
      } else {
        return EMPTY
      }
    })
  )

  const sub = merge(announcedTitle$, emitAfterTimeout(announcedTitle$, TITLE_LIVE_REGION_TIMEOUT, EMPTY))
    .subscribe(callback)

  return () => sub.unsubscribe()
}

const FakeComponent = (label) => {
  subscribeToAnnouncedTitle(val => console.log(`${label}: ${val}`))
}

delayCall(() => addEntitler({ id: 1, title: 'a', priority: 'page', disableAnnounceTitle: false }), 50)
delayCall(() => addEntitler({ id: 2, title: 'b', priority: 'modal', disableAnnounceTitle: true }), 80)
delayCall(() => removeEntitler(2), 1190)
delayCall(() => removeEntitler(1), 1300)

FakeComponent('one')
// FakeComponent()
delayCall(() => FakeComponent('two'), 300)