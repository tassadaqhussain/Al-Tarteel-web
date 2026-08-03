'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Surah {
    number: number;
    nameSimple: string;
    nameArabic: string;
    numberOfAyahs: number;
}

export function SurahGrid({ surahs }: { surahs: Surah[] }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Surahs</h2>
                    <p className="text-slate-500">Explore all 114 surahs of the Holy Quran</p>
                </div>
                <button className="text-sm font-medium text-gold-500 hover:text-gold-600">
                    View All →
                </button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
                {surahs.map((surah) => (
                    <motion.div key={surah.number} variants={item}>
                        <Link
                            href={`/surah/${surah.number}`}
                            className="group relative flex items-center gap-5 rounded-2xl border border-emerald-900/30 bg-emerald-900/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:bg-emerald-900/20"
                        >
                            <div className="relative flex h-12 w-12 flex-none items-center justify-center">
                                <div className="absolute inset-0 rotate-45 rounded-lg border border-gold-500/20 bg-gold-500/5 transition-colors group-hover:bg-gold-500/10" />
                                <span className="relative text-sm font-bold text-gold-500">
                                    {surah.number}
                                </span>
                            </div>

                            <div className="flex flex-1 items-center justify-between overflow-hidden">
                                <div className="overflow-hidden">
                                    <h3 className="truncate font-bold text-slate-200 group-hover:text-gold-500">
                                        {surah.nameSimple}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {surah.numberOfAyahs} Ayahs
                                    </p>
                                </div>
                                <div className="font-arabic text-xl text-slate-400 transition-colors group-hover:text-slate-100">
                                    {surah.nameArabic}
                                </div>
                            </div>

                            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-gold-500/0 to-gold-500/0 opacity-0 transition-opacity duration-500 group-hover:from-gold-500/5 group-hover:to-transparent group-hover:opacity-100" />
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
