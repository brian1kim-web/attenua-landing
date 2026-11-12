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

// The words Brian chose on 2026-11-13 (second version), as Sophie sent them
const SUBJECT = { en: 'Thank you for finding us first', ko: '먼저 찾아와 주셔서 고맙습니다', ja: '最初に見つけてくださり、ありがとうございます' };
// The bottom line: one link to the site, in each language (Brian 2026-11-13, latest)
const FOOTER = { ko: 'attenua.io 바로가기', en: 'Visit attenua.io', ja: 'attenua.ioを見る' };

test('subjects as Sophie gave them', () => {
  for (const l of ['en', 'ko', 'ja']) assert.equal(welcomeMail(l).subject, SUBJECT[l], l);
});

test('the new words, line by line, as Sophie gave them', () => {
  assert.deepEqual(TEXT.ko.paragraphs, ['안녕하세요,', 'ATTENUA를 가장 먼저 찾아 주신 분 중 한 분이 되어 주셔서 고맙습니다.',
    '사람이 AI에 맞추는 게 아니라, AI가 사람에게 맞춥니다. 그게 ATTENUA의 약속이에요. 서두르지 않고, 당신의 속도에 맞춰, 시간이 갈수록 당신을 더 잘 알고 도와주는 AI를 만들고 있어요.']);
  assert.deepEqual(TEXT.ko.quote, ['함께한 시간이 쌓일수록, 당신을 더 잘 지키고 돕습니다.', '잠시 조용해도, 관계는 계속 이어집니다.']);
  assert.deepEqual(TEXT.ko.after, ['준비가 되면 가장 먼저 알려 드릴게요. 기다려 주셔서 고맙습니다.']);
  assert.equal(TEXT.ko.signature, '— ATTENUA · 인간의 시간을 위한 AI');
  assert.deepEqual(TEXT.en.paragraphs, ['Hello,', 'Thank you for being one of the very first to find ATTENUA.',
    "You don't adapt to AI. AI adapts to you. That's the ATTENUA promise. We're building an AI that never rushes you, moves at your pace, and comes to know and help you better as time goes on."]);
  assert.deepEqual(TEXT.en.quote, ['The more time we share, the better it can protect and help you.', 'Even in quiet moments, the connection carries on.']);
  assert.deepEqual(TEXT.en.after, ["We'll let you know first when we're ready. Thank you for waiting."]);
  assert.equal(TEXT.en.signature, '— ATTENUA · AI for Human Time');
  assert.deepEqual(TEXT.ja.paragraphs, ['こんにちは。', 'ATTENUAを最初に見つけてくださった方のお一人になっていただき、ありがとうございます。',
    '人がAIに合わせるのではなく、AIが人に合わせます。それがATTENUAの約束です。急がず、あなたのペースに合わせて、時間とともにあなたをもっとよく知り、支えるAIをつくっています。']);
  assert.deepEqual(TEXT.ja.quote, ['一緒に過ごす時間が増えるほど、あなたをもっとよく守り、支えます。', 'しばらく静かでも、つながりは続いています。']);
  assert.deepEqual(TEXT.ja.after, ['準備ができたら、いちばんにお知らせします。お待ちいただき、ありがとうございます。']);
  assert.equal(TEXT.ja.signature, '— ATTENUA · 人の時間のためのAI');
  for (const l of ['en', 'ko', 'ja']) assert.equal(TEXT[l].footer, FOOTER[l], l + ' footer');
});

test('one language per mail: no other language\'s words in it', () => {
  const words = { en: 'Thank you for being one of the very first to find ATTENUA.', ko: 'ATTENUA를 가장 먼저 찾아 주신 분 중 한 분이 되어 주셔서 고맙습니다.', ja: 'ATTENUAを最初に見つけてくださった方のお一人になっていただき、ありがとうございます。' };
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
    for (const s of [...t.paragraphs, ...t.quote, ...t.after, t.signature, t.footer]) assert.ok(html.includes(esc(s)), lang + ': ' + s);
  }
});

