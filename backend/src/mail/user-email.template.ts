const SITE = 'https://quranpilot.com';
const LOGO = `${SITE}/images/logo.png`;

export const EMAIL_LAYOUTS = [
  'classic',
  'letter',
  'announcement',
  'reminder',
  'digest',
  'invite',
  'focus',
  'gratitude',
] as const;
export type EmailLayout = (typeof EMAIL_LAYOUTS)[number];

export function isEmailLayout(value: string | undefined): value is EmailLayout {
  return EMAIL_LAYOUTS.includes(value as EmailLayout);
}

export type UserEmailContent = {
  name: string;
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  layout?: EmailLayout;
};

export function publicSiteOrigin(): string {
  const raw = (process.env.FRONTEND_URL || SITE).replace(/\/$/, '');
  if (!raw || /localhost|127\.0\.0\.1/.test(raw)) return SITE;
  return raw;
}

export function resolveCtaUrl(ctaUrl?: string): string {
  const origin = publicSiteOrigin();
  const value = ctaUrl?.trim();
  if (!value) return origin;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${origin}${value}`;
  return origin;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bodyToHtml(body: string, color = '#1f2937'): string {
  const blocks = body
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  if (!blocks.length) return '';
  return blocks
    .map((block) => {
      const lines = escapeHtml(block).replace(/\n/g, '<br/>');
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${color}">${lines}</p>`;
    })
    .join('');
}

function wrapDocument(subject: string, preheader: string, pageBg: string, card: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta http-equiv="x-ua-compatible" content="ie=edge"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:${pageBg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${pageBg};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        ${card}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaCell(label: string, url: string, bg: string, color = '#ffffff'): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
  <tr>
    <td align="center" bgcolor="${bg}" style="background:${bg};border-radius:4px;">
      <a href="${url}" style="display:inline-block;padding:13px 26px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:bold;color:${color};text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

function brandHeader(): string {
  return `<td style="background:#063a32;padding:22px 28px;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:middle;padding-right:12px;">
        <img src="${LOGO}" width="36" height="36" alt="QuranPilot" style="display:block;border:0;width:36px;height:36px;background:#ffffff;border-radius:4px;"/>
      </td>
      <td style="vertical-align:middle;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.2;color:#ffffff;font-weight:bold;">QuranPilot</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.4;color:#d1fae5;padding-top:3px;">Read, listen, and understand the Quran</div>
      </td>
    </tr>
  </table>
</td>`;
}

function darkFooter(year: number): string {
  return `<td style="background:#063a32;padding:22px 28px;font-family:Georgia,'Times New Roman',serif;">
  <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#ecfdf5;">
    <a href="${SITE}" style="color:#fcd34d;text-decoration:none;">quranpilot.com</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/surahs" style="color:#a7f3d0;text-decoration:none;">Chapters</a>
    &nbsp;·&nbsp;
    <a href="${SITE}/learning-plans" style="color:#a7f3d0;text-decoration:none;">Learning plans</a>
  </p>
  <p style="margin:0;font-size:12px;line-height:1.5;color:#86efac;">
    © ${year} QuranPilot. You received this because you have a registered QuranPilot account.
  </p>
</td>`;
}

function signOff(): string {
  return `<p style="margin:24px 0 0;font-size:13px;line-height:1.55;color:#64748b;">Peace and blessings,<br/>The QuranPilot team</p>`;
}

function cardTable(rows: string): string {
  return `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse;">${rows}</table>`;
}

function prepared(content: UserEmailContent) {
  const name = escapeHtml(content.name.trim() || 'there');
  const subject = escapeHtml(content.subject.trim());
  const preheader = escapeHtml(content.body.trim().replace(/\s+/g, ' ').slice(0, 110));
  const ctaUrl = escapeHtml(resolveCtaUrl(content.ctaUrl));
  const ctaLabel = escapeHtml(content.ctaLabel?.trim() || 'Open QuranPilot');
  const year = new Date().getFullYear();
  const paragraphs = bodyToHtml(content.body);
  return { name, subject, preheader, ctaUrl, ctaLabel, year, paragraphs };
}

function classicHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#eef3f0',
    cardTable(`
      <tr><td style="height:5px;line-height:5px;font-size:0;background:#c08829;">&nbsp;</td></tr>
      <tr>${brandHeader()}</tr>
      <tr>
        <td style="padding:32px 28px 28px;font-family:Georgia,'Times New Roman',serif;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.5;color:#065f46;">Assalamu alaikum, ${c.name}</p>
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:bold;">${c.subject}</h1>
          ${c.paragraphs}
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#065f46')}
          ${signOff()}
        </td>
      </tr>
      <tr>${darkFooter(c.year)}</tr>
    `),
  );
}

function letterHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#f1f5f4',
    cardTable(`
      <tr>
        <td style="padding:36px 36px 12px;font-family:Georgia,'Times New Roman',serif;border-top:4px solid #065f46;">
          <p style="margin:0;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#065f46;">QuranPilot</p>
          <p style="margin:28px 0 0;font-size:16px;line-height:1.6;color:#334155;">Assalamu alaikum, ${c.name},</p>
          <h1 style="margin:20px 0 18px;font-size:26px;line-height:1.3;color:#0f172a;font-weight:normal;">${c.subject}</h1>
          ${c.paragraphs}
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#065f46')}
          <p style="margin:32px 0 0;font-size:15px;line-height:1.6;color:#334155;">With peace,<br/>QuranPilot</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 36px 32px;font-family:Georgia,'Times New Roman',serif;font-size:12px;line-height:1.5;color:#64748b;border-top:1px solid #e2e8f0;">
          <a href="${SITE}" style="color:#065f46;text-decoration:none;">quranpilot.com</a>
          &nbsp;·&nbsp;© ${c.year} QuranPilot
        </td>
      </tr>
    `),
  );
}

function announcementHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#063a32',
    cardTable(`
      <tr><td style="height:5px;line-height:5px;font-size:0;background:#c08829;">&nbsp;</td></tr>
      <tr>
        <td style="background:#063a32;padding:36px 28px 28px;font-family:Georgia,'Times New Roman',serif;">
          <img src="${LOGO}" width="40" height="40" alt="QuranPilot" style="display:block;border:0;width:40px;height:40px;background:#ffffff;border-radius:4px;margin-bottom:18px;"/>
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#fcd34d;">From QuranPilot</p>
          <h1 style="margin:0;font-size:28px;line-height:1.25;color:#ffffff;font-weight:bold;">${c.subject}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;font-family:Georgia,'Times New Roman',serif;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#065f46;">Assalamu alaikum, ${c.name}</p>
          ${c.paragraphs}
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#c08829', '#1c1917')}
          ${signOff()}
        </td>
      </tr>
      <tr>${darkFooter(c.year)}</tr>
    `),
  );
}

function reminderHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#e8eee9',
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse;border-left:6px solid #c08829;">
      <tr>
        <td style="padding:28px;font-family:Georgia,'Times New Roman',serif;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#c08829;">A reminder</p>
          <p style="margin:0 0 16px;font-size:13px;color:#065f46;">QuranPilot · Assalamu alaikum, ${c.name}</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:bold;">${c.subject}</h1>
          ${c.paragraphs}
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#065f46')}
          <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#64748b;">
            <a href="${SITE}" style="color:#065f46;text-decoration:none;">quranpilot.com</a>
            &nbsp;·&nbsp;© ${c.year} QuranPilot
          </p>
        </td>
      </tr>
    </table>`,
  );
}

function digestHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#e7ece9',
    cardTable(`
      <tr>
        <td style="background:#0b3d34;padding:18px 28px;font-family:Georgia,'Times New Roman',serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:14px;color:#a7f3d0;">QuranPilot digest</td>
              <td align="right" style="font-size:12px;color:#fcd34d;">For ${c.name}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;font-family:Georgia,'Times New Roman',serif;">
          <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:bold;">${c.subject}</h1>
          <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Assalamu alaikum — here is something worth your time.</p>
          <div style="border-top:1px solid #d1d5db;padding-top:18px;">
            ${c.paragraphs}
          </div>
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#065f46')}
        </td>
      </tr>
      <tr>${darkFooter(c.year)}</tr>
    `),
  );
}

function inviteHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#dff5ee',
    cardTable(`
      <tr>
        <td align="center" style="padding:36px 28px 12px;font-family:Georgia,'Times New Roman',serif;">
          <img src="${LOGO}" width="48" height="48" alt="QuranPilot" style="display:block;border:0;width:48px;height:48px;background:#ffffff;border-radius:8px;margin:0 auto 16px;"/>
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#047857;">An invitation</p>
          <h1 style="margin:0 0 12px;font-size:26px;line-height:1.3;color:#064e3b;font-weight:bold;">${c.subject}</h1>
          <p style="margin:0;font-size:15px;color:#065f46;">Assalamu alaikum, ${c.name}</p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:8px 40px 28px;font-family:Georgia,'Times New Roman',serif;">
          <div style="text-align:left;display:inline-block;max-width:100%;">
            ${c.paragraphs}
          </div>
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#047857')}
          <p style="margin:18px 0 0;font-size:12px;color:#64748b;">© ${c.year} QuranPilot · <a href="${SITE}" style="color:#065f46;text-decoration:none;">quranpilot.com</a></p>
        </td>
      </tr>
    `),
  );
}

function focusHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#ffffff',
    cardTable(`
      <tr>
        <td style="padding:48px 40px;font-family:Georgia,'Times New Roman',serif;text-align:center;">
          <p style="margin:0 0 24px;font-size:13px;color:#065f46;">QuranPilot</p>
          <h1 style="margin:0 0 20px;font-size:30px;line-height:1.25;color:#0f172a;font-weight:bold;">${c.subject}</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;">Assalamu alaikum, ${c.name}</p>
          <div style="text-align:left;max-width:440px;margin:0 auto;">
            ${c.paragraphs}
          </div>
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#0f172a')}
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;">© ${c.year} · <a href="${SITE}" style="color:#065f46;text-decoration:none;">quranpilot.com</a></p>
        </td>
      </tr>
    `),
  );
}

function gratitudeHtml(c: ReturnType<typeof prepared>): string {
  return wrapDocument(
    c.subject,
    c.preheader,
    '#f3f0e8',
    cardTable(`
      <tr><td style="height:5px;line-height:5px;font-size:0;background:#c08829;">&nbsp;</td></tr>
      <tr>
        <td style="padding:36px 32px;font-family:Georgia,'Times New Roman',serif;background:#fffdf8;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;">With gratitude</p>
          <p style="margin:0 0 18px;font-size:15px;color:#065f46;">Assalamu alaikum, ${c.name}</p>
          <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#1c1917;font-weight:bold;">${c.subject}</h1>
          ${c.paragraphs}
          ${ctaCell(c.ctaLabel, c.ctaUrl, '#065f46')}
          ${signOff()}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 28px;font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#78716c;background:#fffdf8;border-top:1px solid #e7e5e4;">
          © ${c.year} QuranPilot · <a href="${SITE}" style="color:#065f46;text-decoration:none;">quranpilot.com</a>
        </td>
      </tr>
    `),
  );
}

export function renderUserEmailText(content: UserEmailContent): string {
  const name = content.name.trim() || 'there';
  const ctaUrl = resolveCtaUrl(content.ctaUrl);
  const ctaLabel = content.ctaLabel?.trim() || 'Open QuranPilot';
  return [
    `Assalamu alaikum, ${name},`,
    '',
    content.subject.trim(),
    '',
    content.body.trim(),
    '',
    ctaLabel,
    ctaUrl,
    '',
    '— QuranPilot',
    SITE,
  ].join('\n');
}

export function renderUserEmailHtml(content: UserEmailContent): string {
  const c = prepared(content);
  switch (content.layout) {
    case 'letter':
      return letterHtml(c);
    case 'announcement':
      return announcementHtml(c);
    case 'reminder':
      return reminderHtml(c);
    case 'digest':
      return digestHtml(c);
    case 'invite':
      return inviteHtml(c);
    case 'focus':
      return focusHtml(c);
    case 'gratitude':
      return gratitudeHtml(c);
    default:
      return classicHtml(c);
  }
}

export const STARTER_MAIL_TEMPLATES: Array<{
  name: string;
  layout: EmailLayout;
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}> = [
  {
    name: 'Welcome',
    layout: 'classic',
    subject: 'Welcome to QuranPilot',
    body: 'Your account is ready. Read, listen, and learn tajweed in one calm place.\n\nStart with a short surah today, and return whenever you can. Consistency matters more than speed.',
    ctaLabel: 'Open QuranPilot',
    ctaUrl: 'https://quranpilot.com',
  },
  {
    name: 'Keep reading',
    layout: 'reminder',
    subject: 'A few minutes with the Quran',
    body: 'If the day has been full, even one ayah is a return.\n\nOpen QuranPilot, pick up where you left off, and read with presence.',
    ctaLabel: 'Continue reading',
    ctaUrl: 'https://quranpilot.com/surahs',
  },
  {
    name: 'What is new',
    layout: 'announcement',
    subject: 'Something new on QuranPilot',
    body: 'We wanted you to know about an update that can help your reading and practice.\n\nOpen the site to see it, and tell us what would help you next.',
    ctaLabel: 'See what is new',
    ctaUrl: 'https://quranpilot.com',
  },
  {
    name: 'A note',
    layout: 'letter',
    subject: 'A note from QuranPilot',
    body: 'We are writing with a short message for you.\n\nMay your reading be eased, and may you find a quiet moment with the Quran this week.',
    ctaLabel: 'Visit QuranPilot',
    ctaUrl: 'https://quranpilot.com',
  },
  {
    name: 'Tajweed practice',
    layout: 'focus',
    subject: 'Practice one tajweed rule today',
    body: 'Pick a single rule — ghunnah, idgham, or ikhfa — and recite a few ayahs with care.\n\nSlow reading builds clarity. QuranPilot is ready when you are.',
    ctaLabel: 'Open tajweed',
    ctaUrl: 'https://quranpilot.com/tajweed',
  },
  {
    name: 'Hifz check-in',
    layout: 'reminder',
    subject: 'How is your hifz going?',
    body: 'Memorisation grows with gentle repetition.\n\nReview a short passage you already know, then add one new ayah. Small steps stay with you.',
    ctaLabel: 'Practice hifz',
    ctaUrl: 'https://quranpilot.com/hifz',
  },
  {
    name: 'Learning plan',
    layout: 'invite',
    subject: 'Start a short learning plan',
    body: 'A guided plan can turn intention into a habit.\n\nChoose a short surah plan on QuranPilot and finish it at your own pace.',
    ctaLabel: 'Browse plans',
    ctaUrl: 'https://quranpilot.com/learning-plans',
  },
  {
    name: 'Weekly digest',
    layout: 'digest',
    subject: 'Your week with the Quran',
    body: 'Here is a gentle prompt for the week ahead: read with understanding, listen once with focus, and note one ayah that stayed with you.\n\nReturn to QuranPilot whenever you need a quiet place to begin.',
    ctaLabel: 'Open the reader',
    ctaUrl: 'https://quranpilot.com/surahs',
  },
  {
    name: 'Thank you',
    layout: 'gratitude',
    subject: 'Thank you for being with QuranPilot',
    body: 'Your presence on QuranPilot means a great deal to us.\n\nWhether you read daily or return after a pause, may the Quran bring you ease and light.',
    ctaLabel: 'Continue reading',
    ctaUrl: 'https://quranpilot.com',
  },
  {
    name: 'Share QuranPilot',
    layout: 'invite',
    subject: 'Invite someone to read with you',
    body: 'If someone you care about wants a calm place to read and listen to the Quran, share QuranPilot with them.\n\nNo install is required — it works in the browser.',
    ctaLabel: 'Open QuranPilot',
    ctaUrl: 'https://quranpilot.com',
  },
  {
    name: 'Quran in a year',
    layout: 'digest',
    subject: 'A year with the Quran',
    body: 'The Quran-in-a-year path gives a steady weekly rhythm from Ramadan to Ramadan.\n\nOpen the schedule, mark where you are, and keep going one week at a time.',
    ctaLabel: 'View the schedule',
    ctaUrl: 'https://quranpilot.com/quran-in-year',
  },
  {
    name: 'Feedback thanks',
    layout: 'gratitude',
    subject: 'We received your feedback',
    body: 'Thank you for taking the time to write to us. Your notes help us improve QuranPilot for every reader.\n\nWe read every message carefully.',
    ctaLabel: 'Back to QuranPilot',
    ctaUrl: 'https://quranpilot.com',
  },
];
