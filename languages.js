// The one list of ATTENUA's languages (Sophie 2026-11-13): the site's screen (index.html) and the welcome mail
// (welcome.js) both read it, so they can never disagree. One line per language:
//   code  the language tag ('en', 'ko', later 'pt-BR', 'zh', 'ar', ...)
//   name  the name shown in the language menu, in that language
//   dir   'ltr' (left to right) or 'rtl' (right to left, e.g. Arabic): the screen and the mail turn around by it
// A language here needs its screen words (index.html i18n) and its mail words (welcome-texts/<code>.json);
// `npm test` says which one is missing. The same matching rule (pick) for the screen and the mail: the whole tag first
// (pt-BR), then the main part (ko-KR -> ko); nothing found -> English.
(function (root) {
  const LANGUAGES = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ko', name: '한국어', dir: 'ltr' },
    { code: 'ja', name: '日本語', dir: 'ltr' },
  ];
  const DEFAULT = 'en';

  /** A visitor's tag ('ko-KR', 'pt-BR', ...) -> one of codes (default: all codes above), or null. */
  function pick(tag, codes) {
    const list = codes || LANGUAGES.map((l) => l.code);
    if (typeof tag !== 'string') return null;
    const t = tag.trim().toLowerCase().replace(/_/g, '-');
    if (!t) return null;
    const find = (x) => list.find((c) => c.toLowerCase() === x);
    return find(t) || find(t.split('-')[0]) || null;
  }
  const byCode = (code) => LANGUAGES.find((l) => l.code === code) || null;

  const api = { LANGUAGES, DEFAULT, pick, byCode };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ATTENUA_LANGS = api;
})(this);
