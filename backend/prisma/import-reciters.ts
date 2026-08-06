/**
 * Upsert every reciter with a verified verse-by-verse CDN (SSSAAA.mp3).
 *
 * Usage:
 *   npx ts-node prisma/import-reciters.ts
 */
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();

export type ReciterSeed = {
  slug: string;
  name: string;
  nameArabic: string;
  style: string;
  /** Folder URL; server appends /SSSAAA.mp3 */
  baseUrl: string;
  /** Optional QuranCDN audio reciter ID (word timings). */
  timingId?: number;
  isDefault?: boolean;
  sortOrder: number;
};

/**
 * Sources verified with HTTP 200 on …/001001.mp3.
 * Prefer audio.qurancdn.com when available; otherwise everyayah.com.
 */
export const RECITERS: ReciterSeed[] = [
  {
    slug: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    nameArabic: 'مشاري راشد العفاسي',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Alafasy/mp3',
    timingId: 7,
    sortOrder: 1,
  },
  {
    slug: 'abdul-basit-murattal',
    name: 'Abdul Basit Abdul Samad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/AbdulBaset/Murattal/mp3',
    timingId: 2,
    isDefault: true,
    sortOrder: 2,
  },
  {
    slug: 'abdul-basit-mujawwad',
    name: 'Abdul Basit Abdul Samad',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'Mujawwad',
    baseUrl: 'https://audio.qurancdn.com/AbdulBaset/Mujawwad/mp3',
    timingId: 1,
    sortOrder: 3,
  },
  {
    slug: 'minshawi-murattal',
    name: 'Mohamed Siddiq El-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Minshawi/Murattal/mp3',
    timingId: 9,
    sortOrder: 4,
  },
  {
    slug: 'minshawi-mujawwad',
    name: 'Mohamed Siddiq El-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    style: 'Mujawwad',
    baseUrl: 'https://audio.qurancdn.com/Minshawi/Mujawwad/mp3',
    timingId: 8,
    sortOrder: 5,
  },
  {
    slug: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Husary_128kbps',
    timingId: 6,
    sortOrder: 6,
  },
  {
    slug: 'husary-mujawwad',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'Mujawwad',
    baseUrl: 'https://everyayah.com/data/Husary_Mujawwad_64kbps',
    sortOrder: 7,
  },
  {
    slug: 'husary-muallim',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'Muallim',
    baseUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps',
    timingId: 12,
    sortOrder: 8,
  },
  {
    slug: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    nameArabic: 'عبد الرحمن السديس',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Sudais/mp3',
    timingId: 3,
    sortOrder: 9,
  },
  {
    slug: 'shuraim',
    name: 'Saud Al-Shuraim',
    nameArabic: 'سعود الشريم',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Shuraym/mp3',
    timingId: 10,
    sortOrder: 10,
  },
  {
    slug: 'rifai',
    name: 'Hani Ar-Rifai',
    nameArabic: 'هاني الرفاعي',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Rifai/mp3',
    timingId: 5,
    sortOrder: 11,
  },
  {
    slug: 'shaatree',
    name: 'Abu Bakr Ash-Shaatree',
    nameArabic: 'أبو بكر الشاطري',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps',
    timingId: 4,
    sortOrder: 12,
  },
  {
    slug: 'jibreel',
    name: 'Muhammad Jibreel',
    nameArabic: 'محمد جبريل',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Jibreel/mp3',
    sortOrder: 13,
  },
  {
    slug: 'tunaiji',
    name: 'Khalifah Al-Tunaiji',
    nameArabic: 'خليفة الطنيجي',
    style: 'Murattal',
    baseUrl: 'https://audio.qurancdn.com/Tunaiji/mp3',
    timingId: 161,
    sortOrder: 14,
  },
  {
    slug: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    nameArabic: 'سعد الغامدي',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Ghamadi_40kbps',
    sortOrder: 15,
  },
  {
    slug: 'ajamy',
    name: 'Ahmad Al-Ajamy',
    nameArabic: 'أحمد العجمي',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    sortOrder: 16,
  },
  {
    slug: 'muaiqly',
    name: 'Maher Al-Muaiqly',
    nameArabic: 'ماهر المعيقلي',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps',
    sortOrder: 17,
  },
  {
    slug: 'hudhaify',
    name: 'Ali Al-Hudhaify',
    nameArabic: 'علي الحذيفي',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Hudhaify_128kbps',
    sortOrder: 18,
  },
  {
    slug: 'ayyoub',
    name: 'Muhammad Ayyoub',
    nameArabic: 'محمد أيوب',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Muhammad_Ayyoub_128kbps',
    sortOrder: 19,
  },
  {
    slug: 'basfar',
    name: 'Abdullah Basfar',
    nameArabic: 'عبد الله بصفر',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Abdullah_Basfar_192kbps',
    sortOrder: 20,
  },
  {
    slug: 'dussary',
    name: 'Yasser Ad-Dussary',
    nameArabic: 'ياسر الدوسري',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps',
    timingId: 97,
    sortOrder: 21,
  },
  {
    slug: 'alqatami',
    name: 'Nasser Al-Qatami',
    nameArabic: 'ناصر القطامي',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Nasser_Alqatami_128kbps',
    sortOrder: 22,
  },
  {
    slug: 'juhaynee',
    name: 'Abdullah Awwad Al-Juhaynee',
    nameArabic: 'عبد الله عواد الجهني',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    sortOrder: 23,
  },
  {
    slug: 'ali-jaber',
    name: 'Ali Jaber',
    nameArabic: 'علي جابر',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Ali_Jaber_64kbps',
    sortOrder: 24,
  },
  {
    slug: 'fares-abbad',
    name: 'Fares Abbad',
    nameArabic: 'فارس عباد',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Fares_Abbad_64kbps',
    sortOrder: 25,
  },
  {
    slug: 'budair',
    name: 'Salah Al-Budair',
    nameArabic: 'صلاح البدير',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Salah_Al_Budair_128kbps',
    sortOrder: 26,
  },
  {
    slug: 'muhsin-qasim',
    name: 'Muhsin Al-Qasim',
    nameArabic: 'محسن القاسم',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Muhsin_Al_Qasim_192kbps',
    sortOrder: 27,
  },
  {
    slug: 'tablawi',
    name: 'Mohamed Al-Tablawi',
    nameArabic: 'محمد الطبلاوي',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Mohammad_al_Tablaway_128kbps',
    timingId: 11,
    sortOrder: 28,
  },
  {
    slug: 'mustafa-ismail',
    name: 'Mustafa Ismail',
    nameArabic: 'مصطفى إسماعيل',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Mustafa_Ismail_48kbps',
    sortOrder: 29,
  },
  {
    slug: 'matroud',
    name: 'Abdullah Matroud',
    nameArabic: 'عبد الله المطرود',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Abdullah_Matroud_128kbps',
    sortOrder: 30,
  },
  {
    slug: 'neana',
    name: 'Ahmed Neana',
    nameArabic: 'أحمد نعينع',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Ahmed_Neana_128kbps',
    sortOrder: 31,
  },
  {
    slug: 'akhdar',
    name: 'Ibrahim Al-Akhdar',
    nameArabic: 'إبراهيم الأخضر',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Ibrahim_Akhdar_32kbps',
    sortOrder: 32,
  },
  {
    slug: 'parhizgar',
    name: 'Shahriar Parhizgar',
    nameArabic: 'شهريار پرهیزگار',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Parhizgar_48kbps',
    sortOrder: 33,
  },
  {
    slug: 'ayman-sowaid',
    name: 'Ayman Sowaid',
    nameArabic: 'أيمن سويد',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Ayman_Sowaid_64kbps',
    sortOrder: 34,
  },
  {
    slug: 'sahl-yassin',
    name: 'Sahl Yassin',
    nameArabic: 'سهل ياسين',
    style: 'Murattal',
    baseUrl: 'https://everyayah.com/data/Sahl_Yassin_128kbps',
    sortOrder: 35,
  },
  {
    slug: 'warsh-abdul-basit',
    name: 'Abdul Basit (Warsh)',
    nameArabic: 'عبد الباسط (ورش)',
    style: 'Warsh',
    baseUrl: 'https://everyayah.com/data/warsh/warsh_Abdul_Basit_128kbps',
    sortOrder: 36,
  },
  {
    slug: 'warsh-aldosary',
    name: 'Ibrahim Al-Dosary (Warsh)',
    nameArabic: 'إبراهيم الدوسري (ورش)',
    style: 'Warsh',
    baseUrl: 'https://everyayah.com/data/warsh/warsh_ibrahim_aldosary_128kbps',
    sortOrder: 37,
  },
  {
    slug: 'warsh-yassin',
    name: 'Yassin Al-Jazaery (Warsh)',
    nameArabic: 'ياسين الجزائري (ورش)',
    style: 'Warsh',
    baseUrl: 'https://everyayah.com/data/warsh/warsh_yassin_al_jazaery_64kbps',
    sortOrder: 38,
  },
];

