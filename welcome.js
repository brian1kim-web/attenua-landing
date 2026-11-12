// The early access welcome mail, one language per mail (Sophie 2026-11-13). The languages come from languages.js
// (the same list as the site's screen); each language's words are in welcome-texts/<code>.json. To add a language:
// a line in languages.js, its words in a new welcome-texts file, its screen words in index.html — no code here changes.
// The look is the same in all languages: logo, the quote box, the amber signature and the bottom line. Mail apps do not
// load web fonts, so each words file names the fonts phones and PCs already have. A right-to-left language (dir 'rtl'
// in languages.js, e.g. Arabic) turns the mail around: dir="rtl", text from the right, the quote box's line on the right.
const fs = require('fs');
const path = require('path');
const { LANGUAGES, DEFAULT, pick } = require('./languages');

const TEXT_DIR = path.join(__dirname, 'welcome-texts');
const FIELDS = ['subject', 'font', 'lineHeight', 'paragraphs', 'quote', 'after', 'signature', 'footer'];
/** Where the bottom link goes (the same in every language). */
const SITE_URL = 'https://attenua.io';

/** {code: words} for every language in languages.js that has a words file. */
const TEXT = Object.freeze(Object.fromEntries(LANGUAGES
  .filter((l) => fs.existsSync(path.join(TEXT_DIR, l.code + '.json')))
  .map((l) => [l.code, Object.freeze(JSON.parse(fs.readFileSync(path.join(TEXT_DIR, l.code + '.json'), 'utf8')))])));
const LANGS = Object.freeze(Object.keys(TEXT));

/** The site's screen language ('ko', 'ja-JP', ...) -> a language with mail words. Anything not understood is English. */
function mailLang(value) {
  return pick(value, LANGS) || DEFAULT;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The mail's HTML for one language's words; dir 'ltr' or 'rtl'. */
function renderMail(t, lang, dir = 'ltr') {
  const rtl = dir === 'rtl';
  const side = rtl ? 'right' : 'left';
  const align = rtl ? 'right' : 'left';
  const p = (s) => `          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:${t.lineHeight};text-align:${align};">${esc(s)}</p>`;
  const q = (s, last) => `              <p style="margin:0${last ? '' : ' 0 8px'};color:#a89880;font-size:14px;line-height:${t.lineHeight};font-style:italic;text-align:${align};">${esc(s)}</p>`;
  return `
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body dir="${dir}" style="margin:0;padding:0;background-color:#f5f0e8;font-family:${t.font};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table dir="${dir}" width="560" cellpadding="0" cellspacing="0" style="background-color:#141210;border-radius:4px;overflow:hidden;max-width:560px;font-family:${t.font};">

        <!-- logo -->
        <tr><td style="padding:0;border-bottom:1px solid #2a2520;">
        <img src="https://www.attenua.io/attenua_logo.png" alt="ATTENUA AI" width="280" style="display:block;width:50%;max-width:280px;margin:0 auto;">
        </td></tr>

        <!-- body -->
        <tr><td style="padding:40px;">
${t.paragraphs.map(p).join('\n')}

          <!-- quote box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-${side}:2px solid #c8873a;padding:16px 20px;background-color:#1c1814;">
${t.quote.map((s, i) => q(s, i === t.quote.length - 1)).join('\n')}
            </td></tr>
          </table>

${t.after.map(p).join('\n')}
          <p style="margin:0;color:#c8873a;font-size:13px;letter-spacing:0.05em;text-align:${align};">${esc(t.signature)}</p>
        </td></tr>

        <!-- footer: one link to the site, its words in each words file's "footer" (Brian 2026-11-13, latest: no city
             or country name, no arrow; a light cream like the body text so it shows on the dark bar; the color is on
             the link itself so mail apps do not paint it blue). The link fills the whole bar (display:block, the
             padding inside it), so pressing anywhere on the line goes to the site. -->
        <tr><td dir="${dir}" style="padding:0;background-color:#0e0c0a;border-top:1px solid #2a2520;text-align:center;">
          <a href="${SITE_URL}" style="display:block;padding:20px 40px;color:#d4cfc8;text-decoration:none;font-size:12px;letter-spacing:0.05em;font-family:${t.font};text-align:center;">${esc(t.footer)}</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;
}

/** {lang, subject, html} for one language. */
function welcomeMail(value) {
  const lang = mailLang(value);
  const dir = (LANGUAGES.find((l) => l.code === lang) || {}).dir || 'ltr';
  return { lang, subject: TEXT[lang].subject, html: renderMail(TEXT[lang], lang, dir) };
}

module.exports = { LANGS, TEXT, FIELDS, SITE_URL, mailLang, renderMail, welcomeMail };