test('the same look in all three: logo, quote box, amber signature, bottom line, and its own serif fonts', () => {
  for (const lang of ['en', 'ko', 'ja']) {
    const { html } = welcomeMail(lang);
    assert.ok(html.includes('https://www.attenua.io/attenua_logo.png'), lang + ' logo');
    assert.ok(html.includes('border-left:2px solid #c8873a;padding:16px 20px;background-color:#1c1814;'), lang + ' quote box');
    assert.equal((html.match(/font-style:italic/g) || []).length, TEXT[lang].quote.length, lang + ' one italic line per quote line');
    assert.ok(/color:#c8873a;font-size:13px;letter-spacing:0\.05em;text-align:left;">— ATTENUA · /.test(html), lang + ' amber signature');
    // the bottom line is one link to https://attenua.io, in a light cream on the link itself (not the old dark grey)
    const links = [...html.matchAll(/<a href="([^"]+)" style="([^"]+)">([^<]+)<\/a>/g)];
    assert.equal(links.length, 1, lang + ' exactly one link');
    assert.equal(links[0][1], 'https://attenua.io', lang + ' link address');
    assert.match(links[0][2], /color:#d4cfc8;/, lang + ' light cream link');
    assert.equal(links[0][3], FOOTER[lang], lang + ' link words');
    assert.ok(!/[→←]/.test(html), lang + ' no arrow');
    // the whole line is the link: it fills the bar (block, the bar's padding inside the link, none left on the cell)
    assert.match(links[0][2], /^display:block;padding:20px 40px;/, lang + ' the link fills the bar');
    assert.ok(html.includes('<td dir="ltr" style="padding:0;background-color:#0e0c0a;'), lang + ' no padding outside the link');
    assert.ok(!/color:#4a4038/.test(html), lang + ' no dark grey bottom line');
    assert.ok(!/text-transform:uppercase/.test(html), lang + ' no capitals forced on the link');
    for (const old of ['SEOUL', 'Seoul', 'ALWAYS BY YOUR SIDE', 'The signal never stopped'])
      assert.ok(!html.includes(old), lang + ' no ' + old);
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
  for (const [lang, want, subject] of [['ko', 'ko', SUBJECT.ko], ['ja-JP', 'ja', SUBJECT.ja], ['fr', 'en', SUBJECT.en], [undefined, 'en', SUBJECT.en]]) {
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
  assert.equal(h.calls[2].body.subject, SUBJECT.ko);
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
    for (const k of ['subject', 'font', 'lineHeight', 'signature', 'footer']) assert.ok(typeof t[k] === 'string' && t[k].trim(), code + ' ' + k);
    for (const k of ['paragraphs', 'quote', 'after']) assert.ok(Array.isArray(t[k]) && t[k].length && t[k].every((s) => typeof s === 'string' && s.trim()), code + ' ' + k);
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

test('no city or country name in any mail (Brian 2026-11-13)', () => {
  for (const l of ['en', 'ko', 'ja']) {
    const html = welcomeMail(l).html;
    for (const place of ['Seoul', 'SEOUL', '서울', 'ソウル', 'Korea', '한국에', '韓国', 'Japan ', '東京', 'Tokyo']) assert.ok(!html.includes(place), l + ': ' + place);
  }
});

test('room for right to left (Arabic later): the mail turns around by dir, the bottom line stays left to right', () => {
  const rtl = renderMail({ ...TEXT.en, subject: 'x' }, 'ar', 'rtl');
  assert.match(rtl, /<html lang="ar" dir="rtl">/);
  assert.match(rtl, /<body dir="rtl"/);
  assert.ok(rtl.includes('border-right:2px solid #c8873a'), 'the quote line on the right');
  assert.ok(!rtl.includes('border-left:2px'), 'not on the left');
  assert.ok(!/text-align:left/.test(rtl), 'text from the right');
  assert.match(rtl, /<td dir="rtl" style="padding:0;background-color:#0e0c0a;/, 'the bottom link is in the language too, so it turns around');
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