/** Exported for audio.service timing map sync. */
export const RECITER_TIMING_IDS: Record<string, number> = Object.fromEntries(
  RECITERS.filter((r) => r.timingId != null).map((r) => [r.slug, r.timingId!]),
);

export function verseAudioUrl(baseUrl: string, surahNumber: number, ayahNumber: number) {
  const file = `${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
  return `${baseUrl.replace(/\/$/, '')}/${file}`;
}

async function clearReciterCache() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6381';
  try {
    const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
    await redis.connect();
    await redis.del('audio:reciters');
    await redis.quit();
    console.log('Cleared audio:reciters cache');
  } catch {
    console.log('Redis cache skip (not available)');
  }
}

async function main() {
  console.log(`Upserting ${RECITERS.length} reciters...`);

  // Ensure only one default
  await prisma.reciter.updateMany({ data: { isDefault: false } });

  for (const reciter of RECITERS) {
    await prisma.reciter.upsert({
      where: { slug: reciter.slug },
      update: {
        name: reciter.name,
        nameArabic: reciter.nameArabic,
        style: reciter.style,
        baseUrl: reciter.baseUrl,
        isDefault: Boolean(reciter.isDefault),
        sortOrder: reciter.sortOrder,
      },
      create: {
        name: reciter.name,
        nameArabic: reciter.nameArabic,
        slug: reciter.slug,
        style: reciter.style,
        baseUrl: reciter.baseUrl,
        isDefault: Boolean(reciter.isDefault),
        sortOrder: reciter.sortOrder,
      },
    });
    console.log(`  ✓ ${reciter.name} — ${reciter.style} (${reciter.slug})`);
  }

  await clearReciterCache();
  const count = await prisma.reciter.count();
  console.log(`Done. Total reciters in DB: ${count}`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
