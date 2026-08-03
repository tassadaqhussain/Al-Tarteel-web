'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Lightweight scroll area wrapper (no Radix dependency needed for basic use)
const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('overflow-auto', className)}
    style={{ scrollbarWidth: 'thin' }}
    {...props}
  >
    {children}
  </div>
));
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
