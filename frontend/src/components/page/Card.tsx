import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CARD_BASE, CARD_INTERACTIVE } from './tokens';

type CardProps = {
  as?: 'div' | 'article' | 'section' | 'li';
  /** When set, the whole card is a link. */
  href?: string;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Base surface for every card in the app. */
export function Card({ as: Tag = 'div', href, padded = true, className, children }: CardProps) {
  const cls = cn(CARD_BASE, padded && 'p-5 sm:p-6', href && cn('group block', CARD_INTERACTIVE), className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <Tag className={cls}>{children}</Tag>;
}
