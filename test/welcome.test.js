// The welcome mail in the visitor's language, one language per mail (Sophie 2026-11-13). node --test test/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mailLang, welcomeMail, TEXT } = require('../welcome');
const { makeSubscribe, FROM } = require('../subscribe');

test('language: ko, ja and their regions; anything else or nothing is English', () => {
  for (const [v, want] of [['ko', 'ko'], ['ko-KR', 'ko'], ['KO', 'ko'], ['ja', 'ja'], ['ja-JP', 'ja'], ['en', 'en'], ['en-US', 'en'],
    ['fr', 'en'], ['zh-CN', 'en'], ['', 'en'], [undefined, 'en'], [null, 'en'], [42, 'en'], [{}, 'en'], ['<script>', 'en']]) {
    assert.equal(mailLang(v), want, String(v));
  }
});

test('subjects as Sophie gave them', () => {
  assert.equal(welcomeMail('en').subject, 'Welcome to the Silence');
  assert.equal(welcomeMail('ko').subject, '침묵 속으로 오신 것을 환영합니다');
  assert.equal(welcomeMail('ja').subject, '静けさへようこそ');
});

test('one language per mail: no other language\'s words in it', () => {
  const words = { en: 'You are one of the very first to find us.', ko: '당신은 저희를 가장 먼저 발견한 분들 중 한 명입니다.', ja: 'あなたは、私たちを最初に見つけてくださった方のおひとりです。' };
  for (const lang of ['en', 'ko', 'ja']) {
    const { html } = welcomeMail(lang);
    for (const other of Object.keys(words)) {
      if (other === lang) assert.ok(html.includes(words[other]), lang + ' has its own words');
      else assert.ok(!html.includes(words[other]), lang + ' has no ' + other);
    }
    assert.ok(!/[가-힣]/.test(html) || lang === 'ko', lang + ': Korean letters only in the Korean mail');
    assert.ok(!/[぀-ヿ]/.test(html) || lang === 'ja', lang + ': kana only in the Japanese mail');
    assert.match(html, new RegExp(`<html lang="${lang}" dir="ltr">`));
  }
});

test('every sentence Sophie gave is in its mail, whole', () => {
  for (const lang of ['en', 'ko', 'ja']) {
    const { html } = welcomeMail(lang);
    const t = TEXT[lang];
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    for (const s of [...t.paragraphs, ...t.quote, ...t.after, t.signature]) assert.ok(html.includes(esc(s)), lang + ': ' + s);
  }
});

test('the same look in all three: logo, quote box, amber signature, bottom line, and its own serif fonts', () => {
  for (const lang of ['en', 'ko', 'ja']) {
    const { html } = welcomeMail(lang);
    assert.ok(html.includes('https://www.attenua.io/attenua_logo.png'), lang + ' logo');
    assert.ok(html.includes('border-left:2px solid #c8873a;padding:16px 20px;background-color:#1c1814;'), lang + ' quote box');
    assert.equal((html.match(/font-style:italic/g) || []).length, 3, lang + ' three quote lines');
    assert.ok(/color:#c8873a;font-size:13px;letter-spacing:0\.05em;text-align:left;">— ATTENUA · /.test(html), lang + ' amber signature');
    assert.ok(html.includes('attenua.io · Seoul · The signal never stopped.'), lang + ' bottom line');
    assert.ok(html.includes('<meta charset="UTF-8">'), lang + ' UTF-8');
  }
  assert.match(welcomeMail('ko').html, /font-family:'Noto Serif KR'[^;]*Batang[^;]*serif;/);
  assert.match(welcomeMail('ja').html, /font-family:'Noto Serif JP'[^;]*Mincho[^;]*serif;/);
  assert.match(welcomeMail('en').html, /font-family:Georgia,'Times New Roman',serif;/);
});

test('the site rule: no Ollie name anywhere in the mail or the site files touched', () => {
  const texts = fs.readdirSync(path.join(__dirname, '..', 'welcome-texts')).map((f) => 'welcome-texts/' + f);
  const files = ['welcome.js', 'subscribe.js', 'server.js', 'languages.js', 'tools/send_test_mails.js', ...texts].map((f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  for (const s of [...files, ...['en', 'ko', 'ja'].map((l) => welcomeMail(l).html)]) assert.ok(!/ollie|올리|オリー/i.test(s));
});

test('the page sends its screen language with the email', () => {
  const page = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(page, /JSON\.stringify\(\{ email, lang: document\.documentElement\.lang \}\)/);
  assert.match(page, /document\.documentElement\.lang = lang;/, 'setLang sets it, the same choice as the screen');
});

function harness({ contactOk = true } = {}) {
  const calls = [];
  const fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url, body, auth: init.headers.Authorization });
    const ok = url.endsWith('/contacts') && body.properties ? contactOk : true;
    return { ok, status: ok ? 200 : 422, json: async () => ({}) };
  };
  const quiet = { log() {}, error() {} };
  const handle = makeSubscribe({ fetch, apiKey: 're_test', log: quiet });
  const run = async (body) => {
    const res = { code: 200, out: null, status(c) { this.code = c; return this; }, json(o) { this.out = o; return this; } };
    await handle({ body }, res);
    return res;
  };
  return { calls, run };
}

