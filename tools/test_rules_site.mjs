// Security-rule tests for site/settings and consults, run against the Firestore emulator.
//   npx firebase-tools emulators:start --only firestore   (rules = firestore.rules)
//   node tools/test_rules_site.mjs
const BASE = process.env.FS_EMU || 'http://127.0.0.1:8080';
const PROJECT = 'kiokuyeon';
const DOCS = `${BASE}/v1/projects/${PROJECT}/databases/(default)/documents`;
const OWNER = { Authorization: 'Bearer owner' }; // emulator admin bypass (setup only)

const str = (v) => ({ stringValue: v });
function consultFields(over = {}) {
  const f = {
    nickname: str('Yuki'), region: str('東京都'), age: str('30s'), method: str('email'),
    contact: str('yuki@example.com'), body: str('相談したいです'), consent: { booleanValue: true },
    lang: str('ja'), status: str('new'),
  };
  return Object.assign(f, over);
}
// Unauthenticated create with createdAt = request time (same call shape as site.js).
async function createConsult(fields) {
  const id = 'c' + Math.random().toString(36).slice(2, 10);
  const name = `projects/${PROJECT}/databases/(default)/documents/consults/${id}`;
  const r = await fetch(`${DOCS}:commit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes: [{
      update: { name, fields }, currentDocument: { exists: false },
      updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
    }] }),
  });
  return { ok: r.ok, id };
}

const results = [];
async function check(name, fn) {
  try { const pass = await fn(); results.push([pass ? 'PASS' : 'FAIL', name]); }
  catch (e) { results.push(['FAIL', name + ' (' + e.message + ')']); }
}

await fetch(`${DOCS}/site/settings`, { method: 'PATCH', headers: { ...OWNER, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: { lineUrl: str('https://line.me/x') } }) });

let firstId = null;
await check('anonymous valid consult is accepted', async () => { const r = await createConsult(consultFields()); firstId = r.id; return r.ok; });
await check('body over 2000 chars is rejected', async () => !(await createConsult(consultFields({ body: str('あ'.repeat(2001)) }))).ok);
await check('extra field is rejected', async () => !(await createConsult(consultFields({ x: str('1') }))).ok);
await check("status other than 'new' is rejected", async () => !(await createConsult(consultFields({ status: str('done') }))).ok);
await check('consent false is rejected', async () => !(await createConsult(consultFields({ consent: { booleanValue: false } }))).ok);
await check('anonymous cannot read consults', async () => !(await fetch(`${DOCS}/consults/${firstId}`)).ok);
await check('anonymous can read site/settings', async () => (await fetch(`${DOCS}/site/settings`)).ok);
await check('anonymous cannot write site/settings', async () => !(await fetch(`${DOCS}/site/settings`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { lineUrl: str('https://evil') } }) })).ok);

for (const [s, n] of results) console.log(s, n);
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
