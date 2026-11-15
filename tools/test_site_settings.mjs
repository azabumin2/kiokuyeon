// Unit tests for assets/site-settings.js (YouTube ID parsing, days until a date).
//   node tools/test_site_settings.mjs
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../assets/site-settings.js', import.meta.url), 'utf8');
const win = {};
new Function('window', src)(win);
const { parseYouTubeId, daysUntil } = win.KS;

const results = [];
const eq = (name, got, want) => results.push([got === want ? 'PASS' : 'FAIL', `${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`]);

const ID = 'dQw4w9WgXcQ';
eq('watch?v=', parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), ID);
eq('youtu.be with t', parseYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=3'), ID);
eq('shorts', parseYouTubeId('https://youtube.com/shorts/dQw4w9WgXcQ'), ID);
eq('embed', parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'), ID);
eq('mobile m.youtube', parseYouTubeId('https://m.youtube.com/watch?v=dQw4w9WgXcQ&list=x'), ID);
eq('bare id', parseYouTubeId('dQw4w9WgXcQ'), ID);
eq('plain word', parseYouTubeId('hello'), null);
eq('other host', parseYouTubeId('https://evil.com/watch?v=dQw4w9WgXcQ'), null);
eq('empty', parseYouTubeId(''), null);
eq('60 days before', daysUntil('2027-08-25', new Date('2027-06-26T00:00:00+09:00')), 60);
eq('same day', daysUntil('2027-08-25', new Date('2027-08-25T23:00:00+09:00')), 0);
eq('past date negative', daysUntil('2026-11-14', new Date('2026-11-15T10:00:00+09:00')), -1);
eq('bad date', daysUntil('soon', new Date()), null);

for (const [s, n] of results) console.log(s, n);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
