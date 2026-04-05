'use client';

import { useEffect } from 'react';
import { initLiff } from '@/lib/liff';

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize LIFF as early as possible so auth params from
    // the LIFF redirect URL are processed before the user navigates
    // to board pages. Without this, navigating from the homepage
    // to a board page loses the auth parameters.
    initLiff().catch((err) => {
      console.warn('LiffProvider: LIFF init failed (non-fatal):', err);
    });
  }, []);

  return <>{children}</>;
}
