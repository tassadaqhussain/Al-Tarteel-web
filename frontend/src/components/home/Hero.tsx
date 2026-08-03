'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export function Hero() {
    const [search, setSearch] = useState('');

    return (
        <section className="relative w-full overflow-hidden bg-emerald-950 px-4 py-20 lg:py-32">
            {/* Background Pattern logic - could be CSS or Image */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, var(--accent-gold) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 to-emerald-950" />

            <div className="relative mx-auto max-w-4xl text-center">
                <h1 className="mb-6 font-arabic text-5xl font-bold text-slate-100 lg:text-7xl">
                    القرآن الكريم
                </h1>
                <p className="mb-10 text-lg text-slate-400 lg:text-xl">
                    Experience the Holy Quran with premium recitation and guidance.
                </p>

                <div className="group relative mx-auto max-w-2xl transform transition-all duration-300 hover:scale-[1.01]">
                    <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl transition-opacity group-hover:opacity-40" />
                    <div className="relative flex items-center overflow-hidden rounded-full border border-emerald-900/50 bg-emerald-900/30 px-6 py-4 backdrop-blur-md">
                        <Search className="mr-4 h-6 w-6 text-gold-500" />
                        <input
                            type="text"
                            placeholder="What surah or ayah do you want to read?"
                            className="w-full bg-transparent text-lg text-white placeholder-slate-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <kbd className="hidden rounded bg-emerald-800/50 px-2 py-1 text-xs text-slate-400 sm:block">
                            ⌘ K
                        </kbd>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                    <span>Popular:</span>
                    {['Al-Mulk', 'Ya-Sin', 'Al-Kahf', 'Al-Waqi\'ah'].map((item) => (
                        <button
                            key={item}
                            className="rounded-full border border-emerald-900/50 bg-emerald-900/20 px-3 py-1 transition hover:border-gold-500/50 hover:text-gold-500"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
