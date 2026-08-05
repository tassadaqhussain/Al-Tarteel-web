import Link from 'next/link';
import { LEARNING_PLANS } from '@/lib/learning-plans';

const PREVIEW = LEARNING_PLANS.filter((p) => p.featured).slice(0, 4);

export function StartLearning() {
  return (
    <section className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">Start Learning</h2>
        <Link
          href="/learning-plans"
          className="shrink-0 text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-[var(--accent)]"
        >
          See More
        </Link>
      </div>

      <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:gap-4 sm:px-4 md:-mx-6 md:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PREVIEW.map((plan) => (
          <Link
            key={plan.slug}
            href={`/learning-plans/${plan.slug}`}
            className={`relative flex h-40 w-[min(14rem,80vw)] shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${plan.imageTone} p-4 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:h-44 sm:w-56 md:w-64`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_45%)]" />
            <div className="relative flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-white/80">{plan.days}-day plan</span>
              <span className="rounded-full bg-sky-200 px-2 py-0.5 text-[11px] font-semibold text-sky-900">
                New!
              </span>
            </div>
            <p className="relative line-clamp-3 text-sm font-semibold leading-snug">{plan.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
