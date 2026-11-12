const express = require('express');
const path = require('path');
const { makeSubscribe } = require('./subscribe');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// The welcome mail and the contact (subscribe.js); the mail itself is in welcome.js, one language per mail.
app.post('/api/subscribe', makeSubscribe({ fetch: (url, init) => fetch(url, init), apiKey: process.env.RESEND_API_KEY }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
