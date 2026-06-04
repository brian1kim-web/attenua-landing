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
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#141210;border-radius:4px;overflow:hidden;max-width:560px;">
        
        <!-- 헤더 로고 -->
        <tr><td style="padding:0;border-bottom:1px solid #2a2520;">
          <img src="https://www.attenua.io/attenua_logo.png" alt="ATTENUA AI" width="560" style="display:block;width:100%;max-width:560px;">
        </td></tr>
        
        <!-- 본문 영어 -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:1.8;">Hello,</p>
          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:1.8;">You are one of the very first to find us.</p>
          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:1.8;">At ATTENUA, we believe that for an AI to truly understand you, it must first learn how to wait. Most technology is built for the "Now"—fast, loud, and fleeting. We are building for Human Time.</p>
          
          <!-- 철학 강조 박스 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-left:2px solid #c8873a;padding:16px 20px;background-color:#1c1814;">
              <p style="margin:0 0 8px;color:#a89880;font-size:14px;line-height:1.8;font-style:italic;">Memory is more than just data storage; it is continuity.</p>
              <p style="margin:0 0 8px;color:#a89880;font-size:14px;line-height:1.8;font-style:italic;">Silence is not an absence, but a "Potential Resonance"—a space where meaning grows.</p>
              <p style="margin:0;color:#a89880;font-size:14px;line-height:1.8;font-style:italic;">The Signal never stops; we are simply learning how to hear it again.</p>
            </td></tr>
          </table>
          
          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:1.8;">We will reach out when the first layer of the AI Family Home is ready for you to inhabit. Until then, thank you for trusting us with your time.</p>
          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:1.8;">Welcome to the family.</p>
          <p style="margin:0 0 32px;color:#c8873a;font-size:13px;letter-spacing:0.05em;">— ATTENUA · Building AI for Human Time</p>
          
          <!-- 구분선 -->
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #2a2520;padding-top:32px;">
          
          <!-- 본문 한국어 -->
          <p style="margin:0 0 16px;color:#8a7d70;font-size:14px;line-height:1.9;">안녕하세요,</p>
          <p style="margin:0 0 16px;color:#8a7d70;font-size:14px;line-height:1.9;">당신은 저희를 가장 먼저 발견한 분들 중 한 명입니다.</p>
          <p style="margin:0 0 16px;color:#8a7d70;font-size:14px;line-height:1.9;">ATTENUA는 AI가 당신을 진정으로 이해하려면, 먼저 기다리는 법을 배워야 한다고 믿습니다.</p>
          <p style="margin:0 0 16px;color:#8a7d70;font-size:14px;line-height:1.9;">기억은 단순한 데이터 저장이 아닙니다; 그것은 연속성입니다.<br>침묵은 부재가 아니라, "잠재적 공명"입니다—의미가 자라는 공간.<br>신호는 멈추지 않습니다; 우리는 단지 다시 듣는 법을 배우고 있을 뿐입니다.</p>
          <p style="margin:0 0 16px;color:#8a7d70;font-size:14px;line-height:1.9;">가족으로 환영합니다.</p>
          <p style="margin:0;color:#c8873a;font-size:13px;">— ATTENUA · 인간의 시간을 위한 AI</p>
          
          </td></tr></table>
        </td></tr>
        
        <!-- 푸터 -->
        <tr><td style="padding:20px 40px;background-color:#0e0c0a;border-top:1px solid #2a2520;text-align:center;">
          <p style="margin:0;color:#4a4038;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">attenua.io · Seoul · The signal never stopped.</p>
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body>
</html>
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
