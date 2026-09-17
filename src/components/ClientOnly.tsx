'use client';

import { useEffect, useState, ReactNode } from 'react';

export function ClientOnly({ children }: { children: ReactNode; fallback?: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return <div suppressHydrationWarning>{children}</div>;
}