test('signup: the contact keeps its language and one mail goes in it', async () => {
  for (const [lang, want, subject] of [['ko', 'ko', '침묵 속으로 오신 것을 환영합니다'], ['ja-JP', 'ja', '静けさへようこそ'], ['fr', 'en', 'Welcome to the Silence'], [undefined, 'en', 'Welcome to the Silence']]) {
    const h = harness();
    const res = await h.run({ email: 'a@example.com', lang });
    assert.equal(res.code, 200);
    assert.deepEqual(h.calls.map((c) => c.url), ['https://api.resend.com/contacts', 'https://api.resend.com/emails']);
    assert.deepEqual(h.calls[0].body, { email: 'a@example.com', unsubscribed: false, properties: { lang: want } });
    assert.equal(h.calls[1].body.from, FROM);
    assert.equal(FROM, 'Hello <hello@attenua.io>', 'the sender as before');
    assert.deepEqual(h.calls[1].body.to, ['a@example.com']);
    assert.equal(h.calls[1].body.subject, subject);
    assert.match(h.calls[1].body.html, new RegExp(`<html lang="${want}" dir="ltr">`));
  }
});

test('signup: if Resend refuses the language, the contact is kept without it and the mail still goes', async () => {
  const h = harness({ contactOk: false });
  const res = await h.run({ email: 'b@example.com', lang: 'ko' });
  assert.equal(res.code, 200);
  assert.deepEqual(h.calls.map((c) => [c.url.split('/').pop(), !!c.body.properties]), [['contacts', true], ['contacts', false], ['emails', false]]);
  assert.equal(h.calls[2].body.subject, '침묵 속으로 오신 것을 환영합니다');
});

