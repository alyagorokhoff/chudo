import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const base=process.argv[2];if(!base)throw Error('Usage: node tests/gifts.mjs https://origin');
const api=async(path,method='GET',receipt,body)=>{const r=await fetch(base+path,{method,headers:{...(receipt?{'X-Receipt':receipt}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')}};
const created=await api('/api/gifts','POST');assert.equal(created.status,201);assert.match(created.data.token,/^[a-f0-9]{64}$/);const p='/api/gifts/'+created.data.token;
for(let i=0;i<2;i++){const page=await fetch(created.data.url);assert.equal(page.status,200);const html=await page.text();assert.ok(html.includes('og:title'));assert.ok(html.includes('/og.png'));assert.ok(html.includes('state-gift'));assert.ok(!html.includes('state-loading'));assert.ok(html.includes('entry-preparing'));assert.equal((await api(p)).data.status,'new')}
console.log('PASS: GET and messenger previews never claim a gift; SSR Open Graph present');
const receipts=[randomBytes(32).toString('hex'),randomBytes(32).toString('hex')];
const race=await Promise.all(receipts.map(r=>api(p,'POST',r)));assert.equal(race.filter(r=>r.data.status==='owned').length,1);assert.equal(race.filter(r=>r.data.status==='claimed').length,1);const winner=race.findIndex(r=>r.data.status==='owned');const prediction=race[winner].data.prediction;assert.ok(prediction);
console.log('PASS: concurrent devices have exactly one winner');
const receiptCookie=race[winner].cookie;assert.ok(receiptCookie?.includes('HttpOnly'));const ownerPage=await fetch(created.data.url,{headers:{Cookie:receiptCookie.split(';')[0]}});const ownerHtml=await ownerPage.text();assert.ok(ownerHtml.includes('state-fortune'));assert.ok(!ownerHtml.includes('state-loading'));assert.ok(ownerHtml.includes(prediction));
const strangerHtml=await (await fetch(created.data.url)).text();assert.ok(!strangerHtml.includes(prediction));
console.log('PASS: fresh gift and private owned result render correct initial view; another browser cannot read prediction');
for(let i=0;i<3;i++){assert.deepEqual((await api(p,'POST',receipts[winner])).data,{status:'owned',prediction});assert.deepEqual((await api(p,'GET',receipts[winner])).data,{status:'owned',prediction})}
assert.equal((await api(p)).data.status,'claimed');assert.equal((await api(p,'POST',randomBytes(32).toString('hex'))).data.status,'claimed');
console.log('PASS: receipt restores identical result; retries cannot reroll; new browser is blocked');
assert.equal((await api(p,'POST','bad')).status,400);assert.equal((await api('/api/gifts/'+'0'.repeat(64))).status,404);
console.log('PASS: invalid receipt and missing gift rejected');
const next=await api('/api/gifts','POST');assert.notEqual(next.data.token,created.data.token);assert.equal((await api('/api/gifts/'+next.data.token)).data.status,'new');assert.equal((await api(p,'GET',receipts[winner])).data.prediction,prediction);
console.log('PASS: gifting creates independent fresh link; previous result persists');
for(const asset of ['/cookie.png','/gift.png','/world.webp','/og.png','/fonts/cormorant-garamond-400.ttf']){const r=await fetch(base+asset);assert.equal(r.status,200);assert.ok((await r.arrayBuffer()).byteLength>1000)}
console.log('PASS: all production assets and exact self-hosted font available');
console.log('All integration checks passed');
