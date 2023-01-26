import { subscribeToAnnouncedTitle, cases } from './entitler-scan';

test('case 1', () => {
  const spy = jest.fn();
  const unsubs = []
  unsubs.push(subscribeToAnnouncedTitle(spy));
  unsubs.push(subscribeToAnnouncedTitle(spy));

  cases['1']();

  // Wait for the delayCall in case 1 to complete
  setTimeout(() => {
    expect(spy.mock.calls).toEqual([
      ['page'],
      ['page'],
      ['--cleanup'],
      ['--cleanup'],
    ]);
    unsubs.forEach(unsub => unsub())
  }, 1500);
});

test('case 3.2', () => {
  const spy = jest.fn();
  const unsubs = []
  unsubs.push(subscribeToAnnouncedTitle(spy));
  unsubs.push(subscribeToAnnouncedTitle(spy));

  cases['3.2']();

  // Wait for the delayCall in case 1 to complete
  setTimeout(() => {
    expect(spy.mock.calls).toEqual([
      ['page'],
      ['page'],
      ['--cleanup'],
      ['--cleanup'],
      ['--disabled-no-title'],
      ['--disabled-no-title'],
      ['--repeated'],
      ['--repeated'],
      ['--cleanup'],
      ['--cleanup'],
    ]);
    unsubs.forEach(unsub => unsub())
  }, 1500);
});