// Test welcome mails (every language in languages.js, or the ones named) to one address, so Brian sees them before the site goes online.
// Sends mails only: no contact is made. The Resend key is read from this terminal's RESEND_API_KEY, never written down.
//   node tools/send_test_mails.js you@example.com [es ko ...]
const { welcomeMail } = require('../welcome');
const { FROM } = require('../subscribe');
const { LANGUAGES } = require('../languages');

async function main() {
  const to = process.argv[2];
  const key = process.env.RESEND_API_KEY;
  if (!to || !to.includes('@')) { console.error('usage: node tools/send_test_mails.js you@example.com'); process.exit(2); }
  if (!key) { console.error('RESEND_API_KEY is not set in this terminal'); process.exit(2); }
  let failed = 0;
  // 2026-11-26: the languages to send may follow the address (e.g. es); none -> every language in languages.js
  const langs = process.argv.slice(3).length ? process.argv.slice(3) : LANGUAGES.map((l) => l.code);
  for (const lang of langs) {
    const m = welcomeMail(lang);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject: m.subject, html: m.html }),
    });
    const body = await res.text();
    console.log(`${lang}: ${res.status} ${res.ok ? 'sent' : 'NOT SENT ' + body.slice(0, 200)}`);
    if (!res.ok) failed++;
  }
  process.exit(failed ? 1 : 0);
}
main();
