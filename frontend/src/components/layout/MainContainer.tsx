import { cn } from '@/lib/utils';

/** Shared content column — keep marketing/home sections composed on wide displays. */
export const SITE_SHELL =
  'mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8';

/** Wider site chrome — avoids oversized blank bands around navigation and footer. */
export const CHROME_SHELL =
  'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 2xl:px-12';

/** Mushaf reading column — matches the Quran.com chapter shell (~48px side inset). */
export const READER_SHELL = 'mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12';

/** Sticky reader context bar — slightly tighter inset than the reading column. */
export const READER_BAR_SHELL = 'mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10';

type MainContainerProps = {
  as?: 'div' | 'section' | 'main' | 'article';
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/** Centered content column — matches header/footer max width. */
export function MainContainer({ as: Tag = 'div', id, className, children }: MainContainerProps) {
  return (
    <Tag id={id} className={cn(SITE_SHELL, className)}>
      {children}
    </Tag>
  );
}

type PageSectionProps = {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
};

/** Full-width section with contained inner content and consistent vertical rhythm. */
export function PageSection({ id, className, containerClassName, children }: PageSectionProps) {
  return (
    <section id={id} className={cn('w-full py-10 sm:py-12 2xl:py-16', className)}>
      <MainContainer className={containerClassName}>{children}</MainContainer>
    </section>
  );
}
