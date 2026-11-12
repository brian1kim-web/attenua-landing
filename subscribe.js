// POST /api/subscribe: keep the contact in Resend (with its language) and send one welcome mail in that language.
// The language is the site's screen language sent by the page (index.html joinWaitlist); unknown -> English.
const { welcomeMail } = require('./welcome');

const FROM = 'Hello <hello@attenua.io>';

/** Express handler. fetch and apiKey are given in so the PC tests can run it without the internet. */
function makeSubscribe({ fetch, apiKey, log = console }) {
  const resend = (path, body) => fetch('https://api.resend.com' + path, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return async function subscribe(req, res) {
    const { email, lang } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    const mail = welcomeMail(lang);
    try {
      // 1. The contact, with its language (the "lang" property must exist in Resend first). If Resend refuses the
      //    language, keep the contact without it: a signup is never lost because of the language.
      let contactRes = await resend('/contacts', { email, unsubscribed: false, properties: { lang: mail.lang } });
      if (!contactRes.ok) {
        log.error('Contact with lang refused:', contactRes.status);
        contactRes = await resend('/contacts', { email, unsubscribed: false });
      }
      log.log('Contact saved:', contactRes.status, mail.lang);

      // 2. One welcome mail, in that language only
      const mailRes = await resend('/emails', { from: FROM, to: [email], subject: mail.subject, html: mail.html });
      log.log('Email sent:', mailRes.status, mail.lang);

      res.json({ success: true });
    } catch (error) {
      log.error('Error:', error && error.message);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  };
}

module.exports = { makeSubscribe, FROM };
