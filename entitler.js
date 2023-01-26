import { BehaviorSubject, map, distinctUntilChanged, debounce, timer, merge, debounceTime, delay, tap } from 'rxjs';

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

let pipelineRunCount = 0

function addAnnouncedId(id) {
  if (id) {
    announcedIds.add(id)
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
  const announcedTitle$ = documentEntitlerItems$.pipe(
    map((state) => {
      return state.sort(sortByPriority)[0]
    }),
    distinctUntilChanged(),
    debounce(() => timer(TITLE_DEBOUNCE_TIME)),
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
    }),
    tap(() => {
      pipelineRunCount++
      console.log('pipelineRunCount', pipelineRunCount);
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