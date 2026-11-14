import { cn } from '@/lib/utils';

/** Shared fluid content column — fits all screen sizes with responsive horizontal padding. */
export const SITE_SHELL =
  'mx-auto w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20';

/** Wider site chrome — aligns horizontally with SITE_SHELL across all screens. */
export const CHROME_SHELL =
  'mx-auto w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20';

/** Mushaf reading column — fluid across all screens with comfortable side inset. */
export const READER_SHELL =
  'mx-auto w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20';

/** Sticky reader context bar — aligns with READER_SHELL. */
export const READER_BAR_SHELL =
  'mx-auto w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20';

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
