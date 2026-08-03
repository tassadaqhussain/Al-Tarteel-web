import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Quran.com API base
const API_BASE = 'https://api.quran.com/api/v4';

async function downloadFullQuran() {
    console.log('--- Starting Full Quran Download ---');

    try {
        // 1. Get all chapters (Surahs) metadata
        console.log('Fetching Surahs list...');
        const chaptersRes = await axios.get(`${API_BASE}/chapters?language=en`);
        const chapters = chaptersRes.data.chapters;
        console.log(`Found ${chapters.length} chapters.`);

        for (const ch of chapters) {
            console.log(`Processing Surah ${ch.id}: ${ch.name_simple}...`);

            // Upsert Surah metadata
            const surah = await prisma.surah.upsert({
                where: { number: ch.id },
                update: {
                    nameArabic: ch.name_arabic,
                    nameSimple: ch.name_simple,
                    nameComplex: ch.name_complex,
                    revelationPlace: ch.revelation_place,
                    revelationOrder: ch.revelation_order,
                    numberOfAyahs: ch.verses_count,
                },
                create: {
                    number: ch.id,
                    nameArabic: ch.name_arabic,
                    nameSimple: ch.name_simple,
                    nameComplex: ch.name_complex,
                    revelationPlace: ch.revelation_place,
                    revelationOrder: ch.revelation_order,
                    numberOfAyahs: ch.verses_count,
                }
            });

            // 2. Fetch all Ayahs for this Surah with Uthmani text
            // Note: We use per_page=large to get all ayahs in one or few calls
            console.log(`  Downloading ayahs for ${ch.name_simple}...`);
            const versesRes = await axios.get(`${API_BASE}/quran/verses/uthmani?chapter_number=${ch.id}`);
            const verses = versesRes.data.verses;

            for (const v of verses) {
                // verse_key is e.g. "1:1"
                const [sNum, vNum] = v.verse_key.split(':').map(Number);

                await prisma.ayah.upsert({
                    where: {
                        surahId_number: {
                            surahId: surah.id,
                            number: vNum
                        }
                    },
                    update: {
                        textUthmani: v.text_uthmani,
                    },
                    create: {
                        surahId: surah.id,
                        number: vNum,
                        numberInQuran: 0, // We could calculate this or fetch from another endpoint if needed
                        juz: 0,
                        hizb: 0,
                        ruku: 0,
                        page: 0,
                        textUthmani: v.text_uthmani,
                    }
                });
            }
            console.log(`  Done with Surah ${ch.id}.`);
        }

        console.log('--- Quran Download Complete! ---');
    } catch (error) {
        console.error('Error downloading Quran data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

downloadFullQuran();
