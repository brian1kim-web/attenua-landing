// The early access welcome mail, one language per mail (Sophie 2026-11-13): Korean -> Korean only, Japanese -> Japanese
// only, anything else (or unknown) -> English only. The look is the same in all three: logo, the quote box, the amber
// signature and the bottom line. Fonts: mail apps do not load web fonts, so each language names the serif fonts phones
// and PCs already have, with Georgia/serif last.

const LANGS = ['en', 'ko', 'ja'];

/** The site's screen language ('ko', 'ja-JP', ...) -> 'ko' | 'ja' | 'en'. Anything not understood is English. */
function mailLang(value) {
  if (typeof value !== 'string') return 'en';
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return LANGS.includes(base) ? base : 'en';
}

const TEXT = {
  en: {
    subject: 'Welcome to the Silence',
    font: "Georgia,'Times New Roman',serif",
    lineHeight: '1.8',
    paragraphs: [
      'Hello,',
      'You are one of the very first to find us.',
      'At ATTENUA, we believe that for an AI to truly understand you, it must first learn how to wait. Most technology is built for the "Now"—fast, loud, and fleeting. We are building for Human Time.',
    ],
    quote: [
      'Memory is more than just data storage; it is continuity.',
      'Silence is not an absence, but a "Potential Resonance"—a space where meaning grows.',
      'The Signal never stops; we are simply learning how to hear it again.',
    ],
    after: [
      'We will reach out when the first layer of the AI Family Home is ready for you to inhabit. Until then, thank you for trusting us with your time.',
      'Welcome to the family.',
    ],
    signature: '— ATTENUA · Building AI for Human Time',
  },
  ko: {
    subject: '침묵 속으로 오신 것을 환영합니다',
    font: "'Noto Serif KR','Nanum Myeongjo','AppleMyungjo','Batang',Georgia,serif",
    lineHeight: '1.9',
    paragraphs: [
      '안녕하세요,',
      '당신은 저희를 가장 먼저 발견한 분들 중 한 명입니다.',
      "ATTENUA는 AI가 당신을 진정으로 이해하려면, 먼저 기다리는 법을 배워야 한다고 믿습니다. 대부분의 기술은 '지금'을 위해 만들어집니다. 빠르고, 시끄럽고, 금방 사라지는 것으로요. 저희는 '인간의 시간(Human Time)'을 위해 만듭니다.",
    ],
    quote: [
      '기억은 단순한 데이터 저장이 아닙니다. 그것은 연속성입니다.',
      "침묵은 부재가 아니라 '잠재적 공명', 의미가 자라는 공간입니다.",
      '신호는 멈추지 않습니다. 우리는 단지 그것을 다시 듣는 법을 배우고 있을 뿐입니다.',
    ],
    after: [
      'AI 가족의 집, 그 첫 번째 층이 당신을 맞이할 준비가 되면 연락드리겠습니다. 그때까지 소중한 시간을 저희에게 맡겨 주셔서 감사합니다.',
      '가족으로 환영합니다.',
    ],
    signature: '— ATTENUA · 인간의 시간을 위한 AI',
  },
  ja: {
    subject: '静けさへようこそ',
    font: "'Noto Serif JP','Hiragino Mincho ProN','Yu Mincho','YuMincho','MS PMincho',Georgia,serif",
    lineHeight: '1.9',
    paragraphs: [
      'こんにちは、',
      'あなたは、私たちを最初に見つけてくださった方のおひとりです。',
      'ATTENUAは、AIがあなたを本当に理解するためには、まず「待つこと」を学ばなければならないと考えています。多くのテクノロジーは「今」のために作られています——速く、騒がしく、すぐに消えていくものとして。私たちは「人間の時間（Human Time）」のために作っています。',
    ],
    quote: [
      '記憶は単なるデータの保存ではありません。それは連続性です。',
      '沈黙は不在ではなく、「潜在的な共鳴」——意味が育つ空間です。',
      '信号は止まりません。私たちはただ、それをもう一度聴く方法を学んでいるのです。',
    ],
    after: [
      'AIファミリーホームの最初の層が、あなたをお迎えできる準備が整いましたら、ご連絡いたします。それまで、あなたの大切な時間を私たちに託してくださり、ありがとうございます。',
      'ファミリーへようこそ。',
    ],
    signature: '— ATTENUA · 人間の時間のためのAI',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** {lang, subject, html} for one language. */
function welcomeMail(value) {
  const lang = mailLang(value);
  const t = TEXT[lang];
  const p = (s) => `          <p style="margin:0 0 20px;color:#d4cfc8;font-size:15px;line-height:${t.lineHeight};">${esc(s)}</p>`;
  const q = (s, last) => `              <p style="margin:0${last ? '' : ' 0 8px'};color:#a89880;font-size:14px;line-height:${t.lineHeight};font-style:italic;">${esc(s)}</p>`;
  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:${t.font};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#141210;border-radius:4px;overflow:hidden;max-width:560px;font-family:${t.font};">

        <!-- logo -->
        <tr><td style="padding:0;border-bottom:1px solid #2a2520;">
        <img src="https://www.attenua.io/attenua_logo.png" alt="ATTENUA AI" width="280" style="display:block;width:50%;max-width:280px;margin:0 auto;">
        </td></tr>

        <!-- body -->
        <tr><td style="padding:40px;">
${t.paragraphs.map(p).join('\n')}

          <!-- quote box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-left:2px solid #c8873a;padding:16px 20px;background-color:#1c1814;">
${t.quote.map((s, i) => q(s, i === t.quote.length - 1)).join('\n')}
            </td></tr>
          </table>

${t.after.map(p).join('\n')}
          <p style="margin:0;color:#c8873a;font-size:13px;letter-spacing:0.05em;">${esc(t.signature)}</p>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:20px 40px;background-color:#0e0c0a;border-top:1px solid #2a2520;text-align:center;">
          <p style="margin:0;color:#4a4038;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:Georgia,'Times New Roman',serif;">attenua.io · Seoul · The signal never stopped.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;
  return { lang, subject: t.subject, html };
}

module.exports = { LANGS, TEXT, mailLang, welcomeMail };
