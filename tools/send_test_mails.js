// Three test welcome mails (Korean, Japanese, English) to one address, so Brian sees them before the site goes online.
// Sends mails only: no contact is made. The Resend key is read from this terminal's RESEND_API_KEY, never written down.
//   node tools/send_test_mails.js you@example.com
const { welcomeMail } = require('../welcome');
const { FROM } = require('../subscribe');

async function main() {
  const to = process.argv[2];
  const key = process.env.RESEND_API_KEY;
  if (!to || !to.includes('@')) { console.error('usage: node tools/send_test_mails.js you@example.com'); process.exit(2); }
  if (!key) { console.error('RESEND_API_KEY is not set in this terminal'); process.exit(2); }
  let failed = 0;
  for (const lang of ['ko', 'ja', 'en']) {
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
