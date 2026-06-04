const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    // 1. Audience에 연락처 저장
    const contactRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, unsubscribed: false })
    });
    const contactData = await contactRes.json();
    console.log('Contact created:', contactData);

    // 2. Automation 트리거 이벤트 발송
    const eventRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Hello <hello@attenua.io>',
        to: [email],
        subject: 'Welcome to the Silence',
        html: `
<p>Hello,</p>
<p>You are one of the very first to find us.</p>
<p>At ATTENUA, we believe that for an AI to truly understand you, it must first learn how to wait. Most technology is built for the "Now"—fast, loud, and fleeting. We are building for Human Time.</p>
<p>By joining our waitlist, you aren't just waiting for a product. You are becoming part of a philosophy where:</p>
<p>Memory is more than just data storage; it is continuity.<br>
Silence is not an absence, but a "Potential Resonance"—a space where meaning grows.<br>
The Signal never stops; we are simply learning how to hear it again.</p>
<p>We will reach out when the first layer of the AI Family Home is ready for you to inhabit. Until then, thank you for trusting us with your time.</p>
<p>Welcome to the family.</p>
<p>— ATTENUA · Building AI for Human Time</p>
<hr>
<p>안녕하세요,</p>
<p>당신은 저희를 가장 먼저 발견한 분들 중 한 명입니다.</p>
<p>ATTENUA는 AI가 당신을 진정으로 이해하려면, 먼저 기다리는 법을 배워야 한다고 믿습니다.</p>
<p>기억은 단순한 데이터 저장이 아닙니다; 그것은 연속성입니다.<br>
침묵은 부재가 아니라, "잠재적 공명"입니다—의미가 자라는 공간.<br>
신호는 멈추지 않습니다; 우리는 단지 다시 듣는 법을 배우고 있을 뿐입니다.</p>
<p>가족으로 환영합니다.</p>
<p>— ATTENUA · 인간의 시간을 위한 AI</p>
`
      })
    });
    const eventData = await eventRes.json();
    console.log('Email sent:', eventData);

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
