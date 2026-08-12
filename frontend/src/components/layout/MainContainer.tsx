import { cn } from '@/lib/utils';

type MainContainerProps = {
  as?: 'div' | 'section' | 'main' | 'article';
  id?: string;
  className?: string;
  children: React.ReactNode;
};

/** Centered content column — matches header/footer max width (1200px). */
export function MainContainer({ as: Tag = 'div', id, className, children }: MainContainerProps) {
  return (
    <Tag id={id} className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6', className)}>
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
    <section id={id} className={cn('w-full py-10 sm:py-12', className)}>
      <MainContainer className={containerClassName}>{children}</MainContainer>
    </section>
  );
}
