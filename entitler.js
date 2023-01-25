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


function subscribeToDocumentTitle(callback) {
  const documentTitle$ = pipeDocumentEntitlerItems(state => state.filter((item) => item.title).sort(sortByPriority)[0], TITLE_DEBOUNCE_TIME)
  const sub = documentTitle$.subscribe(callback)

  return () => sub.unsubscribe()
}

function subscribeToAnnouncedTitle(callback) {
  const debouncedAnnouncedTitleItem$ = pipeDocumentEntitlerItems((state) => {
    return state.sort(sortByPriority)[0]
  }, TITLE_DEBOUNCE_TIME)

  const announcedTitle$ = debouncedAnnouncedTitleItem$.pipe(
    map((item) => {
      if (!item) {
        return 'empty'
      }
      // if title announce is disabled, then we do not announce it
      if (item.disableAnnounceTitle) {
        if (item.title) {
          // case where announce title is disabled, but context changes, when context changes, we clear all announced ids
          clearAnnouncedIds()
        }
        return 'empty'
      }
      // context = some document title was set, that defines one context. If doc title was not set, then the context is the same
      // e.g.
      // if modal did not set doc title, that means it didn't change whatever the context was, so we do not reset it, that also means the current item does not set any context and thus it is not necessary to add it to the context
      if (!item.title) {
        return 'empty'
      }
      // if modal (or something else) set doc title, that defines a new context
      // it's possible that the previous item did not set any context, so we need to check whether this new item was already announced or not
      // if it was not announced, then we announce it
      if (!wasIdAnnounced(item.id)) {
        clearAnnouncedIds() // clear context
        addAnnouncedId(item.id) // add the announced title to new context
        return item.title
      } else {
        // if it was already announced, then we do not announce it, it's as if nothing happened
        return 'empty'
      }
    })
  )

  const sub = merge(announcedTitle$, emitAfterTimeout(announcedTitle$, TITLE_LIVE_REGION_TIMEOUT, 'empty'))
    // .pipe(tap((val) => debug('announcedTitle', val)))
    .subscribe(callback)

  return () => sub.unsubscribe()
}

delayCall(() => addEntitler({ id: 1, title: 'a', priority: 'page', disableAnnounceTitle: false }), 50)
delayCall(() => addEntitler({ id: 2, title: 'b', priority: 'modal', disableAnnounceTitle: true }), 80)
// delayCall(() => removeEntitler(2), 1190)

subscribeToAnnouncedTitle(console.log)