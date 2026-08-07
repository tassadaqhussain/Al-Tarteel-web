'use client';

import { Headphones } from 'lucide-react';

const RECITERS = [
  { name: 'Mishary Rashid Alafasy', desc: 'Renowned Kuwaiti Reciter' },
  { name: 'Abdul Rahman Al-Sudais', desc: 'Chief Imam of Grand Mosque' },
  { name: 'Abdul Basit Abdus Samad', desc: 'Golden Voice from Egypt' },
  { name: 'Yasser Al-Dosari', desc: 'Imam of Masjid al-Haram' },
  { name: 'Abdul Aziz Bin Bandar Balila', desc: 'Imam of Masjid al-Haram' },
  { name: 'Abdur Rahman Al-Ousi', desc: 'Imam and Reciter' },
];

export function RecitersSection() {
  return (
    <section className="w-full bg-white py-16 px-4 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        {/* Section Header */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Enjoy Holy Quran recited <br className="sm:hidden" />
            <span className="text-emerald-800">by your preferred reciters.</span>
          </h2>
        </div>

        {/* Reciters Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RECITERS.map((r, idx) => (
            <div
              key={r.name}
              className="group relative flex flex-col items-center rounded-3xl border border-slate-100 bg-[#f0fdfa]/40 p-6 text-center transition-all duration-300 hover:bg-[#f0fdfa]/80 hover:shadow-md hover:-translate-y-1"
            >
              {/* Avatar Container */}
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow-md transition group-hover:scale-105">
                <img
                  src="/images/reciter_avatar.png"
                  alt={r.name}
                  className="h-full w-full object-cover"
                />
                
                {/* Overlay listen badge */}
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 opacity-0 transition group-hover:opacity-100">
                  <Headphones className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>

              {/* Text metadata */}
              <h3 className="font-bold text-slate-800 transition group-hover:text-emerald-850">
                {r.name}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
