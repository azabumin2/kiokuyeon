// Security-rule tests: ordinary members can see only their own data; only staff can see other members.
//   npx firebase-tools emulators:start --only firestore   (rules = firestore.rules)
//   node tools/test_rules_members.mjs
const BASE = process.env.FS_EMU || 'http://127.0.0.1:8080';
const PROJECT = 'kiokuyeon';
const DOCS = `${BASE}/v1/projects/${PROJECT}/databases/(default)/documents`;
const OWNER = { Authorization: 'Bearer owner' }; // emulator admin bypass (setup only)

// The emulator accepts unsigned ID tokens, so we can act as any signed-in user.
function token(uid, email) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  return 'Bearer ' + b64({ alg: 'none', typ: 'JWT' }) + '.' + b64({
    iss: `https://securetoken.google.com/${PROJECT}`, aud: PROJECT, sub: uid, user_id: uid, iat: now, exp: now + 3600, auth_time: now,
    email, email_verified: true, firebase: { sign_in_provider: 'google.com', identities: {} },
  }) + '.';
}
const FEMALE = token('uF', 'f@example.com'), MALE = token('uM', 'm@example.com'), ADMIN = token('uA', 'a@example.com');

const str = (v) => ({ stringValue: v });
async function put(path, fields) {
  const r = await fetch(`${DOCS}/${path}`, { method: 'PATCH', headers: { ...OWNER, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) });
  if (!r.ok) throw new Error('setup ' + path + ' ' + r.status);
}
const get = (path, auth) => fetch(`${DOCS}/${path}`, { headers: auth ? { Authorization: auth } : {} }).then((r) => r.status);
const list = (coll, auth) => fetch(`${DOCS}/${coll}`, { headers: auth ? { Authorization: auth } : {} }).then((r) => r.status);
const query = (coll, field, value, auth) => fetch(`${DOCS}:runQuery`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
  body: JSON.stringify({ structuredQuery: { from: [{ collectionId: coll }], where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: str(value) } } } }),
}).then((r) => r.status);

const results = [];
async function check(name, fn) {
  try { const pass = await fn(); results.push([pass ? 'PASS' : 'FAIL', name]); }
  catch (e) { results.push(['FAIL', name + ' (' + e.message + ')']); }
}
const denied = (s) => s === 403;
const allowed = (s) => s === 200;

await put('admins/uA', { name: str('staff') });
await put('applications/uF', { gender: str('female'), status: str('submitted'), profile: { mapValue: { fields: { name: str('花子') } } } });
await put('applications/uM', { gender: str('male'), status: str('submitted'), profile: { mapValue: { fields: { name: str('철수') } } } });
await put('photos/uF', { data: str('x') });
await put('photos/uM', { data: str('y') });
await put('members/mF', { gender: str('female'), profile: { mapValue: { fields: { name: str('花子') } } } });
await put('members/mM', { gender: str('male'), profile: { mapValue: { fields: { name: str('철수') } } } });

// Female member
await check('female member: reads own application', async () => allowed(await get('applications/uF', FEMALE)));
await check('female member: cannot read a male application', async () => denied(await get('applications/uM', FEMALE)));
await check('female member: cannot read a male photo', async () => denied(await get('photos/uM', FEMALE)));
await check('female member: cannot read a male member record', async () => denied(await get('members/mM', FEMALE)));
await check('female member: cannot list members', async () => denied(await list('members', FEMALE)));
await check('female member: cannot search male members', async () => denied(await query('members', 'gender', 'male', FEMALE)));
await check('female member: cannot search male applications', async () => denied(await query('applications', 'gender', 'male', FEMALE)));
// Male member
await check('male member: reads own application', async () => allowed(await get('applications/uM', MALE)));
await check('male member: cannot read a female application', async () => denied(await get('applications/uF', MALE)));
await check('male member: cannot read a female photo', async () => denied(await get('photos/uF', MALE)));
await check('male member: cannot read a female member record', async () => denied(await get('members/mF', MALE)));
await check('male member: cannot list members', async () => denied(await list('members', MALE)));
await check('male member: cannot search female members', async () => denied(await query('members', 'gender', 'female', MALE)));
await check('male member: cannot search female applications', async () => denied(await query('applications', 'gender', 'female', MALE)));
// Not signed in
await check('signed out: cannot read members', async () => denied(await list('members')));
// Staff
await check('staff: reads female and male members', async () => allowed(await get('members/mF', ADMIN)) && allowed(await get('members/mM', ADMIN)));
await check('staff: searches male members', async () => allowed(await query('members', 'gender', 'male', ADMIN)));
await check('staff: reads any application and photo', async () => allowed(await get('applications/uM', ADMIN)) && allowed(await get('photos/uF', ADMIN)));

for (const [r, n] of results) console.log(r, n);
const failed = results.filter(([r]) => r === 'FAIL').length;
console.log(failed ? `${failed} FAILED` : `all ${results.length} passed`);
process.exit(failed ? 1 : 0);
