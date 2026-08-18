import Image from 'next/image';
import { cn } from '@/lib/utils';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
};

/** Optimized site logo — always reserve square dimensions to avoid CLS. */
export function SiteLogo({ size = 28, className, priority = false, alt = 'QuranPilot' }: Props) {
  return (
    <Image
      src="/images/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      priority={priority}
      quality={95}
      sizes={`${Math.max(size, 32) * 2}px`}
    />
  );
}