// --- one language list for the screen and the mail (Sophie 2026-11-13: nine more languages later) ---
const vm = require('node:vm');
const { LANGUAGES, pick, DEFAULT } = require('../languages');
const { LANGS, FIELDS, renderMail } = require('../welcome');
const page = () => fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const screenCodes = () => {
  const src = page();
  const start = src.indexOf('const i18n = {');
  const i18n = src.slice(start, src.indexOf('\n};', start));
  return [...i18n.matchAll(/^ {2}'?([a-zA-Z-]+)'?: \{/gm)].map((m) => m[1]);
};

test('one list: languages.js, the screen words and the mail words name the same languages, in the same order', () => {
  const list = LANGUAGES.map((l) => l.code);
  assert.deepEqual(list, ['en', 'ko', 'ja'], 'three languages for now');
  assert.deepEqual(screenCodes(), list, 'index.html i18n has screen words for exactly these');
  assert.deepEqual([...LANGS], list, 'welcome-texts has mail words for exactly these');
  const files = fs.readdirSync(path.join(__dirname, '..', 'welcome-texts')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
  assert.deepEqual(files, [...list].sort(), 'no words file without a line in languages.js');
  for (const l of LANGUAGES) {
    assert.ok(l.name && typeof l.name === 'string', l.code + ' name');
    assert.ok(l.dir === 'ltr' || l.dir === 'rtl', l.code + ' dir');
  }
  assert.equal(DEFAULT, 'en');
});

test('each words file has every part, as words', () => {
  for (const code of LANGS) {
    const t = TEXT[code];
    assert.deepEqual(Object.keys(t).sort(), [...FIELDS].sort(), code);
    for (const k of ['subject', 'font', 'lineHeight', 'signature']) assert.ok(typeof t[k] === 'string' && t[k].trim(), code + ' ' + k);
    for (const k of ['paragraphs', 'quote', 'after']) assert.ok(Array.isArray(t[k]) && t[k].length && t[k].every((s) => typeof s === 'string' && s.trim()), code + ' ' + k);
    assert.equal(t.quote.length, 3, code + ' three quote lines');
  }
});

test('the screen uses the list: menu, matching rule and writing direction from languages.js; it still works without it', () => {
  const src = page();
  assert.match(src, /<script src="\/languages\.js"><\/script>\s*<script>/);
  assert.ok(src.indexOf('src="/languages.js"') < src.indexOf('const i18n = {'), 'loaded before the screen script');
  assert.ok(src.includes('const SITE_CODES = LANGS ? LANGS.LANGUAGES.map(l => l.code).filter(c => i18n[c]) : Object.keys(i18n);'));
  assert.ok(src.includes('LANGS.pick(p, SITE_CODES)'));
  assert.ok(src.includes('document.documentElement.dir = langInfo(lang).dir;'));
  assert.ok(!/langName/.test(src), 'menu names only in languages.js');
});

test('languages.js runs in the browser too (window.ATTENUA_LANGS) and matches like the mail', () => {
  const win = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'languages.js'), 'utf8'), win);
  const L = win.ATTENUA_LANGS;
  assert.ok(L, 'defines ATTENUA_LANGS');
  // compared as text: arrays made inside the separate context have that context's own Array
  assert.equal(JSON.stringify(L.LANGUAGES), JSON.stringify(LANGUAGES));
  for (const [tag, want] of [['ko-KR', 'ko'], ['ja', 'ja'], ['en-GB', 'en'], ['pt-BR', null], ['', null], [7, null]]) {
    assert.equal(L.pick(tag), want, String(tag));
    assert.equal(pick(tag), want, String(tag));
  }
  // a later region language: the whole tag first, then the main part
  assert.equal(pick('pt-BR', ['pt-BR', 'en']), 'pt-BR');
  assert.equal(pick('pt-PT', ['pt-BR', 'pt', 'en']), 'pt');
  assert.equal(pick('zh_CN', ['zh', 'en']), 'zh');
});

test('room for right to left (Arabic later): the mail turns around by dir, the bottom line stays left to right', () => {
  const rtl = renderMail({ ...TEXT.en, subject: 'x' }, 'ar', 'rtl');
  assert.match(rtl, /<html lang="ar" dir="rtl">/);
  assert.match(rtl, /<body dir="rtl"/);
  assert.ok(rtl.includes('border-right:2px solid #c8873a'), 'the quote line on the right');
  assert.ok(!rtl.includes('border-left:2px'), 'not on the left');
  assert.ok(!/text-align:left/.test(rtl), 'text from the right');
  assert.match(rtl, /<td dir="ltr" style="padding:20px 40px;/, 'the English bottom line stays left to right');
  const ltr = welcomeMail('ko').html;
  assert.match(ltr, /<html lang="ko" dir="ltr">/);
  assert.ok(ltr.includes('border-left:2px solid #c8873a') && !ltr.includes('border-right:2px'));
});

test('signup: a wrong email is refused before anything is sent', async () => {
  for (const email of [undefined, '', 'no-at', 42]) {
    const h = harness();
    const res = await h.run({ email, lang: 'ko' });
    assert.equal(res.code, 400);
    assert.equal(h.calls.length, 0);
  }
});
