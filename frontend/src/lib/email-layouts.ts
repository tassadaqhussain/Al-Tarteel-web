export const EMAIL_LAYOUTS = [
  { id: 'classic', label: 'Classic', hint: 'Green header' },
  { id: 'letter', label: 'Letter', hint: 'Simple note' },
  { id: 'announcement', label: 'Announcement', hint: 'Bold update' },
  { id: 'reminder', label: 'Reminder', hint: 'Short nudge' },
  { id: 'digest', label: 'Digest', hint: 'Weekly roundup' },
  { id: 'invite', label: 'Invite', hint: 'Share & join' },
  { id: 'focus', label: 'Focus', hint: 'Minimal & clear' },
  { id: 'gratitude', label: 'Gratitude', hint: 'Thank-you note' },
] as const;

export type EmailLayoutId = (typeof EMAIL_LAYOUTS)[number]['id'];
