import assert from 'node:assert/strict';
import { recentUpdates } from './welcome';
import { CHANGELOG } from './changelog';
import { APP_VERSION } from './config';

const log = [
  { version: 'v3', title: 'Three', changes: ['One thing', 'Another thing', 'Updated the application version to v3.'] },
  { version: 'v2', title: 'Two', changes: ['x'] },
  { version: 'v1', changes: ['y'] },
];
const updates = recentUpdates(log, 1)!;
assert.equal(updates.version, 'v3');
assert.equal(updates.title, 'Three');
assert.deepEqual(updates.changes, ['One thing', 'Another thing'], 'the line that only says the version changed is left out');
assert.deepEqual(updates.earlier, [{ version: 'v2', title: 'Two' }], 'as many earlier versions as asked');
assert.deepEqual(recentUpdates(log)!.earlier.map(item => item.title), ['Two', ''], 'a version without a title has an empty one');
assert.equal(recentUpdates([]), null);

// The real changelog: the newest entry is the version of the app, and it has something to say besides its version.
const real = recentUpdates(CHANGELOG)!;
assert.equal(real.version, APP_VERSION, 'the newest entry of the changelog is the running version');
assert.ok(real.changes.length > 0 && real.title.length > 0);
console.log('Welcome tests passed');
